import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TestimonialEntity } from "./entities/testimonial.entity";
import { TestimonialsController } from "./testimonials.controller";
import { TestimonialsService } from "./testimonials.service";

@Module({
  imports: [TypeOrmModule.forFeature([TestimonialEntity])],
  controllers: [TestimonialsController],
  providers: [TestimonialsService],
  exports: [TestimonialsService],
})
export class TestimonialsModule {}
