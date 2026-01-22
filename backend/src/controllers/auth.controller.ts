/**
 * @fileoverview Authentication controller handling user authentication operations
 * @author Offer Hub Team
 */

import { NextFunction, Request, Response } from "express";
import * as authService from "@/services/auth.service";
import { DeviceInfo, EmailLoginDTO, RegisterDTO, RegisterWithEmailDTO, RegisterWithWalletDTO, ForgotPasswordDTO, ResetPasswordDTO } from "@/types/auth.types";

export async function getNonce(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { wallet_address } = req.body;
    if (!wallet_address) {
      return res.status(400).json({ message: "wallet_address is required" });
    }
    const nonce = await authService.getNonce(wallet_address);
    res.status(200).json({
      success: "success",
      nonce,
    });
  } catch (err) {
    next(err);
  }
}


/**
 * Register a new user with email and password
 * Creates a smart wallet (contract account) for the user
 * @route POST /api/auth/register
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 *
 * Expected request body:
 * {
 *   "email": "string (required) - User's email address",
 *   "password": "string (required) - User's password (min 8 characters)"
 * }
 *
 * Response format:
 * {
 *   "success": true,
 *   "message": "User registered successfully",
 *   "data": {
 *     "user": { ... },
 *     "wallet": {
 *       "address": "string - Smart wallet contract address",
 *       "type": "smart_wallet" | "invisible"
 *     },
 *     "tokens": {
 *       "accessToken": "string",
 *       "refreshToken": "string"
 *     }
 *   },
 *   "metadata": {
 *     "timestamp": "string",
 *     "requestId": "string"
 *   }
 * }
 */
export async function register(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = req.body as RegisterDTO;

    // Basic input validation
    if (!data.email || !data.password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
        error: {
          code: "MISSING_FIELDS",
        },
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] as string || 'unknown',
        },
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
        error: {
          code: "INVALID_EMAIL_FORMAT",
        },
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] as string || 'unknown',
        },
      });
    }

    // Password length validation
    if (data.password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long",
        error: {
          code: "PASSWORD_TOO_SHORT",
        },
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] as string || 'unknown',
        },
      });
    }

    // Get device info for audit logging
    const deviceInfo: DeviceInfo = {
      type: getDeviceType(req.get('User-Agent') || '') as 'desktop' | 'mobile' | 'tablet',
      os: getOSFromUserAgent(req.get('User-Agent') || ''),
      browser: getBrowserFromUserAgent(req.get('User-Agent') || ''),
      ip_address: req.ip || req.connection.remoteAddress || 'unknown',
      user_agent: req.get('User-Agent') || 'unknown',
    };

    const result = await authService.register(data, deviceInfo);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result,
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string || 'unknown',
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Authenticate user login with Email and Password
 * @route POST /api/auth/login
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body as EmailLoginDTO;

    // Basic input validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
        error: {
          code: "MISSING_CREDENTIALS",
        },
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] as string || 'unknown',
        },
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
        error: {
          code: "INVALID_EMAIL_FORMAT",
        },
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] as string || 'unknown',
        },
      });
    }

    // Password length validation
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long",
        error: {
          code: "PASSWORD_TOO_SHORT",
        },
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] as string || 'unknown',
        },
      });
    }

    // Get device info for audit logging
    const deviceInfo: DeviceInfo = {
      type: getDeviceType(req.get('User-Agent') || '') as 'desktop' | 'mobile' | 'tablet',
      os: getOSFromUserAgent(req.get('User-Agent') || ''),
      browser: getBrowserFromUserAgent(req.get('User-Agent') || ''),
      ip_address: req.ip || req.connection.remoteAddress || 'unknown',
      user_agent: req.get('User-Agent') || 'unknown',
    };

    const result = await authService.loginWithEmail({ email, password }, deviceInfo);

    // Set user ID in request for logging purposes after successful login
    (req as any).user = { id: result.user.id };

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string || 'unknown',
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Authenticate user login with Wallet
 * @route POST /api/auth/login/wallet
 */
export async function loginWithWallet(req: Request, res: Response, next: NextFunction) {
  try {
    const { user, tokens } = await authService.login(req.body);
    res.status(200).json({
      status: "success",
      user,
      tokens,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Refresh access and refresh tokens
 * @route POST /api/auth/refresh
 * @param req - Express request object with refreshTokenRecord from middleware
 * @param res - Express response object
 * @param next - Express next function
 */
export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.refreshTokenRecord) {
      return res.status(400).json({
        success: false,
        message: "Refresh token record is missing",
        error: {
          code: "MISSING_TOKEN_RECORD",
        },
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] as string || 'unknown',
        },
      });
    }

    const { accessToken, refreshToken } = await authService.refreshSession(
      req.refreshTokenRecord
    );

    res.status(200).json({
      success: true,
      message: "Tokens refreshed successfully",
      data: {
        tokens: {
          accessToken,
          refreshToken,
        },
      },
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string || 'unknown',
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await authService.getMe(req.user.id);
    res.status(200).json({
      status: "success",
      user,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Logout user by revoking refresh token
 * @route POST /api/auth/logout
 * @param req - Express request object with refreshTokenRecord from middleware
 * @param res - Express response object
 * @param next - Express next function
 */
export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.refreshTokenRecord) {
      return res.status(400).json({
        success: false,
        message: "Refresh token is required",
        error: {
          code: "MISSING_REFRESH_TOKEN",
        },
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] as string || 'unknown',
        },
      });
    }

    const { message } = await authService.logoutUser(req.refreshTokenRecord);

    res.status(200).json({
      success: true,
      message,
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string || 'unknown',
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Register new user with email and password
 * Automatically generates an invisible wallet
 * @route POST /api/auth/register-with-email
 */
export async function registerWithEmail(req: Request, res: Response, next: NextFunction) {
  try {
    const data = req.body as RegisterWithEmailDTO;

    // Basic input validation
    if (!data.email || !data.password || !data.username) {
      return res.status(400).json({
        success: false,
        message: "Email, password, and username are required",
        error: {
          code: "MISSING_FIELDS",
        },
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] as string || 'unknown',
        },
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
        error: {
          code: "INVALID_EMAIL_FORMAT",
        },
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] as string || 'unknown',
        },
      });
    }

    // Password length validation
    if (data.password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long",
        error: {
          code: "PASSWORD_TOO_SHORT",
        },
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] as string || 'unknown',
        },
      });
    }

    // Get device info for audit logging
    const deviceInfo: DeviceInfo = {
      type: getDeviceType(req.get('User-Agent') || '') as 'desktop' | 'mobile' | 'tablet',
      os: getOSFromUserAgent(req.get('User-Agent') || ''),
      browser: getBrowserFromUserAgent(req.get('User-Agent') || ''),
      ip_address: req.ip || req.connection.remoteAddress || 'unknown',
      user_agent: req.get('User-Agent') || 'unknown',
    };

    const result = await authService.registerWithEmail(data, deviceInfo);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result,
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string || 'unknown',
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Register new user with existing wallet
 * Links external wallet and creates account
 * @route POST /api/auth/register-with-wallet
 */
export async function registerWithWallet(req: Request, res: Response, next: NextFunction) {
  try {
    const data = req.body as RegisterWithWalletDTO;

    // Basic input validation
    if (!data.wallet_address || !data.signature || !data.email || !data.password || !data.username) {
      return res.status(400).json({
        success: false,
        message: "Wallet address, signature, email, password, and username are required",
        error: {
          code: "MISSING_FIELDS",
        },
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] as string || 'unknown',
        },
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
        error: {
          code: "INVALID_EMAIL_FORMAT",
        },
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] as string || 'unknown',
        },
      });
    }

    // Password length validation
    if (data.password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long",
        error: {
          code: "PASSWORD_TOO_SHORT",
        },
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] as string || 'unknown',
        },
      });
    }

    // Get device info for audit logging
    const deviceInfo: DeviceInfo = {
      type: getDeviceType(req.get('User-Agent') || '') as 'desktop' | 'mobile' | 'tablet',
      os: getOSFromUserAgent(req.get('User-Agent') || ''),
      browser: getBrowserFromUserAgent(req.get('User-Agent') || ''),
      ip_address: req.ip || req.connection.remoteAddress || 'unknown',
      user_agent: req.get('User-Agent') || 'unknown',
    };

    const result = await authService.registerWithWallet(data, deviceInfo);

    res.status(201).json({
      success: true,
      message: "User registered successfully with wallet",
      data: result,
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string || 'unknown',
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function loginWithEmail(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body as EmailLoginDTO;

    // Basic input validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
        error: {
          code: "MISSING_CREDENTIALS",
        },
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] as string || 'unknown',
        },
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
        error: {
          code: "INVALID_EMAIL_FORMAT",
        },
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] as string || 'unknown',
        },
      });
    }

    // Password length validation
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long",
        error: {
          code: "PASSWORD_TOO_SHORT",
        },
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] as string || 'unknown',
        },
      });
    }

    // Get device info for audit logging
    const deviceInfo: DeviceInfo = {
      type: getDeviceType(req.get('User-Agent') || '') as 'desktop' | 'mobile' | 'tablet',
      os: getOSFromUserAgent(req.get('User-Agent') || ''),
      browser: getBrowserFromUserAgent(req.get('User-Agent') || ''),
      ip_address: req.ip || req.connection.remoteAddress || 'unknown',
      user_agent: req.get('User-Agent') || 'unknown',
    };

    const result = await authService.loginWithEmail({ email, password }, deviceInfo);

    // Set user ID in request for logging purposes after successful login
    (req as any).user = { id: result.user.id };

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string || 'unknown',
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get user sessions
 * GET /api/auth/sessions
 */
export async function getSessions(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user.id;
    const result = await authService.getUserSessions(userId);

    res.status(200).json({
      success: true,
      data: result,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Deactivate a user session
 * DELETE /api/auth/sessions/:sessionId
 */
export async function deactivateSession(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user.id;
    const sessionId = Array.isArray(req.params.sessionId) ? req.params.sessionId[0] : req.params.sessionId;

    await authService.deactivateSession(userId, sessionId);

    res.status(200).json({
      success: true,
      message: "Session deactivated successfully",
      metadata: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Determine device type from user agent
 * @param userAgent - User agent string
 * @returns Device type
 */
function getDeviceType(userAgent: string): string {
  const ua = userAgent.toLowerCase();

  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
    return 'mobile';
  } else if (ua.includes('tablet') || ua.includes('ipad')) {
    return 'tablet';
  } else {
    return 'desktop';
  }
}

/**
 * Get OS from user agent
 * @param userAgent - User agent string
 * @returns OS name
 */
function getOSFromUserAgent(userAgent: string): string {
  const ua = userAgent.toLowerCase();

  if (ua.includes('windows')) return 'Windows';
  if (ua.includes('macintosh') || ua.includes('mac os x')) return 'macOS';
  if (ua.includes('linux')) return 'Linux';
  if (ua.includes('android')) return 'Android';
  if (ua.includes('iphone') || ua.includes('ipad')) return 'iOS';

  return 'Unknown';
}

/**
 * Get browser from user agent
 * @param userAgent - User agent string
 * @returns Browser name
 */
function getBrowserFromUserAgent(userAgent: string): string {
  const ua = userAgent.toLowerCase();

  if (ua.includes('chrome') && !ua.includes('edg')) return 'Chrome';
  if (ua.includes('firefox')) return 'Firefox';
  if (ua.includes('safari') && !ua.includes('chrome')) return 'Safari';
  if (ua.includes('edg')) return 'Edge';
  if (ua.includes('opera')) return 'Opera';

  return 'Unknown';
}

/**
 * Request password reset
 * Sends password reset email to user
 * @route POST /api/auth/forgot-password
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export async function forgotPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { email } = req.body as ForgotPasswordDTO;

    // Basic input validation
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
        error: {
          code: "MISSING_EMAIL",
        },
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] as string || 'unknown',
        },
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
        error: {
          code: "INVALID_EMAIL_FORMAT",
        },
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] as string || 'unknown',
        },
      });
    }

    // Get device info for audit logging
    const deviceInfo: DeviceInfo = {
      type: getDeviceType(req.get('User-Agent') || '') as 'desktop' | 'mobile' | 'tablet',
      os: getOSFromUserAgent(req.get('User-Agent') || ''),
      browser: getBrowserFromUserAgent(req.get('User-Agent') || ''),
      ip_address: req.ip || req.connection.remoteAddress || 'unknown',
      user_agent: req.get('User-Agent') || 'unknown',
    };

    const result = await authService.forgotPassword(email, deviceInfo);

    res.status(200).json({
      success: true,
      message: result.message,
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string || 'unknown',
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Reset password using reset token
 * Validates token and updates user password
 * @route POST /api/auth/reset-password
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export async function resetPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { token, password } = req.body as ResetPasswordDTO;

    // Basic input validation
    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: "Token and password are required",
        error: {
          code: "MISSING_FIELDS",
        },
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] as string || 'unknown',
        },
      });
    }

    // Password length validation
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long",
        error: {
          code: "PASSWORD_TOO_SHORT",
        },
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] as string || 'unknown',
        },
      });
    }

    // Get device info for audit logging
    const deviceInfo: DeviceInfo = {
      type: getDeviceType(req.get('User-Agent') || '') as 'desktop' | 'mobile' | 'tablet',
      os: getOSFromUserAgent(req.get('User-Agent') || ''),
      browser: getBrowserFromUserAgent(req.get('User-Agent') || ''),
      ip_address: req.ip || req.connection.remoteAddress || 'unknown',
      user_agent: req.get('User-Agent') || 'unknown',
    };

    const result = await authService.resetPassword(token, password, deviceInfo);

    res.status(200).json({
      success: true,
      message: result.message,
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string || 'unknown',
      },
    });
  } catch (err) {
    next(err);
  }
}
