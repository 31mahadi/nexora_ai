import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity("timeline_items")
export class TimelineItemEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "tenant_id", type: "uuid" })
  tenantId!: string;

  @Column({ type: "varchar", length: 50 })
  type!: string;

  @Column({ type: "varchar", length: 255 })
  title!: string;

  @Column({ type: "text", nullable: true })
  description!: string | null;

  @Column({ type: "date" })
  date!: string;

  @Column({ type: "text", array: true, default: () => "'{}'" })
  tags!: string[];

  @Column({ name: "related_blog_id", type: "uuid", nullable: true })
  relatedBlogId!: string | null;

  @Column({ type: "varchar", length: 20, default: "public" })
  visibility!: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
