import { requireTenantAdmin } from "@/lib/auth";
import { type NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.API_BASE_URL ?? "http://localhost:4000";

export async function GET() {
  try {
    const ctx = await requireTenantAdmin();
    const res = await fetch(`${API_BASE}/contact`, {
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

export async function DELETE(request: NextRequest) {
  try {
    const ctx = await requireTenantAdmin();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    const res = await fetch(`${API_BASE}/contact/${id}`, {
      method: "DELETE",
      headers: { "X-Tenant-Id": ctx.tenantId! },
    });
    if (!res.ok) return NextResponse.json({ error: "Failed to delete" }, { status: res.status });
    return NextResponse.json(await res.json());
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
