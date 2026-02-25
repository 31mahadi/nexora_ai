import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Inject,
  NotFoundException,
  Param,
  Post,
  Put,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Controller("timeline")
export class TimelineProxyController {
  constructor(@Inject(ConfigService) private config: ConfigService) {}

  private getTenantId(tenantId: string | string[]): string {
    const id = typeof tenantId === "string" ? tenantId : tenantId?.[0];
    if (!id) throw new NotFoundException("Missing X-Tenant-Id header");
    return id;
  }

  @Get()
  async list(@Headers("x-tenant-id") tenantId: string | string[]) {
    const id = typeof tenantId === "string" ? tenantId : tenantId?.[0];
    if (!id) return [];
    const base = this.config.get<string>("TIMELINE_MS_URL", "http://localhost:3008");
    const res = await fetch(`${base}/timeline`, { headers: { "X-Tenant-Id": id } });
    if (!res.ok) return [];
    return res.json();
  }

  @Get("admin")
  async listAdmin(@Headers("x-tenant-id") tenantId: string | string[]) {
    const id = this.getTenantId(tenantId);
    const base = this.config.get<string>("TIMELINE_MS_URL", "http://localhost:3008");
    const res = await fetch(`${base}/timeline/admin`, { headers: { "X-Tenant-Id": id } });
    if (!res.ok) throw new NotFoundException("Failed to fetch timeline");
    return res.json();
  }

  @Post()
  async create(
    @Headers("x-tenant-id") tenantId: string | string[],
    @Body() body: {
      type: string;
      title: string;
      description?: string | null;
      date: string;
      tags?: string[];
      relatedBlogId?: string | null;
    },
  ) {
    const id = this.getTenantId(tenantId);
    const base = this.config.get<string>("TIMELINE_MS_URL", "http://localhost:3008");
    const res = await fetch(`${base}/timeline`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Tenant-Id": id },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new NotFoundException("Failed to create timeline item");
    return res.json();
  }

  @Put(":id")
  async update(
    @Headers("x-tenant-id") tenantId: string | string[],
    @Param("id") itemId: string,
    @Body() body: Partial<{ type: string; title: string; description: string; date: string; tags: string[]; visibility: string }>,
  ) {
    const id = this.getTenantId(tenantId);
    const base = this.config.get<string>("TIMELINE_MS_URL", "http://localhost:3008");
    const res = await fetch(`${base}/timeline/${itemId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "X-Tenant-Id": id },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new NotFoundException("Failed to update timeline item");
    return res.json();
  }

  @Delete(":id")
  async delete(@Headers("x-tenant-id") tenantId: string | string[], @Param("id") itemId: string) {
    const id = this.getTenantId(tenantId);
    const base = this.config.get<string>("TIMELINE_MS_URL", "http://localhost:3008");
    const res = await fetch(`${base}/timeline/${itemId}`, {
      method: "DELETE",
      headers: { "X-Tenant-Id": id },
    });
    if (!res.ok) throw new NotFoundException("Failed to delete timeline item");
    return res.json();
  }
}
