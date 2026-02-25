"use client";

import { Badge, Button, Card, Input } from "@nexora/ui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";

function toRole(value: unknown): "super-admin" | "tenant-admin" | "user" {
  if (value === "super-admin" || value === "tenant-admin") return value;
  return "user";
}

function getReadableErrorMessage(value: unknown): string {
  if (typeof value === "string" && value.trim()) return value;
  if (value instanceof Error && value.message.trim()) return value.message;

  if (typeof value === "object" && value !== null) {
    const maybeMessage = Reflect.get(value, "message");
    if (typeof maybeMessage === "string" && maybeMessage.trim() && maybeMessage !== "[object Event]") {
      return maybeMessage;
    }

    const maybeError = Reflect.get(value, "error");
    if (typeof maybeError === "string" && maybeError.trim()) {
      return maybeError;
    }
  }

  return "Sign-in failed. Check Supabase URL/key and your network, then try again.";
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin31@nexora.dev");
  const [password, setPassword] = useState("NexoraPass!123");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(getReadableErrorMessage(signInError));
        return;
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) {
        setError(getReadableErrorMessage(userError));
        return;
      }

      const meta = user?.app_metadata as { role?: unknown; tenant_id?: string } | undefined;
      const role = toRole(meta?.role);
      if (role !== "tenant-admin" || !meta?.tenant_id) {
        setError("Access denied: tenant-admin account required.");
        await supabase.auth.signOut();
        return;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch (err) {
      setError(getReadableErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-[calc(100vh-65px)] items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="inline-block text-2xl font-bold tracking-tight text-indigo-600 hover:text-indigo-500 transition"
          >
            Nexora
          </Link>
          <p className="mt-3 text-sm text-zinc-600">
            Sign in to manage your portfolio
          </p>
        </div>

        <Card variant="elevated" className="border border-zinc-200 bg-white shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
            {error && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-600">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Sign up
            </Link>
          </p>
        </Card>
      </div>
    </main>
  );
}
