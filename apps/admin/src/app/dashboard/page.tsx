import { Badge, Card } from "@nexora/ui";
import Link from "next/link";
import { requireTenantAdmin } from "@/lib/auth";
import {
  Eye,
  FileText,
  GitBranch,
  ArrowRight,
  User,
  Plus,
  Calendar,
} from "lucide-react";

const BLOG_MS = process.env.BLOG_MS_URL ?? "http://localhost:3007";
const TIMELINE_MS = process.env.TIMELINE_MS_URL ?? "http://localhost:3008";

async function getCounts(tenantId: string) {
  const headers = { "x-tenant-id": tenantId };
  const [blogCount, timelineCount] = await Promise.all([
    fetch(`${BLOG_MS}/blogs`, { headers, cache: "no-store" })
      .then((res) => (res.ok ? res.json() : []))
      .then((rows) => (Array.isArray(rows) ? rows.length : 0))
      .catch(() => 0),
    fetch(`${TIMELINE_MS}/timeline/admin`, { headers, cache: "no-store" })
      .then((res) => (res.ok ? res.json() : []))
      .then((rows) => (Array.isArray(rows) ? rows.length : 0))
      .catch(() => 0),
  ]);
  return { blogCount, timelineCount };
}

const quickActions = [
  { href: "/dashboard/profile", label: "Edit profile", icon: User },
  { href: "/dashboard/blogs/new", label: "New blog post", icon: Plus },
  { href: "/dashboard/timeline/new", label: "Add timeline event", icon: Calendar },
] as const;

export default async function DashboardPage() {
  const auth = await requireTenantAdmin();
  const { blogCount, timelineCount } = await getCounts(auth.tenantId!);

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-zinc-600">
          Overview of your portfolio ({auth.email})
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card variant="elevated" className="border border-zinc-200 bg-white">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 text-zinc-500">
                <Eye className="h-4 w-4" aria-hidden />
                <span className="text-sm font-medium">Portfolio views</span>
              </div>
              <p className="mt-2 text-2xl font-bold tabular-nums text-zinc-900">—</p>
            </div>
            <Badge variant="default" className="shrink-0">Coming soon</Badge>
          </div>
        </Card>
        <Card variant="elevated" className="border border-zinc-200 bg-white">
          <div className="flex items-center gap-2 text-zinc-500">
            <FileText className="h-4 w-4" aria-hidden />
            <span className="text-sm font-medium">Blog posts</span>
          </div>
          <p className="mt-2 text-2xl font-bold tabular-nums text-zinc-900">{blogCount}</p>
        </Card>
        <Card variant="elevated" className="border border-zinc-200 bg-white">
          <div className="flex items-center gap-2 text-zinc-500">
            <GitBranch className="h-4 w-4" aria-hidden />
            <span className="text-sm font-medium">Timeline events</span>
          </div>
          <p className="mt-2 text-2xl font-bold tabular-nums text-zinc-900">{timelineCount}</p>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card variant="outlined" className="border-zinc-200">
          <h2 className="font-semibold text-zinc-900">Quick actions</h2>
          <p className="mt-1 text-sm text-zinc-600">Jump to common tasks</p>
          <div className="mt-4 space-y-2">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50/50 px-4 py-3 text-sm font-medium text-zinc-700 transition-colors hover:border-zinc-300 hover:bg-zinc-100"
                >
                  <span className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-zinc-400" aria-hidden />
                    {action.label}
                  </span>
                  <ArrowRight className="h-4 w-4 text-zinc-400" aria-hidden />
                </Link>
              );
            })}
          </div>
        </Card>
        <Card variant="outlined" className="border-zinc-200">
          <h2 className="font-semibold text-zinc-900">Subscription</h2>
          <p className="mt-1 text-sm text-zinc-600">
            Manage your plan and billing. Phase 4 integration.
          </p>
          <Badge variant="warning" className="mt-4">Starter</Badge>
        </Card>
      </div>
    </div>
  );
}
