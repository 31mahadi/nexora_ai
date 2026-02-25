import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Super Admin - Nexora",
  description: "SaaS owner dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-zinc-50">
        <div className="flex">
          <aside className="w-64 shrink-0 border-r border-zinc-200 bg-white min-h-screen">
            <div className="p-6">
              <Link href="/" className="text-lg font-bold text-indigo-600 hover:text-indigo-500">
                Nexora
              </Link>
              <span className="block text-xs text-zinc-500 mt-1">Super Admin</span>
            </div>
            <nav className="px-4 space-y-1">
              <Link
                href="/"
                className="block px-4 py-2 rounded-lg text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900"
              >
                Overview
              </Link>
              <Link
                href="#"
                className="block px-4 py-2 rounded-lg text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
              >
                Tenants
              </Link>
              <Link
                href="#"
                className="block px-4 py-2 rounded-lg text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
              >
                Subscriptions
              </Link>
              <Link
                href="#"
                className="block px-4 py-2 rounded-lg text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
              >
                Revenue
              </Link>
              <Link
                href="#"
                className="block px-4 py-2 rounded-lg text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
              >
                System Logs
              </Link>
            </nav>
          </aside>
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
