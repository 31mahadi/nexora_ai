import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("portfolio_projects")
export class ProjectEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "tenant_id", type: "uuid" })
  tenantId!: string;

  @Column({ type: "varchar", length: 255 })
  title!: string;

  @Column({ type: "text", nullable: true })
  description!: string | null;

  @Column({ name: "image_url", type: "varchar", length: 500, nullable: true })
  imageUrl!: string | null;

  @Column({ name: "link_url", type: "varchar", length: 500, nullable: true })
  linkUrl!: string | null;

  @Column({ type: "text", array: true, nullable: true })
  tags!: string[] | null;

  @Column({ name: "sort_order", type: "int", default: 0 })
  sortOrder!: number;

  @Column({ name: "created_at", type: "timestamptz", default: () => "NOW()" })
  createdAt!: Date;
}
