import { Router } from "express";
import { reviewController } from "../controllers/review.controller";
import { verifyToken } from "@/middlewares/auth.middleware";

const router = Router();

router.post("/", verifyToken, reviewController.createReview);

router.get("/user/:id/reviews", reviewController.getReviewsByUser);

export { router as reviewRoutes };
