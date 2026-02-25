import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { BlogProxyController } from "./blog.proxy.controller";
import { ContactProxyController } from "./contact.proxy.controller";
import { HealthController } from "./health.controller";
import { PortfolioProxyController } from "./portfolio.proxy.controller";
import { ProjectsProxyController } from "./projects.proxy.controller";
import { TestimonialsProxyController } from "./testimonials.proxy.controller";
import { SubscriptionProxyController } from "./subscription.proxy.controller";
import { TenantProxyController } from "./tenant.proxy.controller";
import { TemplatesProxyController } from "./templates.proxy.controller";
import { TimelineProxyController } from "./timeline.proxy.controller";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env.local", ".env", "../../.env.local", "../../.env"],
    }),
    HttpModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        timeout: 5000,
        baseURL: config.get<string>("TENANT_MS_URL", "http://localhost:3005"),
      }),
    }),
  ],
  controllers: [
    HealthController,
    TenantProxyController,
    PortfolioProxyController,
    ContactProxyController,
    TestimonialsProxyController,
    ProjectsProxyController,
    TemplatesProxyController,
    BlogProxyController,
    TimelineProxyController,
    SubscriptionProxyController,
  ],
})
export class AppModule {}
