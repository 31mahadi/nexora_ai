import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ProjectEntity } from "./entities/project.entity";

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(ProjectEntity)
    private readonly repo: Repository<ProjectEntity>,
  ) {}

  async findAll(tenantId: string) {
    return this.repo.find({
      where: { tenantId },
      order: { sortOrder: "ASC", createdAt: "DESC" },
    });
  }

  async create(
    tenantId: string,
    data: {
      title: string;
      description?: string | null;
      imageUrl?: string | null;
      linkUrl?: string | null;
      tags?: string[];
    },
  ) {
    const row = this.repo.create({
      tenantId,
      title: data.title.trim().slice(0, 255),
      description: data.description?.trim() ?? null,
      imageUrl: data.imageUrl?.trim().slice(0, 500) ?? null,
      linkUrl: data.linkUrl?.trim().slice(0, 500) ?? null,
      tags: data.tags?.length ? data.tags : null,
    });
    return this.repo.save(row);
  }

  async update(
    tenantId: string,
    id: string,
    data: {
      title?: string;
      description?: string | null;
      imageUrl?: string | null;
      linkUrl?: string | null;
      tags?: string[];
    },
  ) {
    const row = await this.repo.findOne({ where: { id, tenantId } });
    if (!row) return null;
    if (data.title !== undefined) row.title = data.title.trim().slice(0, 255);
    if (data.description !== undefined) row.description = data.description?.trim() ?? null;
    if (data.imageUrl !== undefined) row.imageUrl = data.imageUrl?.trim().slice(0, 500) ?? null;
    if (data.linkUrl !== undefined) row.linkUrl = data.linkUrl?.trim().slice(0, 500) ?? null;
    if (data.tags !== undefined) row.tags = data.tags?.length ? data.tags : null;
    return this.repo.save(row);
  }

  async delete(tenantId: string, id: string) {
    const result = await this.repo.delete({ id, tenantId });
    return { deleted: result.affected ? result.affected > 0 : false };
  }
}
