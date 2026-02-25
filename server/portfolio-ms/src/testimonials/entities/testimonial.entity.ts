import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("testimonials")
export class TestimonialEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "tenant_id", type: "uuid" })
  tenantId!: string;

  @Column({ type: "text" })
  quote!: string;

  @Column({ type: "varchar", length: 255 })
  author!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  role!: string | null;

  @Column({ name: "sort_order", type: "int", default: 0 })
  sortOrder!: number;

  @Column({ name: "created_at", type: "timestamptz", default: () => "NOW()" })
  createdAt!: Date;
}
