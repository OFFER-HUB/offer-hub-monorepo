import { Router } from "express";
import {
  createUserAsAdminHandler,
  getAllUsersForAdminHandler,
  getUserByIdForAdminHandler,
  updateUserAsAdminHandler,
  deleteUserAsAdminHandler,
  suspendUserHandler,
  activateUserHandler,
  changeUserRoleHandler,
  verifyUserHandler,
  bulkUserOperationHandler,
  getUserAnalyticsHandler,
  getUserActivityLogsHandler,
  exportUsersHandler,
} from "@/controllers/admin-user.controller";
import { authorizeRoles, verifyToken } from "@/middlewares/auth.middleware";

const router = Router();

// All routes require admin authentication
router.use(verifyToken);
router.use(authorizeRoles("admin"));

// User CRUD operations
router.get("/", getAllUsersForAdminHandler);
router.get("/analytics", getUserAnalyticsHandler);
router.get("/:id", getUserByIdForAdminHandler);
router.get("/:id/activity", getUserActivityLogsHandler);
router.post("/", createUserAsAdminHandler);
router.put("/:id", updateUserAsAdminHandler);
router.delete("/:id", deleteUserAsAdminHandler);

// User status management
router.post("/:id/suspend", suspendUserHandler);
router.post("/:id/activate", activateUserHandler);

// User role management
router.post("/:id/role", changeUserRoleHandler);

// User verification
router.post("/:id/verify", verifyUserHandler);

// Bulk operations
router.post("/bulk", bulkUserOperationHandler);

// Data export
router.post("/export", exportUsersHandler);

export default router;
