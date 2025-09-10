// Error type definitions for consistent error handling

export interface ErrorResponse {
  success: false;
  error: {
    type: string;
    message: string;
    details?: any;
    code: string;
    timestamp: string;
    stack?: string;
    url?: string;
    method?: string;
  };
}

export interface ValidationErrorDetail {
  field: string;
  value: any;
  reason: string;
  code: string;
}

export interface DatabaseErrorDetail {
  code: string;
  message: string;
  details?: string;
  hint?: string;
  where?: string;
}

export interface BusinessLogicErrorDetail {
  operation: string;
  resource: string;
  constraint?: string;
  suggestion?: string;
}

export interface AuthenticationErrorDetail {
  token?: string;
  reason: "expired" | "invalid" | "missing" | "malformed";
  required?: string[];
}

export interface AuthorizationErrorDetail {
  resource: string;
  action: string;
  requiredPermissions?: string[];
  userPermissions?: string[];
}

// Error codes enum for consistency
export enum ErrorCodes {
  // Validation errors
  VALIDATION_ERROR = "VALIDATION_ERROR",
  REQUIRED_FIELD = "REQUIRED_FIELD",
  INVALID_TYPE = "INVALID_TYPE",
  INVALID_EMAIL = "INVALID_EMAIL",
  INVALID_WALLET_ADDRESS = "INVALID_WALLET_ADDRESS",
  INVALID_USERNAME = "INVALID_USERNAME",
  INVALID_UUID = "INVALID_UUID",
  INVALID_AMOUNT = "INVALID_AMOUNT",
  INVALID_DATE = "INVALID_DATE",
  INVALID_ENUM_VALUE = "INVALID_ENUM_VALUE",

  // Database errors
  DATABASE_ERROR = "DATABASE_ERROR",
  DUPLICATE_ENTRY = "DUPLICATE_ENTRY",
  REFERENCE_NOT_FOUND = "REFERENCE_NOT_FOUND",
  TABLE_NOT_FOUND = "TABLE_NOT_FOUND",
  COLUMN_NOT_FOUND = "COLUMN_NOT_FOUND",
  CONSTRAINT_VIOLATION = "CONSTRAINT_VIOLATION",

  // Business logic errors
  BUSINESS_LOGIC_ERROR = "BUSINESS_LOGIC_ERROR",
  USER_NOT_FOUND = "USER_NOT_FOUND",
  CONTRACT_NOT_FOUND = "CONTRACT_NOT_FOUND",
  PROJECT_NOT_FOUND = "PROJECT_NOT_FOUND",
  SERVICE_NOT_FOUND = "SERVICE_NOT_FOUND",
  INSUFFICIENT_FUNDS = "INSUFFICIENT_FUNDS",
  INVALID_STATUS_TRANSITION = "INVALID_STATUS_TRANSITION",
  SAME_USER_OPERATION = "SAME_USER_OPERATION",

  // Authentication errors
  AUTHENTICATION_ERROR = "AUTHENTICATION_ERROR",
  TOKEN_EXPIRED = "TOKEN_EXPIRED",
  TOKEN_INVALID = "TOKEN_INVALID",
  TOKEN_MISSING = "TOKEN_MISSING",
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",

  // Authorization errors
  AUTHORIZATION_ERROR = "AUTHORIZATION_ERROR",
  INSUFFICIENT_PERMISSIONS = "INSUFFICIENT_PERMISSIONS",
  RESOURCE_ACCESS_DENIED = "RESOURCE_ACCESS_DENIED",
  ADMIN_REQUIRED = "ADMIN_REQUIRED",

  // HTTP status specific errors
  BAD_REQUEST = "BAD_REQUEST",
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  NOT_FOUND = "NOT_FOUND",
  CONFLICT = "CONFLICT",
  UNPROCESSABLE_ENTITY = "UNPROCESSABLE_ENTITY",
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",

  // Generic errors
  GENERIC_ERROR = "GENERIC_ERROR",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
  STRING_ERROR = "STRING_ERROR",
  UNKNOWN_ERROR_TYPE = "UNKNOWN_ERROR_TYPE",
}

// Error severity levels
export enum ErrorSeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

// Error context for better debugging
export interface ErrorContext {
  userId?: string;
  requestId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  endpoint?: string;
  method?: string;
  params?: Record<string, any>;
  query?: Record<string, any>;
  body?: Record<string, any>;
}

// Enhanced error interface
export interface EnhancedError {
  message: string;
  code: ErrorCodes;
  statusCode: number;
  severity: ErrorSeverity;
  context?: ErrorContext;
  details?: any;
  timestamp: string;
  stack?: string;
}

// Error logging interface
export interface ErrorLogEntry {
  id: string;
  error: EnhancedError;
  request: {
    method: string;
    url: string;
    headers: Record<string, string>;
    body?: any;
    query?: any;
    params?: any;
  };
  user?: {
    id: string;
    email?: string;
    username?: string;
  };
  environment: {
    nodeEnv: string;
    version: string;
    timestamp: string;
  };
}

// Error response builder interface
export interface ErrorResponseBuilder {
  buildValidationError(errors: ValidationErrorDetail[]): ErrorResponse;
  buildDatabaseError(error: DatabaseErrorDetail): ErrorResponse;
  buildBusinessLogicError(error: BusinessLogicErrorDetail): ErrorResponse;
  buildAuthenticationError(error: AuthenticationErrorDetail): ErrorResponse;
  buildAuthorizationError(error: AuthorizationErrorDetail): ErrorResponse;
  buildGenericError(message: string, code?: ErrorCodes): ErrorResponse;
}

// Error handling middleware interface
export interface ErrorHandlerMiddleware {
  handle(error: any, req: any, res: any, next: any): void;
  isOperational(error: any): boolean;
  logError(error: any, req?: any): void;
}

// Validation error mapping
export interface ValidationErrorMapping {
  [key: string]: {
    message: string;
    code: ErrorCodes;
    statusCode: number;
  };
}

// Database error mapping
export interface DatabaseErrorMapping {
  [key: string]: {
    message: string;
    code: ErrorCodes;
    statusCode: number;
    severity: ErrorSeverity;
  };
}
