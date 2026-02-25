import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Post,
  Put,
  Query,
} from "@nestjs/common";
import type { TimelineType } from "./timeline.service";
import { TimelineService } from "./timeline.service";

function getTenantId(headers: Record<string, string | string[] | undefined>): string {
  const id = headers["x-tenant-id"];
  if (typeof id === "string") return id;
  if (Array.isArray(id) && id[0]) return id[0];
  throw new Error("Missing X-Tenant-Id header");
}

@Controller("timeline")
export class TimelineController {
  constructor(private timeline: TimelineService) {}

  @Get()
  async list(
    @Headers() headers: Record<string, string | string[] | undefined>,
    @Query("type") type?: string,
    @Query("from") from?: string,
    @Query("to") to?: string,
    @Query("tags") tagsStr?: string,
  ) {
    const tenantId = getTenantId(headers);
    const tags = tagsStr ? tagsStr.split(",").map((t) => t.trim()) : undefined;
    return this.timeline.findAll(tenantId, {
      type: type as TimelineType | undefined,
      from,
      to,
      tags,
    });
  }

  @Get("admin")
  async listAdmin(@Headers() headers: Record<string, string | string[] | undefined>) {
    const tenantId = getTenantId(headers);
    return this.timeline.findAllAdmin(tenantId);
  }

  @Get(":id")
  async getById(
    @Headers() headers: Record<string, string | string[] | undefined>,
    @Param("id") id: string,
  ) {
    const tenantId = getTenantId(headers);
    const item = await this.timeline.findById(tenantId, id);
    if (!item) throw new Error("Timeline item not found");
    return item;
  }

  @Post()
  async create(
    @Headers() headers: Record<string, string | string[] | undefined>,
    @Body()
    body: {
      type: TimelineType;
      title: string;
      description?: string | null;
      date: string;
      tags?: string[];
      relatedBlogId?: string | null;
    },
  ) {
    const tenantId = getTenantId(headers);
    return this.timeline.create(tenantId, body);
  }

  @Put(":id")
  async update(
    @Headers() headers: Record<string, string | string[] | undefined>,
    @Param("id") id: string,
    @Body()
    body: Partial<{
      type: TimelineType;
      title: string;
      description: string;
      date: string;
      tags: string[];
      visibility: string;
    }>,
  ) {
    const tenantId = getTenantId(headers);
    return this.timeline.update(tenantId, id, body);
  }

  @Delete(":id")
  async delete(
    @Headers() headers: Record<string, string | string[] | undefined>,
    @Param("id") id: string,
  ) {
    const tenantId = getTenantId(headers);
    await this.timeline.delete(tenantId, id);
    return { success: true };
  }
}
