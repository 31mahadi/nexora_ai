import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("tenants")
export class TenantEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 63 })
  subdomain!: string;

  @Column({ type: "varchar", length: 255 })
  name!: string;
}
