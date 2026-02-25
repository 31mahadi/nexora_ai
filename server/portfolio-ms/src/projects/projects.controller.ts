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
import { ProjectsService } from "./projects.service";

@Controller("projects")
export class ProjectsController {
  constructor(private projects: ProjectsService) {}

  private getTenantId(tenantId: string | string[]): string {
    const id = typeof tenantId === "string" ? tenantId : tenantId?.[0];
    if (!id) throw new BadRequestException("Missing X-Tenant-Id header");
    return id;
  }

  @Get()
  async list(@Headers("x-tenant-id") tenantId: string | string[]) {
    const id = this.getTenantId(tenantId);
    return this.projects.findAll(id);
  }

  @Post()
  async create(
    @Headers("x-tenant-id") tenantId: string | string[],
    @Body()
    body: {
      title?: string;
      description?: string | null;
      imageUrl?: string | null;
      linkUrl?: string | null;
      tags?: string[];
    },
  ) {
    const id = this.getTenantId(tenantId);
    const title = String(body?.title ?? "").trim();
    if (!title) throw new BadRequestException("Title is required");
    return this.projects.create(id, {
      title,
      description: body?.description ?? null,
      imageUrl: body?.imageUrl ?? null,
      linkUrl: body?.linkUrl ?? null,
      tags: body?.tags ?? [],
    });
  }

  @Put(":id")
  async update(
    @Headers("x-tenant-id") tenantId: string | string[],
    @Param("id") id: string,
    @Body()
    body: {
      title?: string;
      description?: string | null;
      imageUrl?: string | null;
      linkUrl?: string | null;
      tags?: string[];
    },
  ) {
    const tid = this.getTenantId(tenantId);
    return this.projects.update(tid, id, body);
  }

  @Delete(":id")
  async delete(
    @Headers("x-tenant-id") tenantId: string | string[],
    @Param("id") id: string,
  ) {
    const tid = this.getTenantId(tenantId);
    return this.projects.delete(tid, id);
  }
}
