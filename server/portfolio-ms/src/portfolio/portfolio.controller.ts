import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Post,
  Put,
} from "@nestjs/common";
import { PortfolioService } from "./portfolio.service";

@Controller("portfolio")
export class PortfolioController {
  constructor(private portfolio: PortfolioService) {}

  private getTenantId(headers: Record<string, string | string[] | undefined>): string {
    const id = headers["x-tenant-id"];
    if (typeof id === "string") return id;
    if (Array.isArray(id) && id[0]) return id[0];
    throw new Error("Missing X-Tenant-Id header");
  }

  @Get()
  async getPublic(@Headers("x-tenant-id") tenantId: string | string[]) {
    const id = typeof tenantId === "string" ? tenantId : tenantId?.[0];
    if (!id) throw new Error("Missing X-Tenant-Id header");
    return this.portfolio.getPublic(id);
  }

  @Put()
  async upsert(
    @Headers() headers: Record<string, string | string[] | undefined>,
    @Body()
    body: {
      bio?: string | null;
      tagline?: string | null;
      avatarUrl?: string | null;
      socialLinks?: Record<string, string>;
    },
  ) {
    const tenantId = this.getTenantId(headers);
    return this.portfolio.upsert(tenantId, body);
  }

  @Get("skills")
  async getSkills(@Headers("x-tenant-id") tenantId: string | string[]) {
    const id = typeof tenantId === "string" ? tenantId : tenantId?.[0];
    if (!id) throw new Error("Missing X-Tenant-Id header");
    return this.portfolio.getSkills(id);
  }

  @Post("skills")
  async addSkill(
    @Headers() headers: Record<string, string | string[] | undefined>,
    @Body() body: { name: string; category?: string | null },
  ) {
    const tenantId = this.getTenantId(headers);
    return this.portfolio.addSkill(tenantId, body);
  }

  @Delete("skills/:id")
  async removeSkill(
    @Headers() headers: Record<string, string | string[] | undefined>,
    @Param("id") skillId: string,
  ) {
    const tenantId = this.getTenantId(headers);
    await this.portfolio.removeSkill(tenantId, skillId);
    return { success: true };
  }

  @Get("services")
  async getServices(@Headers("x-tenant-id") tenantId: string | string[]) {
    const id = typeof tenantId === "string" ? tenantId : tenantId?.[0];
    if (!id) throw new Error("Missing X-Tenant-Id header");
    return this.portfolio.getServices(id);
  }

  @Post("services")
  async addService(
    @Headers() headers: Record<string, string | string[] | undefined>,
    @Body() body: { title: string; description?: string | null },
  ) {
    const tenantId = this.getTenantId(headers);
    return this.portfolio.addService(tenantId, body);
  }
}
