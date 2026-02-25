export interface Tenant {
  id: string;
  subdomain: string;
  name: string;
  ownerId: string;
  status: "active" | "suspended" | "inactive";
  theme: Record<string, unknown>;
  settings: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface TenantContext {
  tenantId: string;
  subdomain?: string;
}

export type UserRole = "super-admin" | "tenant-admin" | "user";

export interface User {
  id: string;
  email: string;
  tenantId?: string;
  role: UserRole;
}

export interface Session {
  id: string;
  userId: string;
  tenantId?: string;
  role: UserRole;
  expiresAt: Date;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}
