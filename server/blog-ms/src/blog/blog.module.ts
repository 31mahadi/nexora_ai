import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BlogController } from "./blog.controller";
import { BlogCommentEntity } from "./entities/blog-comment.entity";
import { BlogEntity } from "./entities/blog.entity";
import { BlogService } from "./blog.service";

@Module({
  imports: [TypeOrmModule.forFeature([BlogEntity, BlogCommentEntity])],
  controllers: [BlogController],
  providers: [BlogService],
  exports: [BlogService],
})
export class BlogModule {}
