import { HttpService } from "@nestjs/axios";
import {
  Body,
  Controller,
  Get,
  Headers,
  Inject,
  NotFoundException,
  Put,
} from "@nestjs/common";
import { firstValueFrom } from "rxjs";

@Controller("tenants")
export class TenantProxyController {
  constructor(@Inject(HttpService) private http: HttpService) {}

  private getTenantId(tenantId: string | string[]): string {
    const id = typeof tenantId === "string" ? tenantId : tenantId?.[0];
    if (!id) throw new NotFoundException("Missing X-Tenant-Id header");
    return id;
  }

  @Get("resolve")
  async resolve(
    @Headers("x-tenant-subdomain") subdomain: string,
    @Headers("x-tenant-host") host: string,
  ) {
    const value = (subdomain && subdomain !== "localhost" ? subdomain : null) || host;
    if (!value) throw new NotFoundException("Missing X-Tenant-Subdomain or X-Tenant-Host");
    const headers: Record<string, string> = {
      "X-Tenant-Subdomain": subdomain ?? "",
      "X-Tenant-Host": host ?? "",
    };
    const { data } = await firstValueFrom(
      this.http.get("/tenants/resolve", { headers }),
    );
    return data;
  }

  @Get("me")
  async getMe(@Headers("x-tenant-id") tenantId: string | string[]) {
    const id = this.getTenantId(tenantId);
    const { data } = await firstValueFrom(
      this.http.get("/tenants/me", {
        headers: { "X-Tenant-Id": id },
      }),
    );
    return data;
  }

  @Get("theme")
  async getTheme(@Headers("x-tenant-id") tenantId: string | string[]) {
    const id = this.getTenantId(tenantId);
    const { data } = await firstValueFrom(
      this.http.get("/tenants/theme", {
        headers: { "X-Tenant-Id": id },
      }),
    );
    return data;
  }

  @Put("custom-domain")
  async updateCustomDomain(
    @Headers("x-tenant-id") tenantId: string | string[],
    @Body() body: { customDomain?: string | null },
  ) {
    const id = this.getTenantId(tenantId);
    const { data } = await firstValueFrom(
      this.http.put("/tenants/custom-domain", body, {
        headers: { "Content-Type": "application/json", "X-Tenant-Id": id },
      }),
    );
    return data;
  }

  @Put("theme")
  async updateTheme(
    @Headers("x-tenant-id") tenantId: string | string[],
    @Body() body: { theme: Record<string, unknown> },
  ) {
    const id = this.getTenantId(tenantId);
    const { data } = await firstValueFrom(
      this.http.put("/tenants/theme", body, {
        headers: { "Content-Type": "application/json", "X-Tenant-Id": id },
      }),
    );
    return data;
  }

  @Get("site-config")
  async getSiteConfig(@Headers("x-tenant-id") tenantId: string | string[]) {
    const id = this.getTenantId(tenantId);
    const { data } = await firstValueFrom(
      this.http.get("/tenants/site-config", {
        headers: { "X-Tenant-Id": id },
      }),
    );
    return data;
  }

  @Put("site-config")
  async updateSiteConfig(
    @Headers("x-tenant-id") tenantId: string | string[],
    @Body()
    body: {
      theme?: Record<string, unknown>;
      settings?: Record<string, unknown>;
    },
  ) {
    const id = this.getTenantId(tenantId);
    const { data } = await firstValueFrom(
      this.http.put("/tenants/site-config", body, {
        headers: { "Content-Type": "application/json", "X-Tenant-Id": id },
      }),
    );
    return data;
  }
}
