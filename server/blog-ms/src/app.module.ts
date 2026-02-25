import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BlogModule } from "./blog/blog.module";
import { HealthController } from "./health.controller";

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
    BlogModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
