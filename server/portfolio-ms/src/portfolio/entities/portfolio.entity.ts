import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("portfolios")
export class PortfolioEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "tenant_id", type: "uuid", unique: true })
  tenantId!: string;

  @Column({ type: "text", nullable: true })
  bio!: string | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  tagline!: string | null;

  @Column({ name: "avatar_url", type: "varchar", length: 500, nullable: true })
  avatarUrl!: string | null;

  @Column({ name: "social_links", type: "jsonb", default: () => "'{}'" })
  socialLinks!: Record<string, string>;
}
