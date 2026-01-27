/**
 * @fileoverview Authentication service providing user authentication and token management
 * @author Offer Hub Team
 */

import { CreateUserDTO } from "@/types/user.types";
import { userService } from "./user.service";
import {
  hashToken,
  signAccessToken,
  signRefreshToken,
} from "@/utils/jwt.utils";
import { supabase } from "@/lib/supabase/supabase";
import {
  AuthUser,
  LoginDTO,
  RefreshTokenRecord,
  EmailLoginDTO,
  AuditLogEntry,
  DeviceInfo,
  UserRole,
  RegisterDTO,
  RegisterWithEmailDTO,
  RegisterWithWalletDTO,
} from "@/types/auth.types";
import {
  AppError,
  AuthenticationError,
  AuthorizationError,
} from "@/utils/AppError";
import { randomBytes } from "crypto";
import { sanitizeUser } from "@/utils/sanitizeUser";
import bcrypt from "bcryptjs";
// import { v4 as uuidv4 } from "uuid";
const uuidv4 = () => require("crypto").randomUUID();

export async function getNonce(wallet_address: string) {
  const nonce = randomBytes(16).toString("hex");

  const { data: existing, error: fetchErr } = await supabase
    .from("users")
    .select("id")
    .eq("wallet_address", wallet_address)
    .single();

  if (fetchErr || !existing) throw new AppError("User not found", 404);

  const { error } = await supabase
    .from("users")
    .update({ nonce })
    .eq("wallet_address", wallet_address);

  if (error) throw new AppError("Failed to set nonce", 500);

  return nonce;
}

/**
 * Register new user with email and password
 * Creates an invisible wallet (Stellar keypair) for the user
 * @param data - Registration data with email and password
 * @param deviceInfo - Device information for audit logging
 * @returns User data and JWT tokens
 */
export async function register(data: RegisterDTO, deviceInfo: DeviceInfo) {
  const { email, password } = data;

  // Import wallet service
  const walletService = await import("./wallet.service");
  const { validateEmail } = await import("@/utils/validation");

  // Validate email format
  if (!email || typeof email !== "string") {
    throw new AppError("Email is required", 400);
  }

  if (!validateEmail(email)) {
    throw new AppError("Invalid email format", 400);
  }

  // Validate password
  if (!password || typeof password !== "string") {
    throw new AppError("Password is required", 400);
  }

  if (password.length < 8) {
    throw new AppError("Password must be at least 8 characters long", 400);
  }

  // Check if email already exists
  const { data: existingUser } = await supabase
    .from("users")
    .select("id")
    .eq("email", email.toLowerCase())
    .single();

  if (existingUser) {
    throw new AppError("Email already registered", 409);
  }

  // Hash password
  const password_hash = await bcrypt.hash(password, 10);

  // Generate a username from email (before @ symbol)
  const username =
    email.split("@")[0] + "_" + Math.random().toString(36).substring(2, 8);

  // Create user (without wallet_address initially)
  const { data: newUser, error: userError } = await supabase
    .from("users")
    .insert([
      {
        email: email.toLowerCase(),
        password_hash,
        username,
        name: username,
        is_freelancer: false,
        reputation_score: 0,
      },
    ])
    .select()
    .single();

  if (userError || !newUser) {
    throw new AppError(
      `Failed to create user: ${userError?.message || "Unknown error"}`,
      500,
    );
  }

  try {
    // Generate invisible wallet (Stellar keypair) for the user
    const { wallet, publicKey } = await walletService.generateInvisibleWallet(
      newUser.id,
    );

    // Update user with wallet address
    const { error: updateError } = await supabase
      .from("users")
      .update({ wallet_address: publicKey })
      .eq("id", newUser.id);

    if (updateError) {
      throw new AppError(
        `Failed to link wallet to user: ${updateError.message}`,
        500,
      );
    }

    // Log registration event
    await logAuthAttempt({
      userId: newUser.id,
      action: "user_register",
      resource: "auth",
      ipAddress: deviceInfo.ip_address || "",
      userAgent: deviceInfo.user_agent || "",
      timestamp: new Date(),
    });

    // Generate tokens
    const accessToken = signAccessToken({
      sub: newUser.id,
      email: newUser.email,
      role: UserRole.CLIENT,
      permissions: [],
    });
    const { refreshToken, refreshTokenHash } = signRefreshToken({
      sub: newUser.id,
      email: newUser.email,
      role: UserRole.CLIENT,
      permissions: [],
    });

    // Save refresh token in DB
    const refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    // Convert hex string to BYTEA for PostgreSQL
    const tokenHashBytes = Buffer.from(refreshTokenHash, "hex");
    const { error: rtInsertError } = await supabase
      .from("refresh_tokens")
      .insert([
        {
          user_id: newUser.id,
          token_hash: tokenHashBytes,
          expires_at: refreshTokenExpiry.toISOString(),
          device_info: deviceInfo,
        },
      ]);

    if (rtInsertError) {
      throw new AppError("Failed to persist refresh token", 500);
    }

    const safeUser = sanitizeUser({ ...newUser, wallet_address: publicKey });

    return {
      user: safeUser,
      wallet: {
        address: publicKey,
        type: wallet.type,
      },
      tokens: { accessToken, refreshToken },
    };
  } catch (error) {
    // Rollback: delete user if wallet creation failed
    await supabase.from("users").delete().eq("id", newUser.id);
    throw error;
  }
}

export async function signup(data: CreateUserDTO) {
  const newUser = await userService.createUser(data);

  const accessToken = signAccessToken({
    sub: newUser.id,
    email: newUser.email,
    role: newUser.role || UserRole.CLIENT,
    permissions:
      newUser.permissions?.map((p: { name: string }) => p.name) || [],
  });
  const { refreshToken, refreshTokenHash } = signRefreshToken({
    sub: newUser.id,
    email: newUser.email,
    role: newUser.role || UserRole.CLIENT,
    permissions: newUser.permissions?.map((p: any) => p.name) || [],
  });

  // Save refresh token in DB
  const { error: rtInsertError } = await supabase
    .from("refresh_tokens")
    .insert([
      {
        user_id: newUser.id,
        token_hash: refreshTokenHash,
        device_info: {}, // Signup doesn't receive deviceInfo in this signature, consider updating or passing empty
      },
    ]);

  if (rtInsertError) {
    throw new AppError("Failed to persist refresh token", 500);
  }

  const safeUser = sanitizeUser(newUser);

  return {
    user: safeUser,
    tokens: { accessToken, refreshToken },
  };
}

/**
 * Register new user with email and password
 * Automatically generates an invisible Stellar wallet
 * @param data - Registration data with email, password, username
 * @param deviceInfo - Device information for audit logging
 * @returns User data and JWT tokens
 */
export async function registerWithEmail(
  data: RegisterWithEmailDTO,
  deviceInfo: DeviceInfo,
) {
  const { email, password, username, name, bio, is_freelancer } = data;

  // Import wallet service
  const walletService = await import("./wallet.service");

  // Check if email already exists
  const { data: existingUser, error: emailCheckError } = await supabase
    .from("users")
    .select("id")
    .eq("email", email.toLowerCase())
    .single();

  if (existingUser) {
    throw new AppError("Email already registered", 400);
  }

  // Check if username already exists
  const { data: existingUsername } = await supabase
    .from("users")
    .select("id")
    .eq("username", username)
    .single();

  if (existingUsername) {
    throw new AppError("Username already taken", 400);
  }

  // Hash password
  const password_hash = await bcrypt.hash(password, 10);

  // Create user (without wallet_address initially)
  const { data: newUser, error: userError } = await supabase
    .from("users")
    .insert([
      {
        email: email.toLowerCase(),
        password_hash,
        username,
        name: name || username,
        bio: bio || null,
        is_freelancer: is_freelancer || false,
        reputation_score: 0,
      },
    ])
    .select()
    .single();

  if (userError || !newUser) {
    throw new AppError(
      `Failed to create user: ${userError?.message || "Unknown error"}`,
      500,
    );
  }

  try {
    // Generate invisible wallet for the user
    const { wallet, publicKey } = await walletService.generateInvisibleWallet(
      newUser.id,
    );

    // Update user with wallet address
    const { error: updateError } = await supabase
      .from("users")
      .update({ wallet_address: publicKey })
      .eq("id", newUser.id);

    if (updateError) {
      throw new AppError(
        `Failed to link wallet to user: ${updateError.message}`,
        500,
      );
    }

    // Stellar blockchain registration disabled temporarily
    // TODO: Re-enable when Stellar integration is ready
    /*
    // Register user on Stellar blockchain
    const blockchainService = await import('./blockchain.service');
    const blockchainResult = await blockchainService.registerUserOnBlockchain(
      newUser.id,
      publicKey,
      1 // VerificationLevel.BASIC
    );

    // Update user with blockchain verification status
    if (blockchainResult.success) {
      await supabase
        .from("users")
        .update({
          verification_level: blockchainResult.verificationLevel,
          verified_on_blockchain: true,
          verified_at: new Date().toISOString(),
          verification_metadata: {
            transactionHash: blockchainResult.transactionHash,
            verifiedAt: new Date().toISOString(),
            method: 'email_registration',
          },
        })
        .eq("id", newUser.id);
    }
    */

    // Log registration event
    await logAuthAttempt({
      userId: newUser.id,
      action: "user_register_email",
      resource: "auth",
      ipAddress: deviceInfo.ip_address || "",
      userAgent: deviceInfo.user_agent || "",
      timestamp: new Date(),
    });

    // Generate tokens
    const accessToken = signAccessToken({
      sub: newUser.id,
      email: newUser.email,
      role: UserRole.CLIENT,
      permissions: [],
    });
    const { refreshToken, refreshTokenHash, expiresAt } = signRefreshToken({
      sub: newUser.id,
      email: newUser.email,
      role: UserRole.CLIENT,
      permissions: [],
    });

    // Save refresh token in DB
    const { error: rtInsertError } = await supabase
      .from("refresh_tokens")
      .insert([
        {
          user_id: newUser.id,
          token_hash: refreshTokenHash,
          expires_at: expiresAt.toISOString(),
          device_info: deviceInfo,
        },
      ]);

    if (rtInsertError) {
      throw new AppError("Failed to persist refresh token", 500);
    }

    const safeUser = sanitizeUser({ ...newUser, wallet_address: publicKey });

    return {
      user: safeUser,
      wallet: {
        address: publicKey,
        type: "invisible",
      },
      tokens: { accessToken, refreshToken },
    };
  } catch (error) {
    // Rollback: delete user if wallet creation failed
    await supabase.from("users").delete().eq("id", newUser.id);
    throw error;
  }
}

/**
 * Register new user with existing wallet
 * Links external wallet and creates account with email/password
 * @param data - Registration data with wallet address, signature, email, password
 * @param deviceInfo - Device information for audit logging
 * @returns User data and JWT tokens
 */
export async function registerWithWallet(
  data: RegisterWithWalletDTO,
  deviceInfo: DeviceInfo,
) {
  const {
    wallet_address,
    signature,
    email,
    password,
    username,
    name,
    bio,
    is_freelancer,
  } = data;

  // Import wallet service
  const walletService = await import("./wallet.service");

  // Verify signature (user must sign a message proving they own the wallet)
  // For Stellar, we would verify the signature using the wallet address
  // This is a placeholder - implement proper Stellar signature verification
  try {
    // TODO: Implement proper Stellar signature verification
    // For now, we'll proceed with the registration
  } catch (error) {
    throw new AppError("Invalid wallet signature", 401);
  }

  // Check if wallet already exists
  const { data: existingWallet } = await supabase
    .from("users")
    .select("id")
    .eq("wallet_address", wallet_address)
    .single();

  if (existingWallet) {
    throw new AppError("Wallet already registered", 400);
  }

  // Check if email already exists
  const { data: existingEmail } = await supabase
    .from("users")
    .select("id")
    .eq("email", email.toLowerCase())
    .single();

  if (existingEmail) {
    throw new AppError("Email already registered", 400);
  }

  // Check if username already exists
  const { data: existingUsername } = await supabase
    .from("users")
    .select("id")
    .eq("username", username)
    .single();

  if (existingUsername) {
    throw new AppError("Username already taken", 400);
  }

  // Hash password
  const password_hash = await bcrypt.hash(password, 10);

  // Create user with wallet address
  const { data: newUser, error: userError } = await supabase
    .from("users")
    .insert([
      {
        wallet_address,
        email: email.toLowerCase(),
        password_hash,
        username,
        name: name || username,
        bio: bio || null,
        is_freelancer: is_freelancer || false,
        reputation_score: 0,
      },
    ])
    .select()
    .single();

  if (userError || !newUser) {
    throw new AppError(
      `Failed to create user: ${userError?.message || "Unknown error"}`,
      500,
    );
  }

  try {
    // Link external wallet to user
    await walletService.linkExternalWallet(newUser.id, wallet_address);

    // Stellar blockchain registration disabled temporarily
    // TODO: Re-enable when Stellar integration is ready
    /*
    // Register user on Stellar blockchain
    const blockchainService = await import('./blockchain.service');
    const blockchainResult = await blockchainService.registerUserOnBlockchain(
      newUser.id,
      wallet_address,
      1 // VerificationLevel.BASIC
    );

    // Update user with blockchain verification status
    if (blockchainResult.success) {
      await supabase
        .from("users")
        .update({
          verification_level: blockchainResult.verificationLevel,
          verified_on_blockchain: true,
          verified_at: new Date().toISOString(),
          verification_metadata: {
            transactionHash: blockchainResult.transactionHash,
            verifiedAt: new Date().toISOString(),
            method: 'wallet_connection',
          },
        })
        .eq("id", newUser.id);
    }
    */

    // Log registration event
    await logAuthAttempt({
      userId: newUser.id,
      action: "user_register_wallet",
      resource: "auth",
      ipAddress: deviceInfo.ip_address || "",
      userAgent: deviceInfo.user_agent || "",
      timestamp: new Date(),
    });

    // Generate tokens
    const accessToken = signAccessToken({
      sub: newUser.id,
      email: newUser.email,
      role: UserRole.CLIENT,
      permissions: [],
    });
    const { refreshToken, refreshTokenHash, expiresAt } = signRefreshToken({
      sub: newUser.id,
      email: newUser.email,
      role: UserRole.CLIENT,
      permissions: [],
    });

    // Save refresh token in DB
    const { error: rtInsertError } = await supabase
      .from("refresh_tokens")
      .insert([
        {
          user_id: newUser.id,
          token_hash: refreshTokenHash,
          expires_at: expiresAt.toISOString(),
          device_info: deviceInfo,
        },
      ]);

    if (rtInsertError) {
      throw new AppError("Failed to persist refresh token", 500);
    }

    const safeUser = sanitizeUser(newUser);

    return {
      user: safeUser,
      wallet: {
        address: wallet_address,
        type: "external",
      },
      tokens: { accessToken, refreshToken },
    };
  } catch (error) {
    // Rollback: delete user if wallet linking failed
    await supabase.from("users").delete().eq("id", newUser.id);
    throw error;
  }
}

export async function login(data: LoginDTO, deviceInfo?: DeviceInfo) {
  const { wallet_address, signature } = data;

  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("wallet_address", wallet_address)
    .single();

  if (error || !user) throw new AppError("User not found", 401);

  // Stellar signature verification disabled temporarily
  // TODO: Re-enable when Stellar integration is ready
  /*
  // Verify signature
  let recoveredAddress: string;
  try {
    recoveredAddress = utils.verifyMessage(user.nonce || '', signature || '');
  } catch {
    throw new AppError("Invalid signature", 401);
  }

  if (recoveredAddress.toLowerCase() !== (wallet_address || '').toLowerCase()) {
    throw new AppError("Signature does not match wallet address", 401);
  }
  */

  // Clear nonce after successful login
  await supabase
    .from("users")
    .update({ nonce: null })
    .eq("wallet_address", wallet_address);

  // Issue tokens
  const accessToken = signAccessToken({
    sub: user.id,
    email: user.email || "",
    role: user.role || UserRole.CLIENT,
    permissions: user.permissions?.map((p: any) => p.name) || [],
  });
  const { refreshToken, refreshTokenHash, expiresAt } = signRefreshToken({
    sub: user.id,
    email: user.email || "",
    role: user.role || UserRole.CLIENT,
    permissions: user.permissions?.map((p: any) => p.name) || [],
  });

  const { error: rtInsertError } = await supabase
    .from("refresh_tokens")
    .insert([
      {
        user_id: user.id,
        token_hash: refreshTokenHash,
        expires_at: expiresAt.toISOString(),
        device_info: deviceInfo || {},
      },
    ]);

  if (rtInsertError) {
    throw new AppError("Failed to persist refresh token", 500);
  }

  const safeUser = sanitizeUser(user);

  return {
    user: safeUser,
    tokens: { accessToken, refreshToken },
  };
}

export async function refreshSession(tokenRecord: RefreshTokenRecord) {
  // Validate token record has required fields
  if (!tokenRecord.id || !tokenRecord.user_id) {
    throw new AppError("Invalid token record", 400);
  }

  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", tokenRecord.user_id)
    .single();

  if (error || !user) {
    throw new AppError("User not found", 404);
  }

  // Generate new tokens
  const accessToken = signAccessToken({
    sub: user.id,
    email: user.email || "",
    role: user.role || UserRole.CLIENT,
    permissions: user.permissions?.map((p: any) => p.name) || [],
  });
  const { refreshToken: newRefreshToken, refreshTokenHash } = signRefreshToken({
    sub: user.id,
    email: user.email || "",
    role: user.role || UserRole.CLIENT,
    permissions: user.permissions?.map((p: any) => p.name) || [],
  });

  // Convert token hash to BYTEA format
  const tokenHashBytes = Buffer.from(refreshTokenHash, "hex");
  const refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  // Create new refresh token record
  const { data: newTokenRecord, error: insertError } = await supabase
    .from("refresh_tokens")
    .insert([
      {
        user_id: user.id,
        token_hash: tokenHashBytes,
        expires_at: refreshTokenExpiry.toISOString(),
        is_revoked: false,
        device_info: tokenRecord.device_info,
      },
    ])
    .select("id")
    .single();

  if (insertError || !newTokenRecord) {
    throw new AppError("Failed to create new refresh token", 500);
  }

  // Mark old token as replaced (token rotation)
  // Use the id from the tokenRecord to update the old token
  const { error: updateError } = await supabase
    .from("refresh_tokens")
    .update({
      replaced_by_token_id: newTokenRecord.id,
    })
    .eq("id", tokenRecord.id)
    .eq("user_id", user.id);

  if (updateError) {
    // If update fails, we should still return the new tokens
    // but log the error for investigation
    console.error("Failed to mark old token as replaced:", updateError);
    // Continue execution as the new token is already created
  }

  return { accessToken, refreshToken: newRefreshToken };
}

export async function logoutUser(tokenRecord: RefreshTokenRecord) {
  // Validate token record has required fields
  if (!tokenRecord.id || !tokenRecord.user_id) {
    throw new AppError("Invalid token record", 400);
  }

  // Revoke the token instead of deleting it (for audit purposes)
  const { error } = await supabase
    .from("refresh_tokens")
    .update({
      is_revoked: true,
      revoked_at: new Date().toISOString(),
    })
    .eq("id", tokenRecord.id)
    .eq("user_id", tokenRecord.user_id);

  if (error) {
    throw new AppError(`Failed to revoke token: ${error.message}`, 500);
  }

  return { message: "Logged out successfully" };
}

export async function logoutAllUserSessions(userId: string) {
  const { error } = await supabase
    .from("refresh_tokens")
    .update({
      is_revoked: true,
      revoked_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .eq("is_revoked", false)
    .is("replaced_by_token_id", null);

  if (error) {
    throw new AppError(`Failed to revoke sessions: ${error.message}`, 500);
  }

  return { message: "Logged out successfully" };
}

export async function logoutByRefreshToken(userId: string, refreshToken: string) {
  const refreshTokenHash = hashToken(refreshToken);

  const { data: userTokens, error: fetchError } = await supabase
    .from("refresh_tokens")
    .select("id, token_hash")
    .eq("user_id", userId)
    .eq("is_revoked", false)
    .is("replaced_by_token_id", null);

  if (fetchError) {
    throw new AppError(
      `Failed to fetch sessions: ${fetchError.message}`,
      500,
    );
  }

  const tokenRecord = userTokens?.find((token: any) => {
    let tokenHashHex: string;

    if (token.token_hash instanceof Buffer) {
      tokenHashHex = token.token_hash.toString("hex");
    } else if (typeof token.token_hash === "string") {
      let processedString = token.token_hash;

      if (processedString.startsWith("\\x")) {
        processedString = processedString.substring(2);
      } else if (
        processedString.startsWith("0x") ||
        processedString.startsWith("0X")
      ) {
        processedString = processedString.substring(2);
      }

      if (processedString.startsWith("7b2274797065223a2242756666657222")) {
        try {
          const jsonString = Buffer.from(processedString, "hex").toString(
            "utf8",
          );
          const bufferData = JSON.parse(jsonString);
          if (bufferData.type === "Buffer" && Array.isArray(bufferData.data)) {
            tokenHashHex = Buffer.from(bufferData.data).toString("hex");
          } else {
            tokenHashHex = processedString;
          }
        } catch {
          tokenHashHex = processedString;
        }
      } else if (
        processedString.startsWith("{") &&
        processedString.includes('"type":"Buffer"')
      ) {
        try {
          const bufferData = JSON.parse(processedString);
          if (bufferData.type === "Buffer" && Array.isArray(bufferData.data)) {
            tokenHashHex = Buffer.from(bufferData.data).toString("hex");
          } else {
            tokenHashHex = processedString;
          }
        } catch {
          tokenHashHex = processedString;
        }
      } else {
        tokenHashHex = processedString;
      }
    } else if (token.token_hash && typeof token.token_hash === "object") {
      tokenHashHex = Buffer.from(token.token_hash).toString("hex");
    } else {
      return false;
    }

    return tokenHashHex === refreshTokenHash;
  });

  if (!tokenRecord) {
    return { message: "Logged out successfully" };
  }

  const { error: updateError } = await supabase
    .from("refresh_tokens")
    .update({
      is_revoked: true,
      revoked_at: new Date().toISOString(),
    })
    .eq("id", tokenRecord.id)
    .eq("user_id", userId);

  if (updateError) {
    throw new AppError(
      `Failed to revoke token: ${updateError.message}`,
      500,
    );
  }

  return { message: "Logged out successfully" };
}

export async function logoutCurrentSession(
  userId: string,
  ip: string,
  userAgent: string,
) {
  const { data: userTokens, error: fetchError } = await supabase
    .from("refresh_tokens")
    .select("id, device_info")
    .eq("user_id", userId)
    .eq("is_revoked", false)
    .is("replaced_by_token_id", null)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false });

  if (fetchError) {
    throw new AppError(`Failed to fetch sessions: ${fetchError.message}`, 500);
  }

  const parseDeviceInfo = (raw: any): any => {
    if (!raw) return {};
    if (typeof raw === "string") {
      try {
        return JSON.parse(raw);
      } catch {
        return {};
      }
    }
    return raw;
  };

  const matchingTokenIds =
    userTokens
      ?.filter((token: any) => {
        const deviceInfo = parseDeviceInfo(token.device_info);
        return (
          deviceInfo?.ip_address === ip && deviceInfo?.user_agent === userAgent
        );
      })
      .map((token: any) => token.id) || [];

  if (matchingTokenIds.length === 0) {
    return { message: "Logged out successfully" };
  }

  const { error: updateError } = await supabase
    .from("refresh_tokens")
    .update({
      is_revoked: true,
      revoked_at: new Date().toISOString(),
    })
    .in("id", matchingTokenIds)
    .eq("user_id", userId);

  if (updateError) {
    throw new AppError(
      `Failed to revoke current session: ${updateError.message}`,
      500,
    );
  }

  return { message: "Logged out successfully" };
}

export async function getMe(userId: string) {
  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (error || !user) throw new AppError("User not found", 404);

  const safeUser = sanitizeUser(user);

  return safeUser as unknown as AuthUser;
}

/**
 * Authenticate user with email and password
 * @param data - Email login credentials
 * @param deviceInfo - Device information for audit logging
 * @returns User data and JWT tokens
 */
export async function loginWithEmail(
  data: EmailLoginDTO,
  deviceInfo: DeviceInfo,
) {
  const { email, password } = data;

  // Log login attempt
  await logAuthAttempt({
    userId: "", // Will be set after user lookup
    action: "login_attempt",
    resource: "auth",
    ipAddress: deviceInfo.ip_address || "",
    userAgent: deviceInfo.user_agent || "",
    timestamp: new Date(),
  });

  // Find user by email
  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email.toLowerCase())
    .single();

  if (error || !user) {
    await logAuthAttempt({
      userId: "",
      action: "login_failure",
      resource: "auth",
      ipAddress: deviceInfo.ip_address || "",
      userAgent: deviceInfo.user_agent || "",
      timestamp: new Date(),
    });
    throw new AuthenticationError("Invalid email or password");
  }

  // Check if user has a password (email auth enabled)
  if (!user.password_hash) {
    await logAuthAttempt({
      userId: user.id,
      action: "login_failure",
      resource: "auth",
      ipAddress: deviceInfo.ip_address || "",
      userAgent: deviceInfo.user_agent || "",
      timestamp: new Date(),
    });
    throw new AuthenticationError(
      "Email authentication not enabled for this account. Please use wallet authentication.",
    );
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordValid) {
    await logAuthAttempt({
      userId: user.id,
      action: "login_failure",
      resource: "auth",
      ipAddress: deviceInfo.ip_address || "",
      userAgent: deviceInfo.user_agent || "",
      timestamp: new Date(),
    });
    throw new AuthenticationError("Invalid email or password");
  }

  // Check if user is active
  if (!user.is_active) {
    await logAuthAttempt({
      userId: user.id,
      action: "login_failure",
      resource: "auth",
      ipAddress: deviceInfo.ip_address || "",
      userAgent: deviceInfo.user_agent || "",
      timestamp: new Date(),
    });
    throw new AuthorizationError(
      "Account is inactive. Please contact support.",
    );
  }

  // Update last_login_at
  await supabase
    .from("users")
    .update({ last_login_at: new Date().toISOString() })
    .eq("id", user.id);

  // Generate tokens
  const accessToken = signAccessToken({
    sub: user.id,
    email: user.email || "",
    role: user.role || UserRole.CLIENT,
    permissions: user.permissions?.map((p: any) => p.name) || [],
  });
  const { refreshToken, refreshTokenHash } = signRefreshToken({
    sub: user.id,
    email: user.email || "",
    role: user.role || UserRole.CLIENT,
    permissions: user.permissions?.map((p: any) => p.name) || [],
  });

  // Calculate refresh token expiration time
  const refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  // Save refresh token (using schema from migration)
  const tokenHashBytes = Buffer.from(refreshTokenHash, "hex");
  const { error: rtInsertError } = await supabase
    .from("refresh_tokens")
    .insert([
      {
        user_id: user.id,
        token_hash: tokenHashBytes,
        expires_at: refreshTokenExpiry.toISOString(),
        is_revoked: false,
        device_info: deviceInfo,
      },
    ]);

  if (rtInsertError) {
    console.error("Failed to persist refresh token:", rtInsertError);
    throw new AppError("Failed to create session", 500);
  }

  // Log successful login
  await logAuthAttempt({
    userId: user.id,
    action: "login_success",
    resource: "auth",
    ipAddress: deviceInfo.ip_address || "",
    userAgent: deviceInfo.user_agent || "",
    timestamp: new Date(),
  });

  const safeUser = sanitizeUser(user);

  return {
    user: safeUser,
    tokens: {
      accessToken,
      refreshToken,
      expiresIn: 24 * 60 * 60, // 24 hours in seconds
      tokenType: "Bearer",
    },
  };
}

/**
 * Log authentication attempts for audit purposes
 * @param logEntry - Audit log entry
 */
async function logAuthAttempt(
  logEntry: Omit<AuditLogEntry, "id">,
): Promise<void> {
  try {
    const auditEntry: AuditLogEntry = {
      id: uuidv4(),
      ...logEntry,
    };

    // In production, this should be stored in a dedicated audit table
    // For now, we'll log to console with structured format
    console.log(
      JSON.stringify({
        type: "AUTH_AUDIT",
        ...auditEntry,
      }),
    );

    // TODO: Store in audit_logs table
    // await supabase.from('audit_logs').insert(auditEntry);
  } catch (error) {
    console.error("Failed to log auth attempt:", error);
  }
}

/**
 * Get active sessions for a user
 * @param userId - User ID
 * @returns List of active sessions
 */
export async function getUserSessions(
  userId: string,
  currentIp?: string,
  currentUserAgent?: string,
) {
  // Query refresh_tokens table instead of user_sessions
  const { data: sessions, error } = await supabase
    .from("refresh_tokens")
    .select("*")
    .eq("user_id", userId)
    .eq("is_revoked", false)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false });

  if (error) {
    throw new AppError("Failed to retrieve sessions", 500);
  }

  // parsers for device info if needed, but it's JSONB so it should be object
  const formattedSessions =
    sessions?.map((session: any) => {
      // Determine is_current
      let is_current = false;

      // Parse device info if string (should be object)
      let deviceInfo = session.device_info;
      if (typeof deviceInfo === "string") {
        try {
          deviceInfo = JSON.parse(deviceInfo);
        } catch (e) {
          deviceInfo = {};
        }
      } else if (!deviceInfo) {
        deviceInfo = {};
      }

      // Heuristic: Match IP and User Agent if stored
      // Note: This is an approximation.
      if (
        currentIp &&
        currentUserAgent &&
        deviceInfo.ip_address === currentIp &&
        deviceInfo.user_agent === currentUserAgent
      ) {
        is_current = true;
      }

      return {
        id: session.id,
        device_info: {
          browser: deviceInfo?.browser || "Unknown",
          os: deviceInfo?.os || "Unknown",
          device: deviceInfo?.type || "Unknown",
        },
        ip_hash: deviceInfo?.ip_address
          ? createHash("sha256")
              .update(deviceInfo.ip_address)
              .digest("hex")
              .substring(0, 10) + "..."
          : null,
        created_at: session.created_at,
        last_used_at: session.last_activity_at || session.created_at, // Refresh tokens don't track last use natively unless updated
        expires_at: session.expires_at,
        is_current: is_current,
      };
    }) || [];

  return formattedSessions;
}

// Helper for hash
import { createHash } from "crypto";

/**
 * Revoke a specific session by ID
 * @param userId - ID of the authenticated user
 * @param sessionId - ID of the session to revoke
 * @param currentSessionId - ID of the current session (optional, to prevent self-revocation)
 */
export async function revokeSession(
  userId: string,
  sessionId: string,
  currentSessionId?: string,
) {
  // 1. Validation: Cannot revoke current session
  if (currentSessionId && sessionId === currentSessionId) {
    throw new AppError(
      "Cannot revoke current session. Use /logout instead.",
      400,
    );
  }

  // 2. Fetch session details to verify ownership and existence
  const { data: session, error: fetchError } = await supabase
    .from("refresh_tokens")
    .select("id, user_id, is_revoked")
    .eq("id", sessionId)
    .single();

  // Handling Supabase errors explicitly to avoid Typescript narrowing issues
  if (fetchError) {
    if (fetchError.code === "PGRST116") {
      throw new AppError("Session not found", 404);
    }
    throw new AppError(`Database error: ${fetchError.message}`, 500);
  }

  if (!session) {
    throw new AppError("Session not found", 404);
  }

  // 3. Authorization: Session must belong to the user
  if (session.user_id !== userId) {
    throw new AppError(
      "You do not have permission to revoke this session",
      403,
    );
  }

  // 4. Revoke the session
  const { error: updateError } = await supabase
    .from("refresh_tokens")
    .update({
      is_revoked: true,
      revoked_at: new Date().toISOString(),
    })
    .eq("id", sessionId);

  if (updateError) {
    throw new AppError(`Failed to revoke session: ${updateError.message}`, 500);
  }

  return { message: "Session revoked successfully" };
}

/**
 * Initiate password reset process
 * Generates a reset token and sends it via email
 * @param email - User's email address
 * @param deviceInfo - Device information for audit logging
 * @returns Success message
 */
export async function forgotPassword(email: string, deviceInfo: DeviceInfo) {
  // Validate email format
  const { validateEmail } = await import("@/utils/validation");
  if (!email || !validateEmail(email)) {
    throw new AppError("Invalid email format", 400);
  }

  // Find user by email
  const { data: user, error } = await supabase
    .from("users")
    .select("id, email, password_hash")
    .eq("email", email.toLowerCase())
    .single();

  // For security, don't reveal if email exists or not
  // Always return success message
  if (error || !user) {
    // Log the attempt even if user doesn't exist (for security monitoring)
    await logAuthAttempt({
      userId: "",
      action: "password_reset_request",
      resource: "auth",
      ipAddress: deviceInfo.ip_address || "",
      userAgent: deviceInfo.user_agent || "",
      timestamp: new Date(),
    });

    // Return success to prevent email enumeration
    return {
      message:
        "If an account with that email exists, a password reset link has been sent.",
    };
  }

  // Check if user has password authentication enabled
  if (!user.password_hash) {
    // Log the attempt
    await logAuthAttempt({
      userId: user.id,
      action: "password_reset_request_failed",
      resource: "auth",
      ipAddress: deviceInfo.ip_address || "",
      userAgent: deviceInfo.user_agent || "",
      timestamp: new Date(),
    });

    // Return success to prevent email enumeration
    return {
      message:
        "If an account with that email exists, a password reset link has been sent.",
    };
  }

  // Generate reset token (cryptographically secure random token)
  const resetToken = randomBytes(32).toString("hex");
  const resetTokenExpiry = new Date();
  resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1); // Token expires in 1 hour

  // Save reset token to database
  const { error: updateError } = await supabase
    .from("users")
    .update({
      password_reset_token: resetToken,
      password_reset_expires_at: resetTokenExpiry.toISOString(),
    })
    .eq("id", user.id);

  if (updateError) {
    throw new AppError("Failed to generate password reset token", 500);
  }

  // Send password reset email
  try {
    const emailService = await import("./email.service");
    await emailService.sendPasswordResetEmail(user.email, resetToken);
  } catch (emailError: any) {
    // Log email error but don't fail the request
    console.error("Failed to send password reset email:", emailError);
    // In production, you might want to throw here, but for now we'll continue
    // The token is still saved, so the user could potentially use it if they contact support
  }

  // Log successful password reset request
  await logAuthAttempt({
    userId: user.id,
    action: "password_reset_request",
    resource: "auth",
    ipAddress: deviceInfo.ip_address || "",
    userAgent: deviceInfo.user_agent || "",
    timestamp: new Date(),
  });

  return {
    message:
      "If an account with that email exists, a password reset link has been sent.",
  };
}

/**
 * Reset password using reset token
 * Validates token and updates user password
 * @param token - Password reset token
 * @param newPassword - New password
 * @param deviceInfo - Device information for audit logging
 * @returns Success message
 */
export async function resetPassword(
  token: string,
  newPassword: string,
  deviceInfo: DeviceInfo,
) {
  // Validate inputs
  if (!token || typeof token !== "string") {
    throw new AppError("Reset token is required", 400);
  }

  if (!newPassword || typeof newPassword !== "string") {
    throw new AppError("New password is required", 400);
  }

  if (newPassword.length < 8) {
    throw new AppError("Password must be at least 8 characters long", 400);
  }

  // Find user by reset token
  const { data: user, error } = await supabase
    .from("users")
    .select("id, email, password_reset_token, password_reset_expires_at")
    .eq("password_reset_token", token)
    .single();

  if (error || !user) {
    await logAuthAttempt({
      userId: "",
      action: "password_reset_failed",
      resource: "auth",
      ipAddress: deviceInfo.ip_address || "",
      userAgent: deviceInfo.user_agent || "",
      timestamp: new Date(),
    });
    throw new AppError("Invalid or expired reset token", 400);
  }

  // Check if token has expired
  if (!user.password_reset_expires_at) {
    throw new AppError("Invalid or expired reset token", 400);
  }

  const expiryDate = new Date(user.password_reset_expires_at);
  if (expiryDate < new Date()) {
    // Clear expired token
    await supabase
      .from("users")
      .update({
        password_reset_token: null,
        password_reset_expires_at: null,
      })
      .eq("id", user.id);

    await logAuthAttempt({
      userId: user.id,
      action: "password_reset_failed",
      resource: "auth",
      ipAddress: deviceInfo.ip_address || "",
      userAgent: deviceInfo.user_agent || "",
      timestamp: new Date(),
    });

    throw new AppError(
      "Reset token has expired. Please request a new password reset.",
      400,
    );
  }

  // Hash new password
  const password_hash = await bcrypt.hash(newPassword, 10);

  // Update password and clear reset token
  const { error: updateError } = await supabase
    .from("users")
    .update({
      password_hash,
      password_reset_token: null,
      password_reset_expires_at: null,
    })
    .eq("id", user.id);

  if (updateError) {
    throw new AppError("Failed to reset password", 500);
  }

  // Log successful password reset
  await logAuthAttempt({
    userId: user.id,
    action: "password_reset_success",
    resource: "auth",
    ipAddress: deviceInfo.ip_address || "",
    userAgent: deviceInfo.user_agent || "",
    timestamp: new Date(),
  });

  return { message: "Password has been reset successfully" };
}
