import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Transaction } from "../transactions/entity";
import { DisputeStatus } from "./disputes.dto";
import { User } from "../users/entity";

@Entity("disputes")
export class DisputeEntity {
  @PrimaryGeneratedColumn("uuid")
  dispute_id!: string;

  @ManyToOne(() => Transaction, { onDelete: "CASCADE" })
  @JoinColumn({ name: "transaction_id" })
  transaction!: Transaction;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user!: User;

  @Column("text")
  reason!: string;

  @Column({
    type: "enum",
    enum: DisputeStatus,
    default: DisputeStatus.PENDING,
  })
  status!: DisputeStatus;

  @CreateDateColumn({ type: "timestamp" })
  created_at!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at!: Date;
}
