import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Inject,
  Param,
  Post,
  Put,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Controller("templates")
export class TemplatesProxyController {
  constructor(@Inject(ConfigService) private config: ConfigService) {}

  private getTenantId(tenantId: string | string[]): string {
    const id = typeof tenantId === "string" ? tenantId : tenantId?.[0];
    if (!id) throw new BadRequestException("Missing X-Tenant-Id header");
    return id;
  }

  private async proxy(
    method: string,
    path: string,
    tenantId: string,
    body?: unknown,
  ) {
    const base = this.config.get<string>("PORTFOLIO_MS_URL", "http://localhost:3006");
    const res = await fetch(`${base}/templates${path}`, {
      method,
      headers: { "Content-Type": "application/json", "X-Tenant-Id": tenantId },
      ...(body != null ? { body: JSON.stringify(body) } : {}),
    });
    if (!res.ok) throw new BadRequestException("Request failed");
    return res.json();
  }

  @Get()
  async list(@Headers("x-tenant-id") tenantId: string | string[]) {
    return this.proxy("GET", "", this.getTenantId(tenantId));
  }

  @Post()
  async create(
    @Headers("x-tenant-id") tenantId: string | string[],
    @Body() body: { name?: string; config?: Record<string, unknown> },
  ) {
    return this.proxy("POST", "", this.getTenantId(tenantId), body);
  }

  @Put(":id")
  async update(
    @Headers("x-tenant-id") tenantId: string | string[],
    @Param("id") id: string,
    @Body() body: { name?: string; config?: Record<string, unknown> },
  ) {
    return this.proxy("PUT", `/${id}`, this.getTenantId(tenantId), body);
  }

  @Delete(":id")
  async delete(
    @Headers("x-tenant-id") tenantId: string | string[],
    @Param("id") id: string,
  ) {
    return this.proxy("DELETE", `/${id}`, this.getTenantId(tenantId));
  }
}
