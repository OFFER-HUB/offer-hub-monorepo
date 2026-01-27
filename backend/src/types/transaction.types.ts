/**
 * @fileoverview Transaction types for Stellar network operations
 * @author Offer Hub Team
 */

/**
 * Request body for sending a signed transaction
 */
export interface SendTransactionRequest {
  signedXdr: string;
}

/**
 * Response from TrustlessWork API when sending a transaction
 */
export interface SendTransactionResponse {
  status: string;
  hash: string;
}

/**
 * Standardized transaction result returned to client
 */
export interface TransactionResult {
  status: string;
  hash: string;
}
