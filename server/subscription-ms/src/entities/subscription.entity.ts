import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("subscriptions")
export class SubscriptionEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "tenant_id", type: "uuid", unique: true })
  tenantId!: string;

  @Column({ name: "plan_id", type: "uuid" })
  planId!: string;

  @Column({ type: "varchar", length: 30 })
  status!: string;

  @Column({ name: "current_period_start", type: "timestamptz" })
  currentPeriodStart!: Date;

  @Column({ name: "current_period_end", type: "timestamptz" })
  currentPeriodEnd!: Date;

  @Column({ name: "trial_ends_at", type: "timestamptz", nullable: true })
  trialEndsAt!: Date | null;

  @Column({ name: "canceled_at", type: "timestamptz", nullable: true })
  canceledAt!: Date | null;
}
