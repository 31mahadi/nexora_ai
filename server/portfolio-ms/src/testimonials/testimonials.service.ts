import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { TestimonialEntity } from "./entities/testimonial.entity";

@Injectable()
export class TestimonialsService {
  constructor(
    @InjectRepository(TestimonialEntity)
    private readonly repo: Repository<TestimonialEntity>,
  ) {}

  async findAll(tenantId: string) {
    return this.repo.find({
      where: { tenantId },
      order: { sortOrder: "ASC", createdAt: "DESC" },
    });
  }

  async create(tenantId: string, data: { quote: string; author: string; role?: string | null }) {
    const row = this.repo.create({
      tenantId,
      quote: data.quote.trim(),
      author: data.author.trim().slice(0, 255),
      role: data.role?.trim().slice(0, 255) ?? null,
    });
    return this.repo.save(row);
  }

  async update(
    tenantId: string,
    id: string,
    data: { quote?: string; author?: string; role?: string | null },
  ) {
    const row = await this.repo.findOne({ where: { id, tenantId } });
    if (!row) return null;
    if (data.quote !== undefined) row.quote = data.quote.trim();
    if (data.author !== undefined) row.author = data.author.trim().slice(0, 255);
    if (data.role !== undefined) row.role = data.role?.trim().slice(0, 255) ?? null;
    return this.repo.save(row);
  }

  async delete(tenantId: string, id: string) {
    const result = await this.repo.delete({ id, tenantId });
    return { deleted: result.affected ? result.affected > 0 : false };
  }
}
