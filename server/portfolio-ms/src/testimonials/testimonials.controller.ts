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
import { TestimonialsService } from "./testimonials.service";

@Controller("testimonials")
export class TestimonialsController {
  constructor(private testimonials: TestimonialsService) {}

  private getTenantId(tenantId: string | string[]): string {
    const id = typeof tenantId === "string" ? tenantId : tenantId?.[0];
    if (!id) throw new BadRequestException("Missing X-Tenant-Id header");
    return id;
  }

  @Get()
  async list(@Headers("x-tenant-id") tenantId: string | string[]) {
    const id = this.getTenantId(tenantId);
    return this.testimonials.findAll(id);
  }

  @Post()
  async create(
    @Headers("x-tenant-id") tenantId: string | string[],
    @Body() body: { quote?: string; author?: string; role?: string | null },
  ) {
    const id = this.getTenantId(tenantId);
    const quote = String(body?.quote ?? "").trim();
    const author = String(body?.author ?? "").trim();
    if (!quote || !author) throw new BadRequestException("Quote and author are required");
    return this.testimonials.create(id, { quote, author, role: body?.role ?? null });
  }

  @Put(":id")
  async update(
    @Headers("x-tenant-id") tenantId: string | string[],
    @Param("id") id: string,
    @Body() body: { quote?: string; author?: string; role?: string | null },
  ) {
    const tid = this.getTenantId(tenantId);
    return this.testimonials.update(tid, id, body);
  }

  @Delete(":id")
  async delete(
    @Headers("x-tenant-id") tenantId: string | string[],
    @Param("id") id: string,
  ) {
    const tid = this.getTenantId(tenantId);
    return this.testimonials.delete(tid, id);
  }
}
