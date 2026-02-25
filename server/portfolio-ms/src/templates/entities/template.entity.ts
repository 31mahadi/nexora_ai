import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("portfolio_templates")
export class TemplateEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "tenant_id", type: "uuid" })
  tenantId!: string;

  @Column({ type: "varchar", length: 255 })
  name!: string;

  @Column({ type: "jsonb" })
  config!: Record<string, unknown>;

  @Column({ name: "created_at", type: "timestamptz", default: () => "NOW()" })
  createdAt!: Date;

  @Column({ name: "updated_at", type: "timestamptz", default: () => "NOW()" })
  updatedAt!: Date;
}
