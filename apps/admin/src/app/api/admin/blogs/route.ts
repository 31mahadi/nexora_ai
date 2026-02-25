import { requireTenantAdmin } from "@/lib/auth";
import { type NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.API_BASE_URL ?? "http://localhost:4000";

export async function GET(request: NextRequest) {
  try {
    const ctx = await requireTenantAdmin();
    const { searchParams } = new URL(request.url);
    const published = searchParams.get("published");
    const qs = published ? `?published=${published}` : "";
    const res = await fetch(`${API_BASE}/blogs${qs}`, {
      headers: { "X-Tenant-Id": ctx.tenantId! },
      cache: "no-store",
    });
    if (!res.ok) return NextResponse.json({ error: "Failed to fetch" }, { status: res.status });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const ctx = await requireTenantAdmin();
    const body = await request.json();
    const res = await fetch(`${API_BASE}/blogs`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Tenant-Id": ctx.tenantId! },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({ error: "Failed to create" }));
      return NextResponse.json(
        { error: (body as { message?: string }).message ?? (body as { error?: string }).error ?? "Failed to create" },
        { status: res.status },
      );
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
