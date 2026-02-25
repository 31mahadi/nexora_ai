import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TimelineController } from "./timeline.controller";
import { TimelineItemEntity } from "./timeline-item.entity";
import { TimelineService } from "./timeline.service";

@Module({
  imports: [TypeOrmModule.forFeature([TimelineItemEntity])],
  controllers: [TimelineController],
  providers: [TimelineService],
  exports: [TimelineService],
})
export class TimelineModule {}
