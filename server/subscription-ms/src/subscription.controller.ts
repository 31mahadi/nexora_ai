import { BadRequestException, Controller, Get, Headers, Inject, Param } from "@nestjs/common";
import { SubscriptionService } from "./subscription.service";

@Controller("subscriptions")
export class SubscriptionController {
  constructor(@Inject(SubscriptionService) private subscription: SubscriptionService) {}

  @Get("tenant/:tenantId")
  async byTenant(@Param("tenantId") tenantId: string) {
    return this.subscription.findByTenantId(tenantId);
  }

  @Get("active/:tenantId")
  async activeByTenant(@Param("tenantId") tenantId: string) {
    return this.subscription.findActiveByTenantId(tenantId);
  }

  @Get("resolve")
  async bySubdomain(@Headers("x-tenant-subdomain") subdomain: string) {
    if (!subdomain) {
      throw new BadRequestException("Missing X-Tenant-Subdomain header");
    }
    return this.subscription.findBySubdomain(subdomain);
  }
}
