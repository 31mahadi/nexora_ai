import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("contact_submissions")
export class ContactSubmissionEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "tenant_id", type: "uuid" })
  tenantId!: string;

  @Column({ type: "varchar", length: 255 })
  name!: string;

  @Column({ type: "varchar", length: 255 })
  email!: string;

  @Column({ type: "text" })
  message!: string;

  @Column({ name: "created_at", type: "timestamptz", default: () => "NOW()" })
  createdAt!: Date;
}
