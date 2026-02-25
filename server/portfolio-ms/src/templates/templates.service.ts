import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { TemplateEntity } from "./entities/template.entity";

@Injectable()
export class TemplatesService {
  constructor(
    @InjectRepository(TemplateEntity)
    private readonly repo: Repository<TemplateEntity>,
  ) {}

  async findAll(tenantId: string) {
    return this.repo.find({
      where: { tenantId },
      order: { updatedAt: "DESC" },
    });
  }

  async create(tenantId: string, data: { name: string; config: Record<string, unknown> }) {
    const row = this.repo.create({
      tenantId,
      name: data.name.trim().slice(0, 255),
      config: data.config ?? {},
    });
    return this.repo.save(row);
  }

  async update(
    tenantId: string,
    id: string,
    data: { name?: string; config?: Record<string, unknown> },
  ) {
    const row = await this.repo.findOne({ where: { id, tenantId } });
    if (!row) throw new NotFoundException("Template not found");
    if (data.name !== undefined) row.name = data.name.trim().slice(0, 255);
    if (data.config !== undefined) row.config = data.config;
    row.updatedAt = new Date();
    return this.repo.save(row);
  }

  async delete(tenantId: string, id: string) {
    const result = await this.repo.delete({ id, tenantId });
    return { deleted: result.affected ? result.affected > 0 : false };
  }
}
