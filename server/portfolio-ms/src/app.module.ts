import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ContactModule } from "./contact/contact.module";
import { HealthController } from "./health.controller";
import { PortfolioModule } from "./portfolio/portfolio.module";
import { ProjectsModule } from "./projects/projects.module";
import { TemplatesModule } from "./templates/templates.module";
import { TestimonialsModule } from "./testimonials/testimonials.module";

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
    PortfolioModule,
    ContactModule,
    TestimonialsModule,
    ProjectsModule,
    TemplatesModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
