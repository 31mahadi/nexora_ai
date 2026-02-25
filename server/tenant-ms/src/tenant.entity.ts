import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("tenants")
export class TenantEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 63, unique: true })
  subdomain!: string;

  @Column({ type: "varchar", length: 255 })
  name!: string;

  @Column({ name: "owner_id", type: "uuid" })
  ownerId!: string;

  @Column({ type: "varchar", length: 20, default: "active" })
  status!: string;

  @Column({ type: "jsonb", default: () => "'{}'" })
  theme!: Record<string, unknown>;

  @Column({ type: "jsonb", default: () => "'{}'" })
  settings!: Record<string, unknown>;

  @Column({ name: "custom_domain", type: "varchar", length: 255, nullable: true, unique: true })
  customDomain!: string | null;
}
