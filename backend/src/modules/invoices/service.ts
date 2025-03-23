import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PdfService, InvoiceData } from '../pdf/service';
import { TransactionsService } from '../transactions/service';
import { UsersService } from '../users/service';
import { ProjectsService } from '../projects/service';
import { Transaction, TransactionStatus } from '../transactions/entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class InvoiceService {
    private readonly logger = new Logger(InvoiceService.name);

    constructor(
        private readonly pdfService: PdfService,
        private readonly transactionsService: TransactionsService,
        private readonly usersService: UsersService,
        private readonly projectsService: ProjectsService,
        @InjectRepository(Transaction)
        private readonly transactionRepository: Repository<Transaction>,
    ) {}

    /**
     * Generates an invoice for a completed transaction
     * @param transactionId ID of the transaction
     * @returns URL of the generated invoice in MinIO
     */
    async generateInvoiceForTransaction(transactionId: string): Promise<string> {
        try {
            // Get the complete transaction with relations
            const transaction = await this.transactionsService.findById(transactionId);
            
            // Verify that the transaction is completed
            if (transaction.status !== TransactionStatus.COMPLETED) {
                this.logger.warn(`Cannot generate invoice for incomplete transaction: ${transactionId}`);
                throw new Error('Invoices can only be generated for completed transactions');
            }

            // Check if an invoice already exists for this transaction
            if (transaction.invoice_path) {
                this.logger.log(`Transaction ${transactionId} already has a generated invoice`);
                return transaction.invoice_path;
            }

            // Convert transaction data to invoice format
            const invoiceData = await this.mapTransactionToInvoiceData(transaction);
            
            // Generate the invoice in PDF and store it in MinIO
            const invoiceUrl = await this.pdfService.generateInvoice(invoiceData);
            
            // Update the transaction with the invoice URL
            await this.transactionRepository.update(
                { transaction_id: transactionId },
                { invoice_path: invoiceUrl }
            );
            
            this.logger.log(`Invoice successfully generated for transaction ${transactionId}`);
            return invoiceUrl;
        } catch (error) {
            this.logger.error(`Error generating invoice for transaction ${transactionId}: ${error.message}`);
            throw error;
        }
    }

    /**
     * Gets the URL of the invoice for a transaction
     * @param transactionId ID of the transaction
     * @param userId ID of the requesting user (for verification)
     * @returns URL of the invoice
     */
    async getInvoiceUrl(transactionId: string, userId: string): Promise<string> {
        try {
            // Get the transaction
            const transaction = await this.transactionsService.findById(transactionId);
            
            // Verify that the user has permission to access this invoice
            if (transaction.fromUser.user_id !== userId && transaction.toUser.user_id !== userId) {
                throw new Error('You do not have permission to access this invoice');
            }
            
            // If the transaction already has a generated invoice, return its URL
            if (transaction.invoice_path) {
                return transaction.invoice_path;
            }
            
            // If there is no invoice but the transaction is completed, generate it
            if (transaction.status === TransactionStatus.COMPLETED) {
                return await this.generateInvoiceForTransaction(transactionId);
            }
            
            throw new NotFoundException('No invoice exists for this transaction');
        } catch (error) {
            this.logger.error(`Error getting invoice URL: ${error.message}`);
            throw error;
        }
    }

    /**
     * Converts a transaction into invoice data
     * @param transaction Completed transaction
     * @returns Formatted invoice data
     */
    private async mapTransactionToInvoiceData(transaction: Transaction): Promise<InvoiceData> {
        // Extract users and project
        const fromUser = transaction.fromUser;
        const toUser = transaction.toUser;
        const project = transaction.project;

        // In a payment transaction, the client is fromUser and the freelancer is toUser
        const isPayment = transaction.type === 'payment' || transaction.type === 'escrow_release';
        
        // Map data according to the type of transaction
        const client = isPayment ? fromUser : toUser;
        const freelancer = isPayment ? toUser : fromUser;

        // Get user profiles if necessary
        // const clientProfile = await this.userProfileService.findByUserId(client.user_id);
        // const freelancerProfile = await this.userProfileService.findByUserId(freelancer.user_id);

        // Create an item for the service
        const items = [{
            description: `Service: ${project.title}`,
            quantity: 1,
            unitPrice: transaction.amount,
            total: transaction.amount,
        }];

        // Create the invoice data
        const invoiceData: InvoiceData = {
            id: `INV-${transaction.transaction_id.substring(0, 8)}`,
            invoiceNumber: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${transaction.transaction_id.substring(0, 5)}`,
            createdAt: transaction.completed_at || transaction.created_at,
            dueDate: undefined, // Invoices for completed payments do not have a due date
            
            transactionId: transaction.transaction_id,
            transactionHash: transaction.transaction_hash,
            amount: transaction.amount,
            currency: transaction.currency,
            status: transaction.status,
            
            client: {
                id: client.user_id,
                name: `${client.username}`,
                email: client.email,
                walletAddress: client?.wallet_address,
            },
            
            freelancer: {
                id: freelancer.user_id,
                name: `${freelancer.username}`,
                email: freelancer.email,
                walletAddress: freelancer?.wallet_address,
            },
            
            project: {
                id: project.project_id,
                title: project.title,
                description: project.description,
            },
            
            items: items,
            
            subtotal: transaction.amount,
            // taxRate: 0, // Add taxes if necessary
            // tax: 0,
            total: transaction.amount,
        };

        return invoiceData;
    }
}