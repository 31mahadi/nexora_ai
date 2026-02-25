import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PortfolioController } from "./portfolio.controller";
import { PortfolioEntity } from "./entities/portfolio.entity";
import { PortfolioServiceEntity } from "./entities/portfolio-service.entity";
import { PortfolioSkillEntity } from "./entities/portfolio-skill.entity";
import { PortfolioService } from "./portfolio.service";

@Module({
  imports: [TypeOrmModule.forFeature([PortfolioEntity, PortfolioSkillEntity, PortfolioServiceEntity])],
  controllers: [PortfolioController],
  providers: [PortfolioService],
  exports: [PortfolioService],
})
export class PortfolioModule {}
