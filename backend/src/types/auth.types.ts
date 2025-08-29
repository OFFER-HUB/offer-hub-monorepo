import { User } from "./user.types";

export type UserRole = "freelancer" | "client" | "admin";

export interface JWTPayload {
  user_id: string;
  role?: UserRole;
  iat?: number;
  exp?: number;
}

export interface AuthUser extends User {
  role: UserRole;
}

export interface RefreshTokenRecord {
  id: string;
  user_id: string;
  token_hash: string;
  created_at: string;
}

export interface LoginDTO {
  wallet_address: string;
  signature: string;
}
