import {
  Body,
  Controller,
  Get,
  Headers,
  NotFoundException,
  Put,
} from "@nestjs/common";
import { TenantService } from "./tenant.service";

@Controller("tenants")
export class TenantController {
  constructor(private tenant: TenantService) {}

  @Get("resolve")
  async resolve(
    @Headers("x-tenant-subdomain") subdomain: string,
    @Headers("x-tenant-host") host: string,
  ) {
    const value = (subdomain && subdomain !== "localhost" ? subdomain : null) || host;
    if (!value) throw new NotFoundException("Missing X-Tenant-Subdomain or X-Tenant-Host header");
    return this.tenant.resolve(value);
  }

  @Get("me")
  async getMe(@Headers("x-tenant-id") tenantId: string) {
    if (!tenantId) throw new NotFoundException("Missing X-Tenant-Id header");
    const tenant = await this.tenant.findById(tenantId);
    if (!tenant) throw new NotFoundException("Tenant not found");
    return tenant;
  }

  @Get("theme")
  async getTheme(@Headers("x-tenant-id") tenantId: string) {
    if (!tenantId) throw new NotFoundException("Missing X-Tenant-Id header");
    const tenant = await this.tenant.findById(tenantId);
    if (!tenant) throw new NotFoundException("Tenant not found");
    return { theme: tenant.theme };
  }

  @Put("custom-domain")
  async updateCustomDomain(
    @Headers("x-tenant-id") tenantId: string,
    @Body() body: { customDomain?: string | null },
  ) {
    if (!tenantId) throw new NotFoundException("Missing X-Tenant-Id header");
    const tenant = await this.tenant.updateCustomDomain(tenantId, body.customDomain ?? null);
    return { customDomain: tenant.customDomain };
  }

  @Put("theme")
  async updateTheme(
    @Headers("x-tenant-id") tenantId: string,
    @Body() body: { theme: Record<string, unknown> },
  ) {
    if (!tenantId) throw new NotFoundException("Missing X-Tenant-Id header");
    if (!body.theme || typeof body.theme !== "object")
      throw new NotFoundException("Invalid theme payload");
    const tenant = await this.tenant.updateTheme(tenantId, body.theme);
    return { theme: tenant.theme };
  }

  @Get("site-config")
  async getSiteConfig(@Headers("x-tenant-id") tenantId: string) {
    if (!tenantId) throw new NotFoundException("Missing X-Tenant-Id header");
    const tenant = await this.tenant.findById(tenantId);
    if (!tenant) throw new NotFoundException("Tenant not found");
    return {
      theme: tenant.theme ?? {},
      settings: tenant.settings ?? {},
    };
  }

  @Put("site-config")
  async updateSiteConfig(
    @Headers("x-tenant-id") tenantId: string,
    @Body()
    body: {
      theme?: Record<string, unknown>;
      settings?: Record<string, unknown>;
    },
  ) {
    if (!tenantId) throw new NotFoundException("Missing X-Tenant-Id header");
    if (body.theme !== undefined && (typeof body.theme !== "object" || !body.theme)) {
      throw new NotFoundException("Invalid theme payload");
    }
    if (body.settings !== undefined && (typeof body.settings !== "object" || !body.settings)) {
      throw new NotFoundException("Invalid settings payload");
    }
    const tenant = await this.tenant.updateSiteConfig(tenantId, body);
    return { theme: tenant.theme ?? {}, settings: tenant.settings ?? {} };
  }
}
