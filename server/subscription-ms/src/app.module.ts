import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PlanEntity } from "./entities/plan.entity";
import { SubscriptionEntity } from "./entities/subscription.entity";
import { TenantEntity } from "./entities/tenant.entity";
import { HealthController } from "./health.controller";
import { SubscriptionController } from "./subscription.controller";
import { SubscriptionService } from "./subscription.service";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env.local", ".env", "../../.env.local", "../../.env"],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: "postgres",
        url: config.get<string>(
          "DATABASE_URL",
          "postgres://nexora:nexora_dev@localhost:5432/nexora",
        ),
        autoLoadEntities: true,
        synchronize: false,
      }),
    }),
    TypeOrmModule.forFeature([SubscriptionEntity, TenantEntity, PlanEntity]),
  ],
  controllers: [HealthController, SubscriptionController],
  providers: [SubscriptionService],
})
export class AppModule {}
