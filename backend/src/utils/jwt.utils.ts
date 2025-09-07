import jwt from "jsonwebtoken";
import { JWTPayload } from "@/types/auth.types";
import { createHash } from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_here";
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN as any) || "24h";
const JWT_REFRESH_EXPIRES_IN =
  (process.env.JWT_REFRESH_EXPIRES_IN as any) || "7d";

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment");
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function signAccessToken(payload: Omit<JWTPayload, "iat" | "exp">) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

export function signRefreshToken(payload: Omit<JWTPayload, "iat" | "exp">) {
  const refreshToken = jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
  });

  const refreshTokenHash = hashToken(refreshToken);

  return { refreshToken, refreshTokenHash };
}

export function verifyAccessToken(token: string): JWTPayload {
  const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
  return decoded;
}

export function verifyRefreshToken(token: string): JWTPayload {
  const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
  return decoded;
}
