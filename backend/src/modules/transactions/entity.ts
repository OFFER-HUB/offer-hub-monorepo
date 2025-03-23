import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from "typeorm";
import { User } from "../users/entity";
import { Project } from "../projects/entity";

export enum TransactionStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  FAILED = "failed",
  CANCELLED = "cancelled"
}

export enum TransactionType {
  PAYMENT = "payment",
  ESCROW_DEPOSIT = "escrow_deposit",
  ESCROW_RELEASE = "escrow_release",
  REFUND = "refund"
}

@Entity("transactions")
export class Transaction {
  @PrimaryGeneratedColumn("uuid")
  transaction_id: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "from_user_id" })
  fromUser: User;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "to_user_id" })
  toUser: User;

  @ManyToOne(() => Project, { onDelete: "CASCADE" })
  @JoinColumn({ name: "project_id" })
  project: Project;

  @Column("decimal", { precision: 12, scale: 2, nullable: false })
  amount: number;

  @Column({ type: "varchar", length: 10, nullable: false })
  currency: string;

  @Column({ type: "varchar", length: 100, unique: true, nullable: false })
  transaction_hash: string;

  @Column({ type: "enum", enum: TransactionStatus, default: TransactionStatus.PENDING })
  status: TransactionStatus;

  @Column({ type: "enum", enum: TransactionType })
  type: TransactionType;

  @CreateDateColumn({ type: "timestamp with time zone", default: () => "CURRENT_TIMESTAMP" })
  created_at: Date;

  @Column({ type: "timestamp with time zone", nullable: true })
  completed_at?: Date;

  @Column({ type: "varchar", length: 255, nullable: true })
  invoice_path?: string;
}
