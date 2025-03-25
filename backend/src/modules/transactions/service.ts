import { forwardRef, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateTransactionDto, UpdateTransactionDto } from "./dto";
import { Transaction, TransactionStatus, TransactionType } from "./entity";
import { User } from "../users/entity";
import { Project } from "../projects/entity";
import { InvoiceService } from "../invoices/service";
import { DisputeEntity } from "../disputes/disputes.entity";
import { DisputeStatus } from "../disputes/disputes.dto";

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly repo: Repository<Transaction>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Project) private readonly projectRepo: Repository<Project>,
    @Inject(forwardRef(() => InvoiceService)) private readonly invoiceService: InvoiceService,
    @InjectRepository(DisputeEntity)
    private readonly disputerepo: Repository<DisputeEntity>
  ) {}

  async findAll(): Promise<Transaction[]> {
    return this.repo.find({ relations: ["fromUser", "toUser", "project"] });
  }

  async create(dto: CreateTransactionDto): Promise<Transaction> {
    const fromUser = await this.userRepo.findOne({
      where: { user_id: dto.from_user_id },
    });
    if (!fromUser)
      throw new NotFoundException(
        `User with ID ${dto.from_user_id} not found.`
      );

    const toUser = await this.userRepo.findOne({
      where: { user_id: dto.to_user_id },
    });
    if (!toUser)
      throw new NotFoundException(`User with ID ${dto.to_user_id} not found.`);

    const project = await this.projectRepo.findOne({
      where: { project_id: dto.project_id },
    });
    if (!project)
      throw new NotFoundException(
        `Project with ID ${dto.project_id} not found.`
      );

    const transaction = this.repo.create({
      ...dto,
      fromUser,
      toUser,
      project,
      status: dto.status as TransactionStatus,
      type: dto.type as TransactionType,
      completed_at:
        dto.status === TransactionStatus.COMPLETED ? new Date() : undefined,
    });

    const savedTransaction = await this.repo.save(transaction);

    if (savedTransaction.status === TransactionStatus.COMPLETED && 
      (savedTransaction.type === TransactionType.PAYMENT || 
        savedTransaction.type === TransactionType.ESCROW_RELEASE)) {
      try {
        const invoicePath = await this.invoiceService.generateInvoiceForTransaction(savedTransaction.transaction_id);
        
        // Save the reference to the PDF in the database
        // For this, we would need to add an invoice_path field to the Transaction entity
        // Since we don't have that field now, we can log or handle it differently
        console.log(`Invoice generated successfully: ${invoicePath}`);
        
        // Ideally, update the transaction with the invoice path
        // savedTransaction.invoice_path = invoicePath;
        // await this.repo.save(savedTransaction);
            } catch (error) {
        console.error(`Error generating invoice for transaction ${savedTransaction.transaction_id}:`, error);
      }
    }

    return savedTransaction;
  }

  async findById(transaction_id: string): Promise<Transaction> {
    const transaction = await this.repo.findOne({
      where: { transaction_id },
      relations: ["fromUser", "toUser", "project"],
    });
    if (!transaction)
      throw new NotFoundException(
        `Transaction with ID ${transaction_id} not found.`
      );
    return transaction;
  }

  async update(
    transaction_id: string,
    dto: UpdateTransactionDto
  ): Promise<Transaction> {
    const transaction = await this.findById(transaction_id);
    const oldStatus = transaction.status;
    
    Object.assign(transaction, dto);
    
    // If updated to COMPLETED, set the completion date
    if (dto.status === TransactionStatus.COMPLETED && oldStatus !== TransactionStatus.COMPLETED) {
      transaction.completed_at = new Date();
    }
    
    const updatedTransaction = await this.repo.save(transaction);
    
    // Generate invoice if the transaction changes to COMPLETED and is of payment type
    if (oldStatus !== TransactionStatus.COMPLETED && 
        updatedTransaction.status === TransactionStatus.COMPLETED && 
        (updatedTransaction.type === TransactionType.PAYMENT || 
         updatedTransaction.type === TransactionType.ESCROW_RELEASE)) {
      try {
        const invoicePath = await this.invoiceService.generateInvoiceForTransaction(updatedTransaction.transaction_id);
        
        // Save the reference to the PDF in the database
        // For this, we would need to add an invoice_path field to the Transaction entity
        console.log(`Invoice automatically generated upon transaction completion: ${invoicePath}`);
        
        // Ideally, update the transaction with the invoice path
        // updatedTransaction.invoice_path = invoicePath;
        // await this.repo.save(updatedTransaction);
      } catch (error) {
        console.error(`Error generating invoice for transaction ${updatedTransaction.transaction_id}:`, error);
      }
    }
    
    return updatedTransaction;
  }

  async delete(transaction_id: string): Promise<void> {
    const result = await this.repo.delete(transaction_id);
    if (result.affected === 0)
      throw new NotFoundException(
        `Transaction with ID ${transaction_id} not found.`
      );
  }

  async releaseFunds(transaction_id: string) {
    const transaction = await this.repo.findOne({
      where: { transaction_id },
    });

    if (!transaction) {
      return { message: "transaction_Not_found" };
    }

    if (transaction.status !== TransactionStatus.PENDING) {
      return { message: "Funds_already_released" };
    }

    const dispute = await this.disputerepo.findOne({
      where: { transaction },
    });

    if (dispute?.status !== DisputeStatus.RESOLVED) {
      return { message: "Transaction_not_completed_while_dispute_active" };
    }

    transaction.status = TransactionStatus.COMPLETED;
    transaction.completed_at = new Date();
    await this.repo.save(transaction);

    return { message: "fund_released_successfully", transaction };
  }
}
