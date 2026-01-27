/**
 * @fileoverview Transaction routes for Stellar network operations
 * @author Offer Hub Team
 */

import { Router } from 'express';
import { sendTransactionHandler } from '@/controllers/transaction.controller';

const router = Router();

/**
 * POST /api/transactions/send - Send a signed transaction to the Stellar network
 * 
 * Request body:
 * {
 *   "signedXdr": "AAAAAgAAAAC..."
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "Transaction sent successfully",
 *   "data": {
 *     "status": "pending",
 *     "hash": "abc123..."
 *   }
 * }
 */
router.post('/send', sendTransactionHandler);

export default router;
