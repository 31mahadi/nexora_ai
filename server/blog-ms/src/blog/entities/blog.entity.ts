import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity("blogs")
export class BlogEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "tenant_id", type: "uuid" })
  tenantId!: string;

  @Column({ type: "varchar", length: 255 })
  title!: string;

  @Column({ type: "varchar", length: 255 })
  slug!: string;

  @Column({ type: "text" })
  content!: string;

  @Column({ type: "text", nullable: true })
  excerpt!: string | null;

  @Column({ name: "cover_image", type: "varchar", length: 500, nullable: true })
  coverImage!: string | null;

  @Column({ type: "boolean", default: false })
  published!: boolean;

  @Column({ name: "published_at", type: "timestamptz", nullable: true })
  publishedAt!: Date | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
