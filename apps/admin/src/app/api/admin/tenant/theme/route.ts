import { requireTenantAdmin } from "@/lib/auth";
import { type NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.API_BASE_URL ?? "http://localhost:4000";

export async function GET() {
  try {
    const ctx = await requireTenantAdmin();
    const res = await fetch(`${API_BASE}/tenants/theme`, {
      headers: { "X-Tenant-Id": ctx.tenantId! },
      cache: "no-store",
    });
    if (!res.ok) return NextResponse.json({ error: "Failed to fetch" }, { status: res.status });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const ctx = await requireTenantAdmin();
    const body = await request.json();
    const res = await fetch(`${API_BASE}/tenants/theme`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "X-Tenant-Id": ctx.tenantId! },
      body: JSON.stringify(body),
    });
    if (!res.ok) return NextResponse.json({ error: "Failed to update" }, { status: res.status });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
