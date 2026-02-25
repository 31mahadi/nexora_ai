import { requireTenantAdmin } from "@/lib/auth";
import { type NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.API_BASE_URL ?? "http://localhost:4000";

export async function GET() {
  try {
    const ctx = await requireTenantAdmin();
    const res = await fetch(`${API_BASE}/testimonials`, {
      headers: { "X-Tenant-Id": ctx.tenantId! },
      cache: "no-store",
    });
    if (!res.ok) return NextResponse.json({ error: "Failed to fetch" }, { status: res.status });
    return NextResponse.json(await res.json());
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const ctx = await requireTenantAdmin();
    const body = await request.json();
    const res = await fetch(`${API_BASE}/testimonials`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Tenant-Id": ctx.tenantId! },
      body: JSON.stringify(body),
    });
    if (!res.ok) return NextResponse.json({ error: "Failed to create" }, { status: res.status });
    return NextResponse.json(await res.json());
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
