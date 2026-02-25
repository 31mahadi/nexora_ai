import { createClient } from "@supabase/supabase-js";
import { Client } from "pg";

type SeedRole = "super-admin" | "tenant-admin" | "user";
type SeedUser = {
  email: string;
  password: string;
  role: SeedRole;
  tenantSubdomain?: string;
  setAsTenantOwner?: boolean;
};

const seedUsers: SeedUser[] = [
  {
    email: "owner@nexora.dev",
    password: "NexoraPass!123",
    role: "super-admin",
  },
  {
    email: "admin31@nexora.dev",
    password: "NexoraPass!123",
    role: "tenant-admin",
    tenantSubdomain: "31mahadi",
    setAsTenantOwner: true,
  },
  {
    email: "adminfarhana@nexora.dev",
    password: "NexoraPass!123",
    role: "tenant-admin",
    tenantSubdomain: "farhana",
    setAsTenantOwner: true,
  },
  {
    email: "user31@nexora.dev",
    password: "NexoraPass!123",
    role: "user",
    tenantSubdomain: "31mahadi",
  },
];

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

async function findUserByEmail(
  supabase: ReturnType<typeof createClient>,
  email: string,
) {
  let page = 1;
  const perPage = 200;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw error;

    const found = data.users.find(
      (user) => user.email?.toLowerCase() === email.toLowerCase(),
    );
    if (found) return found;
    if (data.users.length < perPage) return null;

    page += 1;
  }
}

async function main() {
  const supabaseUrl = requireEnv("SUPABASE_URL");
  const supabaseServiceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  const databaseUrl = requireEnv("DATABASE_URL");

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { persistSession: false },
  });

  const db = new Client({ connectionString: databaseUrl });
  await db.connect();

  try {
    await db.query("BEGIN");

    const tenantRows = await db.query<{ id: string; subdomain: string }>(
      "SELECT id, subdomain FROM tenants WHERE subdomain = ANY($1::text[])",
      [Array.from(new Set(seedUsers.map((u) => u.tenantSubdomain).filter(Boolean)))],
    );
    const tenantBySubdomain = new Map(
      tenantRows.rows.map((row) => [row.subdomain, row.id]),
    );

    for (const user of seedUsers) {
      const tenantId = user.tenantSubdomain
        ? tenantBySubdomain.get(user.tenantSubdomain)
        : undefined;

      if (user.tenantSubdomain && !tenantId) {
        throw new Error(`Missing tenant "${user.tenantSubdomain}" in local DB`);
      }

      const appMetadata = tenantId
        ? { role: user.role, tenant_id: tenantId }
        : { role: user.role };

      const existing = await findUserByEmail(supabase, user.email);
      let supabaseUserId: string;

      if (existing) {
        const { error } = await supabase.auth.admin.updateUserById(existing.id, {
          password: user.password,
          email_confirm: true,
          app_metadata: appMetadata,
        });
        if (error) throw error;
        supabaseUserId = existing.id;
      } else {
        const { data, error } = await supabase.auth.admin.createUser({
          email: user.email,
          password: user.password,
          email_confirm: true,
          app_metadata: appMetadata,
        });
        if (error) throw error;
        if (!data.user?.id) {
          throw new Error(`Supabase user creation returned no id for ${user.email}`);
        }
        supabaseUserId = data.user.id;
      }

      await db.query(
        `
          INSERT INTO users (supabase_user_id, email, role, tenant_id, status)
          VALUES ($1, $2, $3, $4, 'active')
          ON CONFLICT (email) DO UPDATE SET
            supabase_user_id = EXCLUDED.supabase_user_id,
            role = EXCLUDED.role,
            tenant_id = EXCLUDED.tenant_id,
            status = 'active',
            updated_at = NOW()
        `,
        [supabaseUserId, user.email, user.role, tenantId ?? null],
      );

      if (user.setAsTenantOwner && tenantId) {
        await db.query(
          "UPDATE tenants SET owner_id = $1, updated_at = NOW() WHERE id = $2",
          [supabaseUserId, tenantId],
        );
      }

      console.log(`Seeded ${user.email} (${user.role})`);
    }

    await db.query("COMMIT");
    console.log("Auth users seeded in Supabase + local DB.");
  } catch (error) {
    await db.query("ROLLBACK");
    throw error;
  } finally {
    await db.end();
  }
}

main().catch((error) => {
  console.error("Failed to seed auth users:", error);
  process.exit(1);
});
