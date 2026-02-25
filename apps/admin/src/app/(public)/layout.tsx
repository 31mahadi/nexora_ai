import Link from "next/link";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-zinc-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="text-xl font-bold text-indigo-600 hover:text-indigo-500 transition"
          >
            Nexora Admin
          </Link>
          <div className="flex gap-6">
            <Link
              href="/dashboard"
              className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition"
            >
              Dashboard
            </Link>
            <Link
              href="/login"
              className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition"
            >
              Sign up
            </Link>
          </div>
        </div>
      </nav>
      {children}
    </>
  );
}
