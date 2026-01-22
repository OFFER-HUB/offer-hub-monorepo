/**
 * @fileoverview OAuth middleware for validation and error handling
 * @author Offer Hub Team
 */

import { Request, Response, NextFunction } from 'express';
import { OAuthProvider } from '@/types/oauth.types';
import { parseOAuthProvider } from '@/utils/oauth.utils';
import { AppError } from '@/utils/AppError';
import { isProviderEnabled } from '@/config/oauth.config';

/**
 * Validate OAuth provider from request params
 */
export function validateOAuthProvider(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const { provider } = req.params;
  const providerStr = Array.isArray(provider) ? provider[0] : provider;

  if (!providerStr) {
    return next(new AppError('OAuth provider is required', 400));
  }

  const parsedProvider = parseOAuthProvider(providerStr);

  if (!parsedProvider) {
    return next(
      new AppError(
        `Invalid OAuth provider: ${providerStr}. Active providers: google, github`,
        400
      )
    );
  }

  if (!isProviderEnabled(parsedProvider)) {
    return next(
      new AppError(
        `OAuth provider ${parsedProvider} is not enabled or configured`,
        400
      )
    );
  }

  // Attach validated provider to request
  (req as any).oauthProvider = parsedProvider;

  next();
}

/**
 * Handle OAuth errors
 */
export function handleOAuthError(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // OAuth-specific error handling
  if (error.message.includes('OAuth') || error.message.includes('provider')) {
    return next(new AppError(error.message, 400));
  }

  // Pass through other errors
  next(error);
}

