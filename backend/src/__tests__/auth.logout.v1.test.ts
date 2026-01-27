import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";

jest.mock("../middlewares/auth.middleware", () => ({
  authenticateToken: () => (req: any, res: any, next: any) => {
    const authHeader = req.headers?.authorization;
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    req.user = { id: "test-user-id" };
    next();
  },
}));

jest.mock("../services/auth.service", () => ({
  logoutAllUserSessions: jest.fn(),
  logoutCurrentSession: jest.fn(),
  logoutByRefreshToken: jest.fn(),
}));

import authV1Routes from "../routes/auth.v1.routes";
import * as authService from "../services/auth.service";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/api/v1/auth", authV1Routes);

describe("POST /api/v1/auth/logout", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 401 if unauthorized", async () => {
    const res = await request(app).post("/api/v1/auth/logout").send({});

    expect(res.status).toBe(401);
  });

  it("should revoke all sessions when logout_all=true", async () => {
    (authService.logoutAllUserSessions as jest.Mock).mockResolvedValue({
      message: "Logged out successfully",
    });

    const res = await request(app)
      .post("/api/v1/auth/logout")
      .set("Authorization", "Bearer test")
      .send({ logout_all: true });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(authService.logoutAllUserSessions).toHaveBeenCalledWith(
      "test-user-id",
    );
  });

  it("should revoke current session when logout_all is false and no refresh cookie", async () => {
    (authService.logoutCurrentSession as jest.Mock).mockResolvedValue({
      message: "Logged out successfully",
    });

    const res = await request(app)
      .post("/api/v1/auth/logout")
      .set("Authorization", "Bearer test")
      .send({ logout_all: false });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(authService.logoutCurrentSession).toHaveBeenCalledTimes(1);
  });

  it("should revoke by refresh token when refreshToken cookie exists", async () => {
    (authService.logoutByRefreshToken as jest.Mock).mockResolvedValue({
      message: "Logged out successfully",
    });

    const res = await request(app)
      .post("/api/v1/auth/logout")
      .set("Authorization", "Bearer test")
      .set("Cookie", "refreshToken=rt_123")
      .send({ logout_all: false });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(authService.logoutByRefreshToken).toHaveBeenCalledWith(
      "test-user-id",
      "rt_123",
    );
  });
});
