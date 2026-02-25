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
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Controller("contact")
export class ContactProxyController {
  constructor(@Inject(ConfigService) private config: ConfigService) {}

  private getTenantId(tenantId: string | string[]): string {
    const id = typeof tenantId === "string" ? tenantId : tenantId?.[0];
    if (!id) throw new BadRequestException("Missing X-Tenant-Id header");
    return id;
  }

  @Get()
  async list(@Headers("x-tenant-id") tenantId: string | string[]) {
    const id = this.getTenantId(tenantId);
    const base = this.config.get<string>("PORTFOLIO_MS_URL", "http://localhost:3006");
    const res = await fetch(`${base}/contact`, {
      headers: { "X-Tenant-Id": id },
    });
    if (!res.ok) throw new BadRequestException("Failed to fetch submissions");
    return res.json();
  }

  @Delete(":id")
  async delete(
    @Headers("x-tenant-id") tenantId: string | string[],
    @Param("id") id: string,
  ) {
    const tid = this.getTenantId(tenantId);
    const base = this.config.get<string>("PORTFOLIO_MS_URL", "http://localhost:3006");
    const res = await fetch(`${base}/contact/${id}`, {
      method: "DELETE",
      headers: { "X-Tenant-Id": tid },
    });
    if (!res.ok) throw new BadRequestException("Failed to delete");
    return res.json();
  }

  @Post()
  async submit(
    @Headers("x-tenant-id") tenantId: string | string[],
    @Body() body: { name?: string; email?: string; message?: string },
  ) {
    const id = this.getTenantId(tenantId);
    const base = this.config.get<string>("PORTFOLIO_MS_URL", "http://localhost:3006");
    const res = await fetch(`${base}/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Tenant-Id": id },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new BadRequestException((err as { message?: string }).message ?? "Failed to submit");
    }
    return res.json();
  }
}
