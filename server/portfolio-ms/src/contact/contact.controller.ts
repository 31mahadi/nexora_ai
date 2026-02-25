import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Post,
} from "@nestjs/common";
import { ContactService } from "./contact.service";

@Controller("contact")
export class ContactController {
  constructor(private contact: ContactService) {}

  private getTenantId(tenantId: string | string[]): string {
    const id = typeof tenantId === "string" ? tenantId : tenantId?.[0];
    if (!id) throw new BadRequestException("Missing X-Tenant-Id header");
    return id;
  }

  @Get()
  async list(@Headers("x-tenant-id") tenantId: string | string[]) {
    const id = this.getTenantId(tenantId);
    return this.contact.findAll(id);
  }

  @Delete(":id")
  async delete(
    @Headers("x-tenant-id") tenantId: string | string[],
    @Param("id") id: string,
  ) {
    const tid = this.getTenantId(tenantId);
    return this.contact.delete(tid, id);
  }

  @Post()
  async submit(
    @Headers("x-tenant-id") tenantId: string | string[],
    @Body() body: { name?: string; email?: string; message?: string },
  ) {
    const id = this.getTenantId(tenantId);
    const name = String(body?.name ?? "").trim();
    const email = String(body?.email ?? "").trim();
    const message = String(body?.message ?? "").trim();
    if (!name || !email || !message) {
      throw new BadRequestException("Name, email, and message are required");
    }
    return this.contact.submit(id, { name, email, message });
  }
}
