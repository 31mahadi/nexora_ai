import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("plans")
export class PlanEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 100 })
  name!: string;
}
