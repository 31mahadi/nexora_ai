import { requireTenantAdmin } from "@/lib/auth";
import { NextResponse } from "next/server";

const API_BASE = process.env.API_BASE_URL ?? "http://localhost:4000";

export async function GET() {
  try {
    const ctx = await requireTenantAdmin();
    const res = await fetch(`${API_BASE}/tenants/me`, {
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
