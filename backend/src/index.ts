import dotenv from "dotenv";
dotenv.config();

// Validate critical environment variables
console.log("🔍 Checking environment variables...");
const requiredEnvVars = [
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "JWT_SECRET",
];

const missingEnvVars = requiredEnvVars.filter(
  (varName) => !process.env[varName],
);
if (missingEnvVars.length > 0) {
  console.error("❌ Missing required environment variables:", missingEnvVars);
  console.error(
    "📋 Available SUPABASE env vars:",
    Object.keys(process.env).filter((k) => k.includes("SUPABASE")),
  );
} else {
  console.log("✅ All required environment variables are set");
}

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRoutes from "@/routes/user.routes";
import authRoutes from "@/routes/auth.routes";
import oauthRoutes from "@/routes/oauth.routes";
import escrowInitRoutes from "@/routes/escrow-init.routes";
import escrowBalanceRoutes from "@/routes/escrow-balance.routes";
import escrowQueryRoutes from "@/routes/escrow-query.routes";
import TaskRecordRouter from "@/routes/blockchain.routes";
import projectRoutes from "@/routes/project.routes";
// Unified Imports
import transactionRoutes from "@/routes/transaction.routes";
import taskRoutes from "@/routes/task.routes";
import profileRoutes from "@/routes/profile.routes";
import walletRoutes from "@/routes/wallet.routes";
import roleRoutes from "@/routes/role.routes";
import balanceRoutes from "@/routes/balance.routes";

import { errorHandlerMiddleware, setupGlobalErrorHandlers } from "./middlewares/errorHandler.middleware";
import { generalLimiter, authLimiter } from "./middlewares/ratelimit.middleware";
import { authenticateToken } from "./middlewares/auth.middleware";
import { loggerMiddleware } from "./middlewares/logger.middleware";
import { logger } from "./utils/logger";

// Setup global error handlers
setupGlobalErrorHandlers();

const app = express();
const port = process.env.PORT || 4000;

// Middleware setup
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://offer-hub-hpd4.vercel.app",
      "https://offer-hub.vercel.app",
      "https://offer-hub-web.vercel.app",
      "https://www.offer-hub.org",
      "https://offer-hub.org",
      /https:\/\/.*\.vercel\.app$/,
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(cookieParser()); // Parse cookies for OAuth session handling
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // For Apple form_post

// Request logging & Rate limiting
app.use(loggerMiddleware);
app.use(generalLimiter);

// Health Check
app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    env: process.env.NODE_ENV || "development",
  });
});

// Root endpoint
app.get("/", (_req, res) => {
  res.json({
    message: "💼 OFFER-HUB Backend API",
    version: "1.0.0",
    docs: "/docs",
    status: "active",
  });
});

// API Routes
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/oauth", oauthRoutes);
app.use("/api/escrows", authenticateToken(), escrowInitRoutes);
app.use("/api/escrows", authenticateToken(), escrowBalanceRoutes);
app.use("/api/escrows", authenticateToken(), escrowQueryRoutes);
app.use("/api/users", roleRoutes);
app.use("/api/users", authenticateToken(), userRoutes);
app.use("/api/v1/wallets", authenticateToken(), walletRoutes);
app.use("/api/v1/balances", authenticateToken(), balanceRoutes);
app.use("/api/task", TaskRecordRouter);
app.use("/api/projects", projectRoutes);
// Unified Route Endpoints
app.use("/api/transactions", transactionRoutes);
app.use("/api/task-records", taskRoutes);
app.use("/api/profile", authenticateToken(), profileRoutes);
app.use("/api/profiles", profileRoutes);

// Error Handling
app.use(errorHandlerMiddleware);

// Start server
app.listen(port, () => {
  console.log(`
    ██████╗ ███████╗███████╗███████╗██████╗        ██╗  ██╗██╗   ██╗██████╗ 
   ██╔═══██╗██╔════╝██╔════╝██╔════╝██╔══██╗      ██║  ██║██║   ██║██╔══██╗
   ██║   ██║█████╗  █████╗  █████╗  ██████╔╝█████╗███████║██║   ██║██████╔╝
   ██║   ██║██╔══╝  ██╔══╝  ██╔══╝  ██╔══██╗╚════╝██╔══██║██║   ██║██╔══██╗
   ╚██████╔╝██║     ██║     ███████╗██║  ██║      ██║  ██║╚██████╔╝██████╔╝
    ╚═════╝ ╚═╝     ╚═╝     ╚══════╝╚═╝  ╚═╝      ╚═╝  ╚═╝ ╚═════╝ ╚═════╝ 
                                                                           
  🚀 Server is running at http://localhost:${port}
  ⭐️ Environment: ${process.env.NODE_ENV || "development"}
  📝 API Docs: http://localhost:${port}/docs
  ❤️  Health Check: http://localhost:${port}/health
  `);
});
