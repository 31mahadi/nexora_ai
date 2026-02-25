import { randomUUID } from "node:crypto";
import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { UserRole } from "@nexora/types";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { SessionData } from "./session/session.service";
import { SessionService } from "./session/session.service";

const SESSION_TTL = 7 * 24 * 60 * 60; // 7 days
const SESSION_COOKIE = "nexora_session";

@Injectable()
export class AuthService {
  private supabase: SupabaseClient;

  constructor(
    @Inject(ConfigService) private config: ConfigService,
    @Inject(SessionService) private session: SessionService,
  ) {
    const url = this.config.getOrThrow<string>("SUPABASE_URL");
    const key = this.config.getOrThrow<string>("SUPABASE_SERVICE_ROLE_KEY");
    this.supabase = createClient(url, key, {
      auth: { persistSession: false },
    });
  }

  getSessionCookieName(): string {
    return SESSION_COOKIE;
  }

  private toRole(meta: { role?: unknown } | undefined): UserRole {
    if (meta?.role === "super-admin" || meta?.role === "tenant-admin") {
      return meta.role;
    }
    return "user";
  }

  async createSession(refreshToken: string): Promise<{
    sessionId: string;
    setCookie: string;
    user: { id: string; email: string; tenantId?: string; role: UserRole };
  } | null> {
    const { data, error } = await this.supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });
    if (error || !data.session?.user) return null;

    const appMeta = data.session.user as { app_metadata?: { tenant_id?: string; role?: unknown } };
    const tenantId = appMeta.app_metadata?.tenant_id;
    const role = this.toRole(appMeta.app_metadata);

    const sessionId = randomUUID();
    await this.session.create(sessionId, data.session.user.id, tenantId, role, SESSION_TTL);

    const setCookie = `${SESSION_COOKIE}=${sessionId}; HttpOnly; Path=/; Max-Age=${SESSION_TTL}; SameSite=Strict`;
    return {
      sessionId,
      setCookie,
      user: {
        id: data.session.user.id,
        email: data.session.user.email ?? "",
        tenantId,
        role,
      },
    };
  }

  async getSession(sessionId: string): Promise<SessionData | null> {
    return this.session.get(sessionId);
  }

  async refreshSession(sessionId: string): Promise<{
    setCookie?: string;
    user: { id: string; email: string; tenantId?: string; role: UserRole };
  } | null> {
    const data = await this.session.get(sessionId);
    if (!data) return null;

    const refreshed = await this.session.refresh(sessionId, SESSION_TTL);
    return {
      setCookie: refreshed
        ? `${SESSION_COOKIE}=${sessionId}; HttpOnly; Path=/; Max-Age=${SESSION_TTL}; SameSite=Strict`
        : undefined,
      user: { id: data.userId, email: "", tenantId: data.tenantId, role: data.role },
    };
  }

  async logout(sessionId: string): Promise<void> {
    await this.session.delete(sessionId);
  }

  async validateToken(accessToken: string): Promise<{
    id: string;
    email: string;
    tenantId?: string;
    role: UserRole;
  } | null> {
    const {
      data: { user },
      error,
    } = await this.supabase.auth.getUser(accessToken);
    if (error || !user) return null;
    const meta = user as { app_metadata?: { tenant_id?: string; role?: unknown } };
    return {
      id: user.id,
      email: user.email ?? "",
      tenantId: meta.app_metadata?.tenant_id,
      role: this.toRole(meta.app_metadata),
    };
  }
}
