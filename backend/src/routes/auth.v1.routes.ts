import { Router } from "express";
import { authenticateToken } from "@/middlewares/auth.middleware";
import { logoutV1 } from "@/controllers/auth.controller";

const router = Router();

router.post("/logout", authenticateToken(), logoutV1);

export default router;
