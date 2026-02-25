import { requireTenantAdmin } from "@/lib/auth";
import { DashboardHeader } from "@/components/DashboardHeader";
import { DashboardNav } from "@/components/DashboardNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await requireTenantAdmin();

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader email={auth.email} />
      <div className="flex flex-1">
        <DashboardNav />
        <main className="min-w-0 flex-1 bg-zinc-50 p-6">{children}</main>
      </div>
    </div>
  );
}
