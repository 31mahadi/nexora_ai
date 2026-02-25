import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("portfolio_skills")
export class PortfolioSkillEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "tenant_id", type: "uuid" })
  tenantId!: string;

  @Column({ type: "varchar", length: 100 })
  name!: string;

  @Column({ type: "varchar", length: 50, nullable: true })
  category!: string | null;

  @Column({ name: "sort_order", type: "int", default: 0 })
  sortOrder!: number;
}
