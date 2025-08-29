# Error Handling and Validation System

## Overview

This document describes the standardized error handling and validation system implemented for the Offer-Hub backend. The system provides consistent error responses, comprehensive input validation, and improved debugging capabilities.

## Features

### ✅ Standardized Error Handling
- **Consistent Error Response Format**: All errors follow a standardized JSON structure
- **Specific Error Types**: Dedicated error classes for different scenarios
- **Enhanced Error Logging**: Detailed error logging with severity levels
- **Supabase Error Mapping**: Automatic mapping of database errors to user-friendly messages

### ✅ Comprehensive Validation
- **Input Validation**: Validation for emails, wallet addresses, usernames, monetary amounts, dates, and more
- **Schema-based Validation**: Reusable validation schemas for common data types
- **UUID Validation**: Standardized UUID validation across all endpoints
- **Type Safety**: Full TypeScript support with proper type definitions

### ✅ Error Response Format

All error responses follow this consistent format:

```json
{
  "success": false,
  "error": {
    "type": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "value": "invalid-email",
        "reason": "Invalid email format",
        "code": "INVALID_EMAIL"
      }
    ],
    "code": "VALIDATION_ERROR",
    "timestamp": "2024-08-25T10:30:00Z"
  }
}
```

## Error Types

### AppError Classes

| Error Class | Status Code | Use Case |
|-------------|-------------|----------|
| `ValidationError` | 422 | Input validation failures |
| `DatabaseError` | 500 | Database operation failures |
| `BusinessLogicError` | 400 | Business rule violations |
| `AuthenticationError` | 401 | Authentication failures |
| `AuthorizationError` | 403 | Authorization failures |
| `NotFoundError` | 404 | Resource not found |
| `BadRequestError` | 400 | Malformed requests |
| `ConflictError` | 409 | Resource conflicts |
| `InternalServerError` | 500 | Unexpected system errors |

### Error Codes

The system uses standardized error codes for consistent error handling:

```typescript
enum ErrorCodes {
  // Validation errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  REQUIRED_FIELD = 'REQUIRED_FIELD',
  INVALID_EMAIL = 'INVALID_EMAIL',
  INVALID_WALLET_ADDRESS = 'INVALID_WALLET_ADDRESS',
  INVALID_USERNAME = 'INVALID_USERNAME',
  INVALID_UUID = 'INVALID_UUID',
  INVALID_AMOUNT = 'INVALID_AMOUNT',
  
  // Database errors
  DATABASE_ERROR = 'DATABASE_ERROR',
  DUPLICATE_ENTRY = 'DUPLICATE_ENTRY',
  REFERENCE_NOT_FOUND = 'REFERENCE_NOT_FOUND',
  
  // Business logic errors
  BUSINESS_LOGIC_ERROR = 'BUSINESS_LOGIC_ERROR',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  CONTRACT_NOT_FOUND = 'CONTRACT_NOT_FOUND',
  
  // Authentication errors
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  
  // Authorization errors
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS'
}
```

## Validation System

### Validation Functions

The system provides comprehensive validation functions:

```typescript
// Email validation (RFC compliant)
validateEmail(email: string): boolean

// Wallet address validation (supports multiple blockchains)
validateWalletAddress(address: string, blockchain: 'ethereum' | 'stellar' | 'bitcoin'): boolean

// Username validation (3-20 characters, alphanumeric with underscores and hyphens)
validateUsername(username: string): boolean

// Monetary amount validation (positive numbers, max 6 decimal places)
validateMonetaryAmount(amount: number | string): boolean

// UUID validation
validateUUID(id: string): boolean

// String length validation
validateStringLength(str: string, minLength: number, maxLength: number): boolean

// Integer range validation
validateIntegerRange(value: number | string, min: number, max: number): boolean

// Enum validation
validateEnum<T>(value: string, allowedValues: readonly T[]): value is T
```

### Validation Schemas

Predefined validation schemas for common data types:

```typescript
// User creation schema
const USER_CREATION_SCHEMA = {
  wallet_address: {
    required: true,
    type: 'string',
    validator: validateWalletAddress,
    errorMessage: 'Invalid wallet address format',
    errorCode: 'INVALID_WALLET_ADDRESS'
  },
  username: {
    required: true,
    type: 'string',
    validator: validateUsername,
    errorMessage: 'Username must be 3-20 characters, alphanumeric with underscores and hyphens only',
    errorCode: 'INVALID_USERNAME'
  },
  email: {
    required: false,
    type: 'string',
    validator: validateEmail,
    errorMessage: 'Invalid email format',
    errorCode: 'INVALID_EMAIL'
  }
};

// Contract creation schema
const CONTRACT_CREATION_SCHEMA = {
  contract_type: {
    required: true,
    type: 'string',
    validator: (value) => validateEnum(value, CONTRACT_TYPES),
    errorMessage: 'Contract type must be "project" or "service"',
    errorCode: 'INVALID_CONTRACT_TYPE'
  },
  freelancer_id: {
    required: true,
    type: 'string',
    validator: validateUUID,
    errorMessage: 'Invalid freelancer ID format',
    errorCode: 'INVALID_FREELANCER_ID'
  },
  amount_locked: {
    required: true,
    type: 'number',
    validator: validateMonetaryAmount,
    errorMessage: 'Amount must be greater than 0',
    errorCode: 'INVALID_AMOUNT'
  }
};
```

## Usage Examples

### Controller Implementation

```typescript
// Before (inconsistent validation)
export const createUserHandler = async (req: Request, res: Response) => {
  const { wallet_address, username } = req.body;
  
  if (!wallet_address || !username) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }
  
  // ... rest of implementation
};

// After (standardized validation)
export const createUserHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Use standardized validation
    const validationResult = validateObject(req.body, USER_CREATION_SCHEMA);
    
    if (!validationResult.isValid) {
      throw new ValidationError("User validation failed", validationResult.errors);
    }

    const user = await userService.createUser(req.body);
    res.status(201).json(buildSuccessResponse(user, "User created successfully"));
  } catch (error: any) {
    // Handle Supabase errors
    if (error.code && error.message) {
      throw mapSupabaseError(error);
    }
    
    next(error);
  }
};
```

### Error Handling

```typescript
// Automatic error mapping
const mapSupabaseError = (error: any): AppError => {
  switch (error.code) {
    case '23505': // Unique violation
      return new ConflictError('Duplicate entry', 'DUPLICATE_ENTRY');
    case '23503': // Foreign key violation
      return new BusinessLogicError('Referenced record not found', 'REFERENCE_NOT_FOUND');
    case '42501': // Insufficient privilege
      return new AuthorizationError('Insufficient database permissions');
    default:
      return new DatabaseError('Database operation failed', error);
  }
};
```

## Error Severity Levels

The system categorizes errors by severity for better monitoring:

| Severity | Description | Examples |
|----------|-------------|----------|
| `LOW` | Validation errors, user input issues | Invalid email, missing fields |
| `MEDIUM` | Business logic errors, expected failures | User not found, insufficient funds |
| `HIGH` | Authentication/authorization issues | Token expired, insufficient permissions |
| `CRITICAL` | System errors, database failures | Database connection lost, internal server errors |

## Testing

The system includes comprehensive unit tests:

```bash
# Run all tests
npm test

# Run validation tests only
npm test -- --testPathPatterns="validation.test.ts"

# Run error handler tests only
npm test -- --testPathPatterns="errorHandler.test.ts"

# Run with coverage
npm run test:coverage
```

### Test Coverage

- **Validation Functions**: 100% coverage for all validation utilities
- **Error Handling**: Comprehensive tests for all error types and scenarios
- **Integration**: Tests for real-world usage patterns

## Migration Guide

### Updating Existing Controllers

1. **Import new error classes and validation utilities**:
   ```typescript
   import { ValidationError, BusinessLogicError, mapSupabaseError } from "@/utils/AppError";
   import { validateObject, USER_CREATION_SCHEMA } from "@/utils/validation";
   ```

2. **Replace manual validation with schema validation**:
   ```typescript
   // Before
   if (!email || !validateEmail(email)) {
     res.status(400).json({ error: "Invalid email" });
     return;
   }
   
   // After
   const validationResult = validateObject(req.body, USER_CREATION_SCHEMA);
   if (!validationResult.isValid) {
     throw new ValidationError("Validation failed", validationResult.errors);
   }
   ```

3. **Replace direct error responses with error throwing**:
   ```typescript
   // Before
   res.status(404).json({ error: "User not found" });
   
   // After
   throw new NotFoundError("User not found", "USER_NOT_FOUND");
   ```

4. **Add Supabase error handling**:
   ```typescript
   try {
     const result = await userService.createUser(data);
   } catch (error: any) {
     if (error.code && error.message) {
       throw mapSupabaseError(error);
     }
     next(error);
   }
   ```

## Benefits

### For Developers
- **Consistent API**: Predictable error responses across all endpoints
- **Better Debugging**: Detailed error information and logging
- **Type Safety**: Full TypeScript support with proper error types
- **Reusable Validation**: Pre-built validation schemas for common use cases

### For API Consumers
- **Clear Error Messages**: User-friendly error messages with specific details
- **Consistent Format**: Standardized error response structure
- **Proper Status Codes**: Appropriate HTTP status codes for different error types
- **Error Codes**: Machine-readable error codes for programmatic handling

### For Operations
- **Enhanced Monitoring**: Severity-based error logging for better alerting
- **Detailed Logs**: Comprehensive error context for debugging
- **Performance**: Optimized validation functions with caching support
- **Scalability**: Designed to handle high-volume error scenarios

## Configuration

### Environment Variables

```bash
# Set environment for error handling
NODE_ENV=development  # development, production, test

# External logging service configuration (future)
SENTRY_DSN=your-sentry-dsn
LOG_LEVEL=info
```

### Customization

The system is designed to be extensible:

- **Add new validation functions**: Extend the validation utilities
- **Create custom error types**: Inherit from AppError base class
- **Configure external logging**: Implement sendToExternalLogging method
- **Custom error codes**: Add new codes to ErrorCodes enum

## Future Enhancements

- **Rate Limiting Integration**: Automatic rate limit error handling
- **External Logging Services**: Integration with Sentry, LogRocket, etc.
- **Error Analytics**: Error tracking and analytics dashboard
- **Performance Monitoring**: Error performance impact tracking
- **Automated Testing**: Integration tests for error scenarios
