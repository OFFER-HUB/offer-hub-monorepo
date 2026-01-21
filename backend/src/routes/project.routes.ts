/**
 * @fileoverview Project routes for project management endpoints
 * @author Offer Hub Team
 */

import { Router } from "express";
import {
  updateProjectHandler,
  getProjectByIdHandler,
} from "@/controllers/project.controller";
import { verifyToken } from "@/middlewares/auth.middleware";

const router = Router();

// Get project by ID
router.get("/:projectId", verifyToken, getProjectByIdHandler);

// Update project
router.patch("/:projectId", verifyToken, updateProjectHandler);

export default router;
