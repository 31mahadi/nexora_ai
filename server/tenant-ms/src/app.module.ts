import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TenantController } from "./tenant.controller";
import { TenantEntity } from "./tenant.entity";
import { TenantService } from "./tenant.service";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env.local", ".env", "../../.env.local", "../../.env"],
    }),
    TypeOrmModule.forRoot({
      type: "postgres",
      url: process.env.DATABASE_URL ?? "postgres://nexora:nexora_dev@localhost:5432/nexora",
      autoLoadEntities: true,
      synchronize: false,
    }),
    TypeOrmModule.forFeature([TenantEntity]),
  ],
  controllers: [TenantController],
  providers: [TenantService],
})
export class AppModule {}
