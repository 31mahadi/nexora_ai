"use client";

import { Badge, Button, Card, Input } from "@nexora/ui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";

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
  const [email, setEmail] = useState("owner@nexora.dev");
  const [password, setPassword] = useState("NexoraPass!123");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    let signInErrorMessage: string | null = null;
    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      signInErrorMessage = signInError ? getReadableErrorMessage(signInError) : null;
    } catch (err) {
      signInErrorMessage = getReadableErrorMessage(err);
    }

    setLoading(false);
    if (signInErrorMessage) {
      setError(signInErrorMessage);
      return;
    }
    router.replace("/");
    router.refresh();
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-indigo-600 hover:text-indigo-500">
            Nexora
          </Link>
          <Badge variant="default" className="mt-4">
            Super Admin Sign in
          </Badge>
        </div>

        <Card variant="elevated" className="bg-white border border-zinc-200">
          <form onSubmit={handleSubmit} className="space-y-4">
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
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </Card>
      </div>
    </main>
  );
}
