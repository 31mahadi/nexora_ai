import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { TimelineItemEntity } from "./timeline-item.entity";

const TYPES = [
  "blog",
  "achievement",
  "education",
  "role",
  "promotion",
  "award",
  "project",
] as const;

export type TimelineType = (typeof TYPES)[number];

export interface TimelineItem {
  id: string;
  tenantId: string;
  type: TimelineType;
  title: string;
  description: string | null;
  date: string;
  tags: string[];
  relatedBlogId: string | null;
  visibility: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class TimelineService {
  constructor(
    @InjectRepository(TimelineItemEntity)
    private readonly timelineRepo: Repository<TimelineItemEntity>,
  ) {}

  private mapRow(r: TimelineItemEntity): TimelineItem {
    const now = new Date().toISOString();
    return {
      id: r.id,
      tenantId: r.tenantId,
      type: r.type as TimelineType,
      title: r.title,
      description: r.description,
      date: r.date,
      tags: r.tags ?? [],
      relatedBlogId: r.relatedBlogId,
      visibility: r.visibility,
      createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : now,
      updatedAt: r.updatedAt ? new Date(r.updatedAt).toISOString() : now,
    };
  }

  async create(
    tenantId: string,
    data: {
      type: TimelineType;
      title: string;
      description?: string | null;
      date: string;
      tags?: string[];
      relatedBlogId?: string | null;
    },
  ): Promise<TimelineItem> {
    if (!TYPES.includes(data.type)) throw new Error("Invalid type");
    const created = await this.timelineRepo.save(
      this.timelineRepo.create({
        tenantId,
        type: data.type,
        title: data.title,
        description: data.description ?? null,
        date: data.date,
        tags: data.tags ?? [],
        relatedBlogId: data.relatedBlogId ?? null,
      }),
    );
    return this.mapRow(created);
  }

  async findAll(
    tenantId: string,
    filters?: {
      type?: TimelineType;
      from?: string;
      to?: string;
      tags?: string[];
    },
  ): Promise<TimelineItem[]> {
    const qb = this.timelineRepo
      .createQueryBuilder("t")
      .where("t.tenant_id = :tenantId", { tenantId })
      .andWhere("t.visibility = 'public'");

    if (filters?.type) qb.andWhere("t.type = :type", { type: filters.type });
    if (filters?.from) qb.andWhere("t.date >= :from", { from: filters.from });
    if (filters?.to) qb.andWhere("t.date <= :to", { to: filters.to });
    if (filters?.tags?.length) qb.andWhere("t.tags && ARRAY[:...tags]", { tags: filters.tags });

    const rows = await qb.orderBy("t.date", "DESC").getMany();
    return rows.map((row) => this.mapRow(row));
  }

  async findAllAdmin(tenantId: string): Promise<TimelineItem[]> {
    const rows = await this.timelineRepo.find({
      where: { tenantId },
      order: { date: "DESC" },
    });
    return rows.map((row) => this.mapRow(row));
  }

  async findById(tenantId: string, id: string): Promise<TimelineItem | null> {
    const row = await this.timelineRepo.findOne({ where: { tenantId, id } });
    return row ? this.mapRow(row) : null;
  }

  async update(
    tenantId: string,
    id: string,
    data: Partial<{
      type: TimelineType;
      title: string;
      description: string;
      date: string;
      tags: string[];
      visibility: string;
    }>,
  ): Promise<TimelineItem> {
    const existing = await this.findById(tenantId, id);
    if (!existing) throw new NotFoundException("Timeline item not found");

    const row = await this.timelineRepo.findOne({ where: { tenantId, id } });
    if (!row) throw new NotFoundException("Timeline item not found");
    if (data.type !== undefined) row.type = data.type;
    if (data.title !== undefined) row.title = data.title;
    if (data.description !== undefined) row.description = data.description;
    if (data.date !== undefined) row.date = data.date;
    if (data.tags !== undefined) row.tags = data.tags;
    if (data.visibility !== undefined) row.visibility = data.visibility;
    await this.timelineRepo.save(row);
    return (await this.findById(tenantId, id))!;
  }

  async delete(tenantId: string, id: string): Promise<void> {
    const res = await this.timelineRepo.delete({ tenantId, id });
    if (!res.affected) throw new NotFoundException("Timeline item not found");
  }
}
