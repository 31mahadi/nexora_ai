import type { UserRole } from "@nexora/types";
import { redirect } from "next/navigation";
import { createClient } from "./supabase-server";

export async function getServerSession() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

export interface AdminAuthContext {
  userId: string;
  email: string;
  role: UserRole;
  tenantId?: string;
}

function toRole(value: unknown): UserRole {
  if (value === "super-admin" || value === "tenant-admin") return value;
  return "user";
}

export async function getServerAuthContext(): Promise<AdminAuthContext | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const meta = user.app_metadata as { role?: unknown; tenant_id?: string } | undefined;
  return {
    userId: user.id,
    email: user.email ?? "",
    role: toRole(meta?.role),
    tenantId: meta?.tenant_id,
  };
}

export async function requireTenantAdmin(): Promise<AdminAuthContext> {
  const context = await getServerAuthContext();
  if (!context) redirect("/login");
  if (context.role !== "tenant-admin" || !context.tenantId) redirect("/");
  return context;
}
