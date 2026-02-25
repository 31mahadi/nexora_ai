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
import { BlogService } from "./blog.service";

function getTenantId(headers: Record<string, string | string[] | undefined>): string {
  const id = headers["x-tenant-id"];
  if (typeof id === "string") return id;
  if (Array.isArray(id) && id[0]) return id[0];
  throw new Error("Missing X-Tenant-Id header");
}

@Controller("blogs")
export class BlogController {
  constructor(private blog: BlogService) {}

  @Get()
  async list(
    @Headers() headers: Record<string, string | string[] | undefined>,
    @Query("published") published?: string,
  ) {
    const tenantId = getTenantId(headers);
    const publishedOnly = published === "true";
    return this.blog.findAll(tenantId, publishedOnly);
  }

  @Get("slug/:slug")
  async getBySlug(
    @Headers() headers: Record<string, string | string[] | undefined>,
    @Param("slug") slug: string,
  ) {
    const tenantId = getTenantId(headers);
    const post = await this.blog.findBySlug(tenantId, slug);
    if (!post) throw new Error("Blog not found");
    return post;
  }

  @Get(":id")
  async getById(
    @Headers() headers: Record<string, string | string[] | undefined>,
    @Param("id") id: string,
  ) {
    const tenantId = getTenantId(headers);
    const post = await this.blog.findById(tenantId, id);
    if (!post) throw new Error("Blog not found");
    return post;
  }

  @Post()
  async create(
    @Headers() headers: Record<string, string | string[] | undefined>,
    @Body() body: { title: string; slug?: string; content: string; excerpt?: string },
  ) {
    const tenantId = getTenantId(headers);
    return this.blog.create(tenantId, body);
  }

  @Put(":id")
  async update(
    @Headers() headers: Record<string, string | string[] | undefined>,
    @Param("id") id: string,
    @Body()
    body: Partial<{
      title: string;
      slug: string;
      content: string;
      excerpt: string;
      published: boolean;
    }>,
  ) {
    const tenantId = getTenantId(headers);
    return this.blog.update(tenantId, id, body);
  }

  @Delete(":id")
  async delete(
    @Headers() headers: Record<string, string | string[] | undefined>,
    @Param("id") id: string,
  ) {
    const tenantId = getTenantId(headers);
    await this.blog.delete(tenantId, id);
    return { success: true };
  }

  @Post(":id/comments")
  async addComment(
    @Headers() headers: Record<string, string | string[] | undefined>,
    @Param("id") id: string,
    @Body() body: { content: string; guestEmail?: string },
  ) {
    const tenantId = getTenantId(headers);
    await this.blog.addComment(id, tenantId, body);
    return { success: true };
  }
}
