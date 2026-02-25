import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpException,
  HttpStatus,
  Inject,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Controller("blogs")
export class BlogProxyController {
  constructor(@Inject(ConfigService) private config: ConfigService) {}

  private getTenantId(tenantId: string | string[]): string {
    const id = typeof tenantId === "string" ? tenantId : tenantId?.[0];
    if (!id) throw new NotFoundException("Missing X-Tenant-Id header");
    return id;
  }

  private async forward(
    path: string,
    tenantId: string,
    init?: RequestInit,
  ): Promise<Response> {
    const base = this.config.get<string>("BLOG_MS_URL", "http://localhost:3007");
    return fetch(`${base}/blogs${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        "X-Tenant-Id": tenantId,
        ...(init?.headers as Record<string, string>),
      },
    });
  }

  @Get()
  async list(@Headers("x-tenant-id") tenantId: string | string[], @Query("published") published?: string) {
    const id = this.getTenantId(tenantId);
    const qs = published ? `?published=${published}` : "";
    const res = await this.forward(qs, id);
    if (!res.ok) throw new NotFoundException("Failed to fetch blogs");
    return res.json();
  }

  @Get("slug/:slug")
  async getBySlug(@Headers("x-tenant-id") tenantId: string | string[], @Param("slug") slug: string) {
    const id = this.getTenantId(tenantId);
    const res = await this.forward(`/slug/${slug}`, id);
    if (!res.ok) throw new NotFoundException("Blog not found");
    return res.json();
  }

  @Get(":id")
  async getById(@Headers("x-tenant-id") tenantId: string | string[], @Param("id") blogId: string) {
    const id = this.getTenantId(tenantId);
    const res = await this.forward(`/${blogId}`, id);
    if (!res.ok) throw new NotFoundException("Blog not found");
    return res.json();
  }

  @Post()
  async create(
    @Headers("x-tenant-id") tenantId: string | string[],
    @Body() body: { title: string; slug?: string; content: string; excerpt?: string },
  ) {
    const id = this.getTenantId(tenantId);
    let res: Response;
    try {
      res = await this.forward("", id, { method: "POST", body: JSON.stringify(body) });
    } catch (err) {
      throw new HttpException(
        "Blog service unavailable. Ensure blog-ms is running on port 3007.",
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
    if (!res.ok) {
      const text = await res.text();
      let message = "Failed to create blog";
      try {
        const json = JSON.parse(text) as { message?: string };
        if (json.message) message = json.message;
      } catch {
        // use default
      }
      throw new HttpException(message, res.status as HttpStatus);
    }
    return res.json();
  }

  @Put(":id")
  async update(
    @Headers("x-tenant-id") tenantId: string | string[],
    @Param("id") blogId: string,
    @Body() body: Partial<{ title: string; slug: string; content: string; excerpt: string; published: boolean }>,
  ) {
    const id = this.getTenantId(tenantId);
    const res = await this.forward(`/${blogId}`, id, {
      method: "PUT",
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new NotFoundException("Failed to update blog");
    return res.json();
  }

  @Delete(":id")
  async delete(@Headers("x-tenant-id") tenantId: string | string[], @Param("id") blogId: string) {
    const id = this.getTenantId(tenantId);
    const res = await this.forward(`/${blogId}`, id, { method: "DELETE" });
    if (!res.ok) throw new NotFoundException("Failed to delete blog");
    return res.json();
  }
}
