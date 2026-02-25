import {
  Body,
  Controller,
  Get,
  Headers,
  Inject,
  NotFoundException,
  Put,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Controller("portfolio")
export class PortfolioProxyController {
  constructor(@Inject(ConfigService) private config: ConfigService) {}

  private getTenantId(tenantId: string | string[]): string {
    const id = typeof tenantId === "string" ? tenantId : tenantId?.[0];
    if (!id) throw new NotFoundException("Missing X-Tenant-Id header");
    return id;
  }

  @Get()
  async getPublic(@Headers("x-tenant-id") tenantId: string | string[]) {
    const id = this.getTenantId(tenantId);
    const base = this.config.get<string>("PORTFOLIO_MS_URL", "http://localhost:3006");
    const res = await fetch(`${base}/portfolio`, {
      headers: { "X-Tenant-Id": id },
    });
    if (!res.ok) throw new NotFoundException("Portfolio not found");
    return res.json();
  }

  @Put()
  async upsert(
    @Headers("x-tenant-id") tenantId: string | string[],
    @Body() body: { bio?: string | null; tagline?: string | null; avatarUrl?: string | null; socialLinks?: Record<string, string> },
  ) {
    const id = this.getTenantId(tenantId);
    const base = this.config.get<string>("PORTFOLIO_MS_URL", "http://localhost:3006");
    const res = await fetch(`${base}/portfolio`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "X-Tenant-Id": id },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new NotFoundException("Failed to update portfolio");
    return res.json();
  }
}
