import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Post,
  Put,
} from "@nestjs/common";
import { TemplatesService } from "./templates.service";

@Controller("templates")
export class TemplatesController {
  constructor(private templates: TemplatesService) {}

  private getTenantId(tenantId: string | string[]): string {
    const id = typeof tenantId === "string" ? tenantId : tenantId?.[0];
    if (!id) throw new BadRequestException("Missing X-Tenant-Id header");
    return id;
  }

  @Get()
  async list(@Headers("x-tenant-id") tenantId: string | string[]) {
    const id = this.getTenantId(tenantId);
    return this.templates.findAll(id);
  }

  @Post()
  async create(
    @Headers("x-tenant-id") tenantId: string | string[],
    @Body() body: { name?: string; config?: Record<string, unknown> },
  ) {
    const id = this.getTenantId(tenantId);
    const name = String(body?.name ?? "").trim() || `Template ${Date.now()}`;
    const config = body?.config && typeof body.config === "object" ? body.config : {};
    return this.templates.create(id, { name, config });
  }

  @Put(":id")
  async update(
    @Headers("x-tenant-id") tenantId: string | string[],
    @Param("id") id: string,
    @Body() body: { name?: string; config?: Record<string, unknown> },
  ) {
    const tid = this.getTenantId(tenantId);
    return this.templates.update(tid, id, body);
  }

  @Delete(":id")
  async delete(
    @Headers("x-tenant-id") tenantId: string | string[],
    @Param("id") id: string,
  ) {
    const tid = this.getTenantId(tenantId);
    return this.templates.delete(tid, id);
  }
}
