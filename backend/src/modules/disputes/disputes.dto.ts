import "reflect-metadata";
import { IsUUID, IsString, IsEnum, IsOptional } from "class-validator";

export enum DisputeStatus {
  PENDING = "pending",
  RESOLVED = "resolved",
  REJECTED = "rejected",
}

export class CreateDisputeDto {
  @IsUUID()
  transaction_id!: string;

  @IsUUID()
  user_id!: string;

  @IsString()
  reason!: string;
}

export class UpdateDisputeDto {
  @IsEnum(DisputeStatus)
  status?: DisputeStatus;
}

export class DisputeResponseDto {
  @IsUUID()
  dispute_id!: string;

  @IsUUID()
  transaction_id!: string;

  @IsUUID()
  user_id!: string;

  @IsString()
  reason!: string;

  @IsEnum(DisputeStatus)
  status!: DisputeStatus;

  created_at!: Date;
  updated_at!: Date;
}
