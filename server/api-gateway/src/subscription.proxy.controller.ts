import { Controller, Get, Inject, NotFoundException, Param } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Controller("admin/subscriptions")
export class SubscriptionProxyController {
  constructor(@Inject(ConfigService) private config: ConfigService) {}

  @Get("active/:subdomain")
  async activeBySubdomain(@Param("subdomain") subdomain: string) {
    const base = this.config.get<string>("SUBSCRIPTION_MS_URL", "http://localhost:3010");
    const res = await fetch(`${base}/subscriptions/resolve`, {
      headers: { "X-Tenant-Subdomain": subdomain.toLowerCase() },
    });

    if (!res.ok) {
      throw new NotFoundException(`Subscription not found for subdomain ${subdomain}`);
    }

    const data = (await res.json()) as { status?: string } | null;
    if (!data || (data.status !== "active" && data.status !== "trialing")) {
      throw new NotFoundException(`No active subscription for subdomain ${subdomain}`);
    }

    return data;
  }
}
