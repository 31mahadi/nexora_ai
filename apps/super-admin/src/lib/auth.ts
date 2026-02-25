import type { UserRole } from "@nexora/types";
import { redirect } from "next/navigation";
import { createClient } from "./supabase-server";

export interface SuperAdminContext {
  userId: string;
  email: string;
  role: UserRole;
}

function toRole(value: unknown): UserRole {
  if (value === "super-admin" || value === "tenant-admin") return value;
  return "user";
}

export async function getServerAuthContext(): Promise<SuperAdminContext | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const meta = user.app_metadata as { role?: unknown } | undefined;
  return {
    userId: user.id,
    email: user.email ?? "",
    role: toRole(meta?.role),
  };
}

export async function requireSuperAdmin(): Promise<SuperAdminContext> {
  const context = await getServerAuthContext();
  if (!context) redirect("/login");
  if (context.role !== "super-admin") redirect("/login");
  return context;
}
