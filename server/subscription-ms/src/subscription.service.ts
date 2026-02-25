import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { PlanEntity } from "./entities/plan.entity";
import { SubscriptionEntity } from "./entities/subscription.entity";
import { TenantEntity } from "./entities/tenant.entity";

export interface TenantSubscription {
  id: string;
  tenantId: string;
  tenantSubdomain: string;
  tenantName: string;
  planId: string;
  planName: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  trialEndsAt?: string;
  canceledAt?: string;
}

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectRepository(SubscriptionEntity)
    private readonly subscriptions: Repository<SubscriptionEntity>,
  ) {}

  private async findOne(whereSql: string, value: string): Promise<TenantSubscription | null> {
    const qb = this.subscriptions
      .createQueryBuilder("s")
      .innerJoin(TenantEntity, "t", "t.id = s.tenant_id")
      .innerJoin(PlanEntity, "p", "p.id = s.plan_id")
      .select([
        "s.id AS id",
        "s.tenant_id AS tenant_id",
        "t.subdomain AS tenant_subdomain",
        "t.name AS tenant_name",
        "s.plan_id AS plan_id",
        "p.name AS plan_name",
        "s.status AS status",
        "s.current_period_start AS current_period_start",
        "s.current_period_end AS current_period_end",
        "s.trial_ends_at AS trial_ends_at",
        "s.canceled_at AS canceled_at",
      ])
      .where(whereSql, { value })
      .limit(1);
    const row = (await qb.getRawOne<{
      id: string;
      tenant_id: string;
      tenant_subdomain: string;
      tenant_name: string;
      plan_id: string;
      plan_name: string;
      status: string;
      current_period_start: Date;
      current_period_end: Date;
      trial_ends_at: Date | null;
      canceled_at: Date | null;
    }>()) ?? null;
    if (!row) return null;

    return {
      id: row.id,
      tenantId: row.tenant_id,
      tenantSubdomain: row.tenant_subdomain,
      tenantName: row.tenant_name,
      planId: row.plan_id,
      planName: row.plan_name,
      status: row.status,
      currentPeriodStart: row.current_period_start.toISOString(),
      currentPeriodEnd: row.current_period_end.toISOString(),
      trialEndsAt: row.trial_ends_at?.toISOString(),
      canceledAt: row.canceled_at?.toISOString(),
    };
  }

  async findByTenantId(tenantId: string): Promise<TenantSubscription | null> {
    return this.findOne("s.tenant_id = :value", tenantId);
  }

  async findActiveByTenantId(tenantId: string): Promise<TenantSubscription> {
    const row = await this.subscriptions
      .createQueryBuilder("s")
      .innerJoin(TenantEntity, "t", "t.id = s.tenant_id")
      .innerJoin(PlanEntity, "p", "p.id = s.plan_id")
      .select([
        "s.id AS id",
        "s.tenant_id AS tenant_id",
        "t.subdomain AS tenant_subdomain",
        "t.name AS tenant_name",
        "s.plan_id AS plan_id",
        "p.name AS plan_name",
        "s.status AS status",
        "s.current_period_start AS current_period_start",
        "s.current_period_end AS current_period_end",
        "s.trial_ends_at AS trial_ends_at",
        "s.canceled_at AS canceled_at",
      ])
      .where("s.tenant_id = :tenantId", { tenantId })
      .andWhere("s.status IN (:...statuses)", { statuses: ["active", "trialing"] })
      .andWhere("s.canceled_at IS NULL")
      .limit(1)
      .getRawOne<{
      id: string;
      tenant_id: string;
      tenant_subdomain: string;
      tenant_name: string;
      plan_id: string;
      plan_name: string;
      status: string;
      current_period_start: Date;
      current_period_end: Date;
      trial_ends_at: Date | null;
      canceled_at: Date | null;
    }>();
    if (!row) {
      throw new NotFoundException(`No active subscription found for tenant ${tenantId}`);
    }

    return {
      id: row.id,
      tenantId: row.tenant_id,
      tenantSubdomain: row.tenant_subdomain,
      tenantName: row.tenant_name,
      planId: row.plan_id,
      planName: row.plan_name,
      status: row.status,
      currentPeriodStart: row.current_period_start.toISOString(),
      currentPeriodEnd: row.current_period_end.toISOString(),
      trialEndsAt: row.trial_ends_at?.toISOString(),
      canceledAt: row.canceled_at?.toISOString(),
    };
  }

  async findBySubdomain(subdomain: string): Promise<TenantSubscription | null> {
    return this.findOne("t.subdomain = :value", subdomain.toLowerCase());
  }
}
