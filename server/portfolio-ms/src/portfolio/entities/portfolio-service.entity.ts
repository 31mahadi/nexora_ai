import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("portfolio_services")
export class PortfolioServiceEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "tenant_id", type: "uuid" })
  tenantId!: string;

  @Column({ type: "varchar", length: 255 })
  title!: string;

  @Column({ type: "text", nullable: true })
  description!: string | null;

  @Column({ name: "sort_order", type: "int", default: 0 })
  sortOrder!: number;
}
