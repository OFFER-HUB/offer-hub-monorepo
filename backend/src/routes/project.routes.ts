import { Router } from "express";
import {
  createProjectHandler,
  getAllProjectsHandler,
  getProjectByIdHandler,
  updateProjectHandler,
  deleteProjectHandler,
  assignFreelancerHandler,
  getProjectHandler,
  listProjectsHandler,
} from "@/controllers/project.controller";
import { authorizeRoles, verifyToken } from "@/middlewares/auth.middleware";
import { UserRole } from "@/types/auth.types";

const router = Router();

// GET /api/projects - List projects with filtering and pagination
router.get("/", listProjectsHandler);

// GET /api/projects/:projectId - Get project by ID
router.get("/:projectId", getProjectHandler);

router.get("/", getAllProjectsHandler);

router.get("/:id", getProjectByIdHandler);

router.patch(
  "/:id",
  verifyToken,
  authorizeRoles(UserRole.CLIENT, UserRole.ADMIN),
  updateProjectHandler
);

router.delete(
  "/:id",
  verifyToken,
  authorizeRoles(UserRole.CLIENT, UserRole.ADMIN),
  deleteProjectHandler
);

router.patch(
  "/:projectId/assign/:freelancerId",
  verifyToken,
  authorizeRoles(UserRole.CLIENT, UserRole.ADMIN),
  assignFreelancerHandler
);

export default router;
