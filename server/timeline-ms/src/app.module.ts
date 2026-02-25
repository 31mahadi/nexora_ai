import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { HealthController } from "./health.controller";
import { TimelineModule } from "./timeline/timeline.module";

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
    TimelineModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
