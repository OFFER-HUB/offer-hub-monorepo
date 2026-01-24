/**
 * @fileoverview Task routes for task record management
 * @author Offer Hub Team
 */

import { Router } from "express";
import {
  recordTaskOutcome,
  getTaskRecordByProject,
  getClientTaskRecords,
  getFreelancerTaskRecords,
  updateTaskRatingHandler
} from "@/controllers/task.controller";
import { authenticateToken } from "@/middlewares/auth.middleware";
import { generalLimiter } from "@/middlewares/ratelimit.middleware";

const router = Router();

// All task routes require authentication
router.use(authenticateToken());

// Apply rate limiting to all task routes
router.use(generalLimiter);

/**
 * @route POST /api/task-records
 * @desc Record task outcome with blockchain registration
 * @access Private (Client only)
 */
router.post("/", recordTaskOutcome);

/**
 * @route GET /api/task-records/project/:projectId
 * @desc Get task record by project ID
 * @access Private (Authenticated users)
 */
router.get("/project/:projectId", getTaskRecordByProject);

/**
 * @route GET /api/task-records/client
 * @desc Get task records for current client
 * @access Private (Client)
 */
router.get("/client", getClientTaskRecords);

/**
 * @route GET /api/task-records/freelancer
 * @desc Get task records for current freelancer
 * @access Private (Freelancer)
 */
router.get("/freelancer", getFreelancerTaskRecords);

/**
 * @route PATCH /api/task-records/:recordId/rating
 * @desc Update task rating for a completed task
 * @access Private (Client only - must be the task client)
 */
router.patch("/:recordId/rating", updateTaskRatingHandler);

export default router;