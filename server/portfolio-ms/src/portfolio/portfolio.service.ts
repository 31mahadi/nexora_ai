import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { PortfolioEntity } from "./entities/portfolio.entity";
import { PortfolioServiceEntity } from "./entities/portfolio-service.entity";
import { PortfolioSkillEntity } from "./entities/portfolio-skill.entity";

export interface Portfolio {
  id: string;
  tenantId: string;
  bio: string | null;
  tagline: string | null;
  avatarUrl: string | null;
  socialLinks: Record<string, string>;
}

export interface PortfolioSkill {
  id: string;
  name: string;
  category: string | null;
  sortOrder: number;
}

export interface PortfolioServiceItem {
  id: string;
  title: string;
  description: string | null;
  sortOrder: number;
}

@Injectable()
export class PortfolioService {
  constructor(
    @InjectRepository(PortfolioEntity)
    private readonly portfolios: Repository<PortfolioEntity>,
    @InjectRepository(PortfolioSkillEntity)
    private readonly skillsRepo: Repository<PortfolioSkillEntity>,
    @InjectRepository(PortfolioServiceEntity)
    private readonly servicesRepo: Repository<PortfolioServiceEntity>,
  ) {}

  async getByTenantId(tenantId: string) {
    const r = await this.portfolios.findOne({ where: { tenantId } });
    if (!r) return null;
    return {
      id: r.id,
      tenantId: r.tenantId,
      bio: r.bio,
      tagline: r.tagline,
      avatarUrl: r.avatarUrl,
      socialLinks: r.socialLinks ?? {},
    };
  }

  async upsert(
    tenantId: string,
    data: {
      bio?: string | null;
      tagline?: string | null;
      avatarUrl?: string | null;
      socialLinks?: Record<string, string>;
    },
  ) {
    let row = await this.portfolios.findOne({ where: { tenantId } });
    if (!row) {
      row = this.portfolios.create({
        tenantId,
        bio: data.bio ?? null,
        tagline: data.tagline ?? null,
        avatarUrl: data.avatarUrl ?? null,
        socialLinks: data.socialLinks ?? {},
      });
    } else {
      if (data.bio !== undefined) row.bio = data.bio;
      if (data.tagline !== undefined) row.tagline = data.tagline;
      if (data.avatarUrl !== undefined) row.avatarUrl = data.avatarUrl;
      if (data.socialLinks !== undefined) row.socialLinks = data.socialLinks;
    }
    await this.portfolios.save(row);
    return this.getByTenantId(tenantId);
  }

  async getSkills(tenantId: string): Promise<PortfolioSkill[]> {
    const rows = await this.skillsRepo.find({
      where: { tenantId },
      order: { sortOrder: "ASC", name: "ASC" },
    });
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      category: r.category,
      sortOrder: r.sortOrder,
    }));
  }

  async addSkill(
    tenantId: string,
    data: { name: string; category?: string | null },
  ) {
    const created = await this.skillsRepo.save(
      this.skillsRepo.create({
        tenantId,
        name: data.name,
        category: data.category ?? null,
      }),
    );
    const skills = await this.getSkills(tenantId);
    return skills.find((s) => s.id === created.id);
  }

  async removeSkill(tenantId: string, skillId: string) {
    await this.skillsRepo.delete({ tenantId, id: skillId });
  }

  async getServices(tenantId: string): Promise<PortfolioServiceItem[]> {
    const rows = await this.servicesRepo.find({
      where: { tenantId },
      order: { sortOrder: "ASC", title: "ASC" },
    });
    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      sortOrder: r.sortOrder,
    }));
  }

  async addService(
    tenantId: string,
    data: { title: string; description?: string | null },
  ) {
    await this.servicesRepo.save(
      this.servicesRepo.create({
        tenantId,
        title: data.title,
        description: data.description ?? null,
      }),
    );
    return this.getServices(tenantId);
  }

  async getPublic(tenantId: string) {
    const [portfolio, skills, services] = await Promise.all([
      this.getByTenantId(tenantId),
      this.getSkills(tenantId),
      this.getServices(tenantId),
    ]);
    return { portfolio, skills, services };
  }
}
