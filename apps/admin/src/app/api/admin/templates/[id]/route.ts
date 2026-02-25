import { requireTenantAdmin } from "@/lib/auth";
import { type NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.API_BASE_URL ?? "http://localhost:4000";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const ctx = await requireTenantAdmin();
    const { id } = await params;
    const body = await request.json();
    const res = await fetch(`${API_BASE}/templates/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "X-Tenant-Id": ctx.tenantId! },
      body: JSON.stringify(body),
    });
    if (!res.ok) return NextResponse.json({ error: "Failed to update" }, { status: res.status });
    return NextResponse.json(await res.json());
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const ctx = await requireTenantAdmin();
    const { id } = await params;
    const res = await fetch(`${API_BASE}/templates/${id}`, {
      method: "DELETE",
      headers: { "X-Tenant-Id": ctx.tenantId! },
    });
    if (!res.ok) return NextResponse.json({ error: "Failed to delete" }, { status: res.status });
    return NextResponse.json(await res.json());
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
