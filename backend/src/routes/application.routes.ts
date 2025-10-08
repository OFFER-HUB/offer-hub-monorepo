import { Router } from "express";
import {
  createApplicationHandler,
  updateApplicationHandler,
  updateApplicationStatusHandler,
  getApplicationByIdHandler,
  getApplicationsByProjectHandler,
  getApplicationsByFreelancerHandler,
  searchApplicationsHandler,
  getApplicationStatisticsHandler,
  withdrawApplicationHandler,
  getMyApplicationsHandler
} from "@/controllers/application.controller";
import { authorizeRoles, verifyToken } from "@/middlewares/auth.middleware";
import { UserRole } from "@/types/auth.types";
import {
  validateCreateApplication,
  validateUpdateApplication,
  validateUpdateApplicationStatus,
  validateGetApplicationById,
  validateGetApplicationsByProject,
  validateSearchApplications,
  sanitizeApplicationInput,
  checkApplicationLimits,
  rateLimitApplicationCreation,
  logApplicationActivity
} from "@/middlewares/application.middleware";
import {
  checkApplicationPermissions,
  checkApplicationAccess,
  checkProjectAccess,
  requireFreelancerRole,
  requireClientRole,
  requireAdminRole,
  checkApplicationStatusTransition,
  checkRateLimits,
  logSecurityEvent
} from "@/middlewares/application-auth.middleware";

const router = Router();

router.post(
  "/",
  verifyToken,
  requireFreelancerRole,
  checkRateLimits('create'),
  rateLimitApplicationCreation,
  checkApplicationLimits,
  sanitizeApplicationInput,
  validateCreateApplication,
  logSecurityEvent('application_create'),
  createApplicationHandler
);

router.put(
  "/:id",
  verifyToken,
  requireFreelancerRole,
  checkRateLimits('update'),
  checkApplicationAccess('edit'),
  sanitizeApplicationInput,
  validateUpdateApplication,
  logApplicationActivity('update'),
  updateApplicationHandler
);

router.patch(
  "/:id/status",
  verifyToken,
  authorizeRoles(UserRole.CLIENT, UserRole.ADMIN),
  checkRateLimits('status_change'),
  checkApplicationAccess('review'),
  checkApplicationStatusTransition,
  validateUpdateApplicationStatus,
  logApplicationActivity('status_change'),
  updateApplicationStatusHandler
);

router.get(
  "/:id",
  verifyToken,
  checkApplicationAccess('view'),
  validateGetApplicationById,
  getApplicationByIdHandler
);

router.get(
  "/project/:id",
  verifyToken,
  authorizeRoles(UserRole.CLIENT, UserRole.ADMIN, UserRole.FREELANCER),
  checkProjectAccess('view'),
  validateGetApplicationsByProject,
  getApplicationsByProjectHandler
);

router.get(
  "/freelancer/:id",
  verifyToken,
  authorizeRoles(UserRole.FREELANCER, UserRole.ADMIN, UserRole.CLIENT),
  getApplicationsByFreelancerHandler
);

router.get(
  "/search",
  verifyToken,
  validateSearchApplications,
  searchApplicationsHandler
);

router.get(
  "/my/applications",
  verifyToken,
  getMyApplicationsHandler
);

router.get(
  "/statistics",
  verifyToken,
  authorizeRoles(UserRole.CLIENT, UserRole.ADMIN),
  checkApplicationPermissions('canViewAnalytics'),
  getApplicationStatisticsHandler
);

router.patch(
  "/:id/withdraw",
  verifyToken,
  requireFreelancerRole,
  checkApplicationAccess('edit'),
  logApplicationActivity('withdraw'),
  withdrawApplicationHandler
);

router.get(
  "/",
  verifyToken,
  validateSearchApplications,
  searchApplicationsHandler
);

export default router;
