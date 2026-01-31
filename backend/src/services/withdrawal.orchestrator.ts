/**
 * @fileoverview Withdrawal Orchestrator for managing the withdrawal process
 */

import { supabase } from "@/lib/supabase/supabase";
import { Withdrawal, WithdrawalStatus } from "@/types/withdrawal.types";
import { WithdrawalStateMachine } from "./withdrawal.state-machine";
import { airtmPayoutClient } from "./airtm.client";
import {
    AppError,
    BadRequestError,
    InternalServerError,
    ValidationError,
    InsufficientFundsError
} from "@/utils/AppError";
import { logger } from "@/utils/logger";
import { validateUUID, validateEmail } from "@/utils/validation";
import { balanceService } from "./balance.service";
import { airtmUserClient } from "@/lib/airtm.client";

export class WithdrawalOrchestrator {
    private readonly MIN_AMOUNT = 5;
    private readonly MAX_AMOUNT = 500;

    /**
     * Initiates the withdrawal process.
     * Validates request, checks eligibility, creates record, and holds funds.
     * @param userId - ID of the user withdrawing funds
     * @param amount - Amount to withdraw
     * @param currency - Currency code
     * @param destinationEmail - Email to send funds to
     * @returns Created Withdrawal object
     */
    async initiateWithdrawal(
        userId: string,
        amount: number,
        currency: string,
        destinationEmail: string
    ): Promise<Withdrawal> {
        const correlationId = crypto.randomUUID();
        let withdrawalId: string | undefined;

        try {
            logger.info(`[WithdrawalOrchestrator] Starting initiateWithdrawal ${correlationId} - User: ${userId}, Amount: ${amount} ${currency}`);

            // 1. Basic Validations
            if (!validateUUID(userId)) {
                throw new BadRequestError("Invalid user ID format");
            }

            if (!validateEmail(destinationEmail)) {
                throw new BadRequestError("Invalid destination email format");
            }

            if (amount < this.MIN_AMOUNT || amount > this.MAX_AMOUNT) {
                throw new ValidationError(`Amount must be between ${this.MIN_AMOUNT} and ${this.MAX_AMOUNT}`);
            }

            // 2. Check Sufficient Balance (Preliminary check)
            const balances = (await balanceService.getUserBalances(
                userId,
                currency
            )) as Array<{ currency: string; available: number | string }>;
            const userBalance = balances.find(
                (balance) => balance.currency === currency
            );
            const available = userBalance ? Number(userBalance.available) : 0;

            if (available < amount) {
                throw new InsufficientFundsError(
                    "Insufficient available funds",
                    { userId, currency, requestedAmount: amount, available }
                );
            }

            // 3. Verify Airtm Eligibility
            const isEligible = await airtmUserClient.verifyUserEligibility(destinationEmail);
            if (!isEligible) {
                throw new ValidationError("User is not eligible for Airtm withdrawal with this email");
            }

            // 4. Create Withdrawal Record (Status: CREATED)
            const { data: withdrawal, error: createError } = await supabase
                .from('withdrawals')
                .insert({
                    user_id: userId,
                    amount: amount,
                    currency: currency,
                    destination_email: destinationEmail,
                    status: WithdrawalStatus.WITHDRAWAL_CREATED
                })
                .select()
                .single();

            if (createError || !withdrawal) {
                logger.error(`[WithdrawalOrchestrator] Failed to create withdrawal record ${correlationId}`, createError);
                throw new InternalServerError("Failed to create withdrawal record");
            }

            withdrawalId = withdrawal.id;

            // 5. Hold Balance
            try {
                await balanceService.holdBalance(
                    userId,
                    amount,
                    currency,
                    { id: withdrawalId!, type: 'withdrawal' },
                    `Withdrawal hold for ${withdrawalId}`
                );
            } catch (holdError) {
                logger.error(`[WithdrawalOrchestrator] Failed to hold balance ${correlationId}`, holdError);
                // Rollback: Update status to FAILED
                await this.updateWithdrawalStatusRaw(withdrawalId!, WithdrawalStatus.FAILED);
                throw holdError;
            }

            // 6. Transition to PENDING_VERIFICATION
            try {
                await this.updateWithdrawalStatusRaw(withdrawalId!, WithdrawalStatus.WITHDRAWAL_PENDING_VERIFICATION);
            } catch (updateError) {
                logger.error(`[WithdrawalOrchestrator] CRITICAL: Funds held but status update failed ${correlationId}`, updateError);
                throw new InternalServerError("Withdrawal processed but status update failed. Please contact support.");
            }

            // Return updated object
            const { data: updatedWithdrawal, error: fetchError } = await supabase
                .from('withdrawals')
                .select('*')
                .eq('id', withdrawalId)
                .single();

            if (fetchError || !updatedWithdrawal) {
                throw new InternalServerError("Failed to retrieve updated withdrawal");
            }

            logger.info(`[WithdrawalOrchestrator] Success ${correlationId} - Withdrawal ${withdrawalId} initiated`);
            return updatedWithdrawal as Withdrawal;

        } catch (error: any) {
            logger.error(`[WithdrawalOrchestrator] Error ${correlationId}`, error);
            throw error;
        }
    }

    /**
     * Processes a pending withdrawal by creating and committing a payout in Airtm.
     * @param withdrawalId - The ID of the withdrawal to process
     * @returns Updated Withdrawal object
     */
    async processWithdrawal(withdrawalId: string): Promise<Withdrawal> {
        const correlationId = crypto.randomUUID();
        logger.info(`[WithdrawalOrchestrator] Starting processWithdrawal ${withdrawalId} (${correlationId})`);

        try {
            // 1. Validates withdrawal exists and belongs to valid state
            const { data: withdrawal, error: fetchError } = await supabase
                .from('withdrawals')
                .select('*, users(email)')
                .eq('id', withdrawalId)
                .single();

            if (fetchError || !withdrawal) {
                throw new AppError(`Withdrawal ${withdrawalId} not found`, 404, 'WITHDRAWAL_NOT_FOUND');
            }

            // 2. Validates state transition is allowed via WithdrawalStateMachine
            WithdrawalStateMachine.validateTransition(withdrawal.status as WithdrawalStatus, WithdrawalStatus.PROCESSING);

            // 3. Transitions to WITHDRAWAL_PROCESSING & creates audit log
            await this.updateStatus(withdrawalId, withdrawal.status as WithdrawalStatus, WithdrawalStatus.PROCESSING, correlationId);

            // 4. Calls AirtmPayoutClient.createPayout()
            const userEmail = (withdrawal.users as any)?.email;
            if (!userEmail) {
                throw new AppError('User email not found for withdrawal', 400, 'USER_EMAIL_MISSING');
            }

            let payoutResponse;
            try {
                payoutResponse = await airtmPayoutClient.createPayout(withdrawalId, withdrawal.amount, userEmail);
            } catch (airtmError: any) {
                logger.error(`[WithdrawalOrchestrator] Airtm createPayout error: ${airtmError.message}`);
                await this.handleAirtmError(withdrawalId, WithdrawalStatus.PROCESSING, airtmError);
                throw airtmError;
            }

            // 5. Calls AirtmPayoutClient.commitPayout() with received ID
            try {
                await airtmPayoutClient.commitPayout(payoutResponse.id);
            } catch (airtmError: any) {
                logger.error(`[WithdrawalOrchestrator] Airtm commitPayout error: ${airtmError.message}`);
                await this.handleAirtmError(withdrawalId, WithdrawalStatus.PROCESSING, airtmError);
                throw airtmError;
            }

            // 6. Transitions to WITHDRAWAL_COMMITTED & creates audit log
            const updatedWithdrawal = await this.updateStatus(
                withdrawalId,
                WithdrawalStatus.PROCESSING,
                WithdrawalStatus.COMMITTED,
                correlationId,
                { external_payout_id: payoutResponse.id }
            );

            logger.info(`[WithdrawalOrchestrator] Withdrawal ${withdrawalId} successfully committed`);
            return updatedWithdrawal;

        } catch (error: any) {
            if (error instanceof AppError) throw error;
            throw new AppError(
                `Failed to process withdrawal: ${error.message}`,
                500,
                'WITHDRAWAL_PROCESSING_FAILED'
            );
        }
    }

    /**
     * Updates withdrawal status and creates an audit log entry
     */
    private async updateStatus(
        withdrawalId: string,
        fromStatus: WithdrawalStatus,
        toStatus: WithdrawalStatus,
        correlationId: string,
        additionalData: any = {}
    ): Promise<Withdrawal> {
        // Update withdrawal record
        const { data: updatedWithdrawal, error: updateError } = await supabase
            .from('withdrawals')
            .update({
                status: toStatus,
                ...additionalData,
                updated_at: new Date().toISOString()
            })
            .eq('id', withdrawalId)
            .select()
            .single();

        if (updateError) {
            throw new AppError(`Failed to update withdrawal status: ${updateError.message}`, 500);
        }

        // Create audit log entry
        const { error: logError } = await supabase
            .from('withdrawal_audit_logs')
            .insert({
                withdrawal_id: withdrawalId,
                from_status: fromStatus,
                to_status: toStatus,
                metadata: { correlationId, ...additionalData },
                created_at: new Date().toISOString()
            });

        if (logError) {
            logger.error(`[WithdrawalOrchestrator] Failed to create audit log: ${logError.message}`);
        }

        return updatedWithdrawal as Withdrawal;
    }

    /**
     * Simple status update without audit log (Internal use)
     */
    private async updateWithdrawalStatusRaw(id: string, status: WithdrawalStatus): Promise<void> {
        const { error } = await supabase
            .from('withdrawals')
            .update({ status, updated_at: new Date() })
            .eq('id', id);

        if (error) {
            throw error;
        }
    }

    /**
     * Handles Airtm API errors by transitioning to FAILED state
     */
    private async handleAirtmError(withdrawalId: string, currentStatus: WithdrawalStatus, error: any): Promise<void> {
        try {
            await this.updateStatus(withdrawalId, currentStatus, WithdrawalStatus.FAILED, 'ERROR_HANDLER', {
                error_message: error.message,
                error_context: 'AIRTM_API_FAILURE'
            });
        } catch (logError) {
            logger.error(`[WithdrawalOrchestrator] Failed to log Airtm error: ${logError}`);
        }
    }
}

export const withdrawalOrchestrator = new WithdrawalOrchestrator();
