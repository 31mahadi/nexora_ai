import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("blog_comments")
export class BlogCommentEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "blog_id", type: "uuid" })
  blogId!: string;

  @Column({ name: "tenant_id", type: "uuid" })
  tenantId!: string;

  @Column({ name: "guest_email", type: "varchar", length: 255, nullable: true })
  guestEmail!: string | null;

  @Column({ type: "text" })
  content!: string;
}
