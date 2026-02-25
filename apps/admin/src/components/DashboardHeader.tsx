import Link from "next/link";

interface DashboardHeaderProps {
  email?: string;
}

export function DashboardHeader({ email }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-zinc-200 bg-white/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <Link
        href="/dashboard"
        className="text-lg font-semibold tracking-tight text-zinc-900 hover:text-indigo-600 transition"
      >
        Nexora
      </Link>
      {email && (
        <span className="text-sm text-zinc-500 truncate max-w-[200px]">
          {email}
        </span>
      )}
    </header>
  );
}
