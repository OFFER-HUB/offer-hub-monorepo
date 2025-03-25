import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { DisputeEntity } from "./disputes.entity";
import {
  CreateDisputeDto,
  UpdateDisputeDto,
  DisputeStatus,
} from "./disputes.dto";
import { Transaction } from "../transactions/entity";
import { User } from "../users/entity";

@Injectable()
export class DisputesService {
  constructor(
    @InjectRepository(DisputeEntity)
    private readonly disputeRepository: Repository<DisputeEntity>,

    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async createDispute(dto: CreateDisputeDto): Promise<DisputeEntity> {
    const transaction = await this.transactionRepository.findOne({
      where: { transaction_id: dto.transaction_id },
    });

    if (!transaction) {
      throw new NotFoundException("transaction_not_found");
    }

    const user = await this.userRepository.findOne({
      where: { user_id: dto.user_id },
    });

    if (!user) {
      throw new NotFoundException("user_not_found");
    }

    const dispute = this.disputeRepository.create({
      transaction: transaction,
      user,
      reason: dto.reason,
      status: DisputeStatus.PENDING,
    });

    return this.disputeRepository.save(dispute);
  }

  async getAllDisputes(): Promise<DisputeEntity[]> {
    return this.disputeRepository.find({
      relations: ["transaction", "user"],
      order: { created_at: "DESC" },
    });
  }

  async getDisputeById(id: string): Promise<DisputeEntity> {
    const dispute = await this.disputeRepository.findOne({
      where: { dispute_id: id },
      relations: ["transaction", "user"],
    });

    if (!dispute) {
      throw new NotFoundException("dispute_not_found");
    }

    return dispute;
  }

  async updateDispute(
    id: string,
    dto: UpdateDisputeDto
  ): Promise<DisputeEntity> {
    const dispute = await this.getDisputeById(id);

    if (dispute.status == dto.status) {
      throw new BadRequestException("already_same_status_set");
    }

    if (dto.status) {
      dispute.status = dto.status;
    }

    dispute.updated_at = new Date();

    return this.disputeRepository.save(dispute);
  }

  async deleteDispute(id: string): Promise<void> {
    const dispute = await this.getDisputeById(id);
    await this.disputeRepository.remove(dispute);
  }
}
