import { Inject, Injectable, type OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { UserRole } from "@nexora/types";
import Redis from "ioredis";

export interface SessionData {
  userId: string;
  tenantId?: string;
  role: UserRole;
  expiresAt: number;
}

@Injectable()
export class SessionService implements OnModuleDestroy {
  private redis: Redis;

  constructor(@Inject(ConfigService) private config: ConfigService) {
    const url = this.config.get<string>("REDIS_URL", "redis://localhost:6379");
    this.redis = new Redis(url);
  }

  async onModuleDestroy() {
    await this.redis.quit();
  }

  private key(sessionId: string): string {
    return `session:${sessionId}`;
  }

  async create(
    sessionId: string,
    userId: string,
    tenantId: string | undefined,
    role: UserRole,
    ttlSeconds: number,
  ): Promise<void> {
    const data: SessionData = {
      userId,
      tenantId,
      role,
      expiresAt: Date.now() + ttlSeconds * 1000,
    };
    await this.redis.set(this.key(sessionId), JSON.stringify(data), "EX", ttlSeconds);
  }

  async get(sessionId: string): Promise<SessionData | null> {
    const raw = await this.redis.get(this.key(sessionId));
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw) as Partial<SessionData>;
      if (!parsed.userId || typeof parsed.expiresAt !== "number") return null;
      return {
        userId: parsed.userId,
        tenantId: parsed.tenantId,
        role: parsed.role ?? "user",
        expiresAt: parsed.expiresAt,
      };
    } catch {
      return null;
    }
  }

  async delete(sessionId: string): Promise<void> {
    await this.redis.del(this.key(sessionId));
  }

  async refresh(sessionId: string, ttlSeconds: number): Promise<boolean> {
    const data = await this.get(sessionId);
    if (!data) return false;
    data.expiresAt = Date.now() + ttlSeconds * 1000;
    await this.redis.set(this.key(sessionId), JSON.stringify(data), "EX", ttlSeconds);
    return true;
  }
}
