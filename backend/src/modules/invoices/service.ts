import { Injectable, Logger } from '@nestjs/common';
import { PdfService, InvoiceData } from '../pdf/service';
import { TransactionsService } from '../transactions/service';
import { UserProfileService } from '../user-profiles/service';
import { ProjectsService } from '../projects/service';
import { Transaction, TransactionStatus } from '../transactions/entity';

@Injectable()
export class InvoiceService {
    private readonly logger = new Logger(InvoiceService.name);

    constructor(
        private readonly pdfService: PdfService,
        private readonly transactionsService: TransactionsService,
        private readonly usersService: UserProfileService,
        private readonly projectsService: ProjectsService,
    ) {}

    /**
     * Generates an invoice for a completed transaction
     * @param transactionId ID of the transaction
     * @returns Path of the generated PDF file
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

            // Convert transaction data to invoice format
            const invoiceData = await this.mapTransactionToInvoiceData(transaction);
            
            // Generate the invoice in PDF
            const pdfPath = await this.pdfService.generateInvoice(invoiceData);
            
            return pdfPath;
        } catch (error) {
            this.logger.error(`Error generating invoice for transaction ${transactionId}: ${error.message}`);
            throw error;
        }
    }

    /**
     * Converts a transaction into invoice data
     * @param transaction Completed transaction
     * @returns Formatted data for the invoice
     */
    private async mapTransactionToInvoiceData(transaction: Transaction): Promise<InvoiceData> {
        // Extract users and project
        const fromUser = transaction.fromUser;
        const toUser = transaction.toUser;
        const project = transaction.project;

        // In a payment transaction, the client is fromUser and the freelancer is toUser
        const isPayment = transaction.type === 'payment' || transaction.type === 'escrow_release';
        
        // Map data according to the transaction type
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
            dueDate: undefined, // Completed payment invoices do not have a due date
            
            transactionId: transaction.transaction_id,
            transactionHash: transaction.transaction_hash,
            amount: transaction.amount,
            currency: transaction.currency,
            status: transaction.status,
            
            client: {
                id: client.user_id,
                name: `${client.username}`,
                email: client.email,
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
