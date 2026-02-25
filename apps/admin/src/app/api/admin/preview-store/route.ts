import { requireTenantAdmin } from "@/lib/auth";
import { type NextRequest, NextResponse } from "next/server";

/** In-memory store for preview configs. Token -> { settings, theme, expiresAt } */
const previewStore = new Map<
  string,
  { settings: Record<string, unknown>; theme: { primary: string; accent: string }; expiresAt: number }
>();

const TTL_MS = 5 * 60 * 1000; // 5 minutes

function generateToken(): string {
  return `preview-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export async function POST(request: NextRequest) {
  try {
    await requireTenantAdmin();
    const body = await request.json();
    const settings = body?.settings ?? {};
    const theme =
      body?.theme && typeof body.theme === "object"
        ? {
            primary: String(body.theme.primary ?? "#0f172a"),
            accent: String(body.theme.accent ?? "#6366f1"),
          }
        : { primary: "#0f172a", accent: "#6366f1" };

    const token = generateToken();
    previewStore.set(token, {
      settings: { portfolioSite: settings },
      theme,
      expiresAt: Date.now() + TTL_MS,
    });

    // Prune expired entries
    for (const [k, v] of previewStore.entries()) {
      if (v.expiresAt < Date.now()) previewStore.delete(k);
    }

    return NextResponse.json({ token });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const entry = previewStore.get(token);
  if (!entry || entry.expiresAt < Date.now()) {
    return NextResponse.json({ error: "Not found or expired" }, { status: 404 });
  }

  return NextResponse.json({
    settings: entry.settings,
    theme: entry.theme,
  });
}
