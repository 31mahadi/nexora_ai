import { Badge, Card } from "@nexora/ui";
import { requireSuperAdmin } from "@/lib/auth";

const API_GATEWAY = process.env.API_GATEWAY_URL ?? "http://localhost:4000";

interface ActiveSubscription {
  tenantSubdomain: string;
  tenantName: string;
  planName: string;
  status: string;
  currentPeriodEnd: string;
}

async function getSeedSubscription(): Promise<ActiveSubscription | null> {
  const res = await fetch(`${API_GATEWAY}/admin/subscriptions/active/31mahadi`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json() as Promise<ActiveSubscription>;
}

export default async function SuperAdminHome() {
  const auth = await requireSuperAdmin();
  const seedSubscription = await getSeedSubscription();

  return (
    <main className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">Overview</h1>
        <p className="text-zinc-600 mt-1">Platform health and key metrics ({auth.email})</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card variant="elevated" className="bg-white border border-zinc-200">
          <p className="text-sm text-zinc-600">Total tenants</p>
          <p className="text-3xl font-bold text-zinc-900 mt-2">{seedSubscription ? "1" : "0"}</p>
        </Card>
        <Card variant="elevated" className="bg-white border border-zinc-200">
          <p className="text-sm text-zinc-600">Active subscriptions</p>
          <p className="text-3xl font-bold text-zinc-900 mt-2">{seedSubscription ? "1" : "0"}</p>
        </Card>
        <Card variant="elevated" className="bg-white border border-zinc-200">
          <p className="text-sm text-zinc-600">MRR</p>
          <p className="text-3xl font-bold text-zinc-900 mt-2">$0</p>
        </Card>
        <Card variant="elevated" className="bg-white border border-zinc-200">
          <p className="text-sm text-zinc-600">AI tokens used</p>
          <p className="text-3xl font-bold text-zinc-900 mt-2">0</p>
        </Card>
      </div>

      <Card variant="outlined" className="border-zinc-200 mb-8">
        <h2 className="font-semibold text-zinc-900 mb-4">Seed tenant subscription (31mahadi)</h2>
        {seedSubscription ? (
          <div className="space-y-2 text-sm text-zinc-700">
            <p>
              Tenant: <span className="text-zinc-900 font-medium">{seedSubscription.tenantName}</span> (
              {seedSubscription.tenantSubdomain})
            </p>
            <p>
              Plan: <span className="text-zinc-900 font-medium">{seedSubscription.planName}</span>
            </p>
            <p>
              Status: <span className="text-emerald-600">{seedSubscription.status}</span>
            </p>
            <p>
              Current period ends:{" "}
              <span className="text-zinc-900 font-medium">
                {new Date(seedSubscription.currentPeriodEnd).toLocaleDateString()}
              </span>
            </p>
          </div>
        ) : (
          <p className="text-zinc-600 text-sm">
            Subscription not found yet. Run migrations/seeding and ensure gateway route is up.
          </p>
        )}
      </Card>

      <Card variant="outlined" className="border-zinc-200 mb-8">
        <h2 className="font-semibold text-zinc-900 mb-4">Recent tenants</h2>
        <div className="text-zinc-500 text-sm py-8 text-center">
          No tenants yet. Phase 2+ integration.
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card variant="outlined" className="border-zinc-200">
          <h2 className="font-semibold text-zinc-900 mb-4">System status</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-zinc-600">API Gateway</span>
              <Badge variant="success">Healthy</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-600">Auth MS</span>
              <Badge variant="success">Healthy</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-600">Tenant MS</span>
              <Badge variant="success">Healthy</Badge>
            </div>
          </div>
        </Card>
        <Card variant="outlined" className="border-zinc-200">
          <h2 className="font-semibold text-zinc-900 mb-4">Feature flags</h2>
          <p className="text-zinc-600 text-sm">Plan-based feature gating. Configure in Phase 4.</p>
          <Badge variant="default" className="mt-4">
            All default
          </Badge>
        </Card>
      </div>
    </main>
  );
}
