import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { TenantEntity } from "./tenant.entity";

export interface Tenant {
  id: string;
  subdomain: string;
  name: string;
  ownerId: string;
  status: string;
  theme: Record<string, unknown>;
  settings: Record<string, unknown>;
  customDomain: string | null;
}

@Injectable()
export class TenantService {
  constructor(
    @InjectRepository(TenantEntity)
    private readonly tenants: Repository<TenantEntity>,
  ) {}

  async findBySubdomain(subdomain: string): Promise<Tenant | null> {
    const r = await this.tenants.findOne({
      where: { subdomain: subdomain.toLowerCase(), status: "active" },
    });
    if (!r) return null;
    return this.mapTenant(r);
  }

  async findByCustomDomain(host: string): Promise<Tenant | null> {
    const normalized = host.toLowerCase().replace(/:\d+$/, "");
    const r = await this.tenants.findOne({
      where: { customDomain: normalized, status: "active" },
    });
    if (!r) return null;
    return this.mapTenant(r);
  }

  async resolve(subdomainOrHost: string): Promise<Tenant> {
    const tenant = await this.findBySubdomain(subdomainOrHost);
    if (tenant) return tenant;
    const byDomain = await this.findByCustomDomain(subdomainOrHost);
    if (byDomain) return byDomain;
    throw new NotFoundException(`Tenant not found: ${subdomainOrHost}`);
  }

  async findById(id: string): Promise<Tenant | null> {
    const r = await this.tenants.findOne({
      where: { id, status: "active" },
    });
    if (!r) return null;
    return this.mapTenant(r);
  }

  async updateTheme(tenantId: string, theme: Record<string, unknown>): Promise<Tenant> {
    const r = await this.tenants.findOne({ where: { id: tenantId } });
    if (!r) throw new NotFoundException("Tenant not found");
    r.theme = theme;
    await this.tenants.save(r);
    return this.mapTenant(r);
  }

  async updateCustomDomain(tenantId: string, customDomain: string | null): Promise<Tenant> {
    const r = await this.tenants.findOne({ where: { id: tenantId } });
    if (!r) throw new NotFoundException("Tenant not found");
    r.customDomain = customDomain ? customDomain.toLowerCase().trim() || null : null;
    await this.tenants.save(r);
    return this.mapTenant(r);
  }

  async updateSiteConfig(
    tenantId: string,
    payload: { theme?: Record<string, unknown>; settings?: Record<string, unknown> },
  ): Promise<Tenant> {
    const r = await this.tenants.findOne({ where: { id: tenantId } });
    if (!r) throw new NotFoundException("Tenant not found");

    if (payload.theme && typeof payload.theme === "object") {
      r.theme = payload.theme;
    }

    if (payload.settings && typeof payload.settings === "object") {
      const currentSettings = (r.settings ?? {}) as Record<string, unknown>;
      r.settings = {
        ...currentSettings,
        ...payload.settings,
      };
    }

    await this.tenants.save(r);
    return this.mapTenant(r);
  }

  private mapTenant(r: TenantEntity): Tenant {
    return {
      id: r.id,
      subdomain: r.subdomain,
      name: r.name,
      ownerId: r.ownerId,
      status: r.status,
      theme: r.theme ?? {},
      settings: r.settings ?? {},
      customDomain: r.customDomain ?? null,
    };
  }
}
