# API Response Format Standardization

## Overview

All API endpoints in the offer-hub backend now use a standardized response format to ensure consistency across all controllers and improve frontend error handling.

## Standard Response Format

### Success Response
```typescript
{
  success: true,
  message: string,
  data?: any
}
```

### Error Response
```typescript
{
  success: false,
  message: string,
  data?: any  // Optional additional error details
}
```

### Paginated Response
```typescript
{
  success: true,
  message: string,
  data: T[],
  pagination: {
    current_page: number,
    total_pages: number,
    total_items: number,
    per_page: number
  }
}
```

## Response Builder Utility

The `responseBuilder.ts` utility provides helper functions to create standardized responses:

### Functions Available

1. **`buildSuccessResponse<T>(data: T, message: string)`**
   - Creates a success response with data
   - Use for GET, POST, PUT operations that return data

2. **`buildErrorResponse(message: string, data?: any)`**
   - Creates an error response
   - Use for validation errors, not found errors, etc.

3. **`buildSuccessResponseWithoutData(message: string)`**
   - Creates a success response without data field
   - Use for DELETE operations or operations that don't return data

4. **`buildPaginatedResponse<T>(data: T[], message: string, pagination: object)`**
   - Creates a paginated response
   - Use for list endpoints with pagination

## Usage Examples

### In Controllers

```typescript
import { buildSuccessResponse, buildErrorResponse } from '../utils/responseBuilder';

// Success response
res.status(200).json(
  buildSuccessResponse(user, "User retrieved successfully")
);

// Error response
res.status(400).json(
  buildErrorResponse("Missing required fields")
);

// Paginated response
res.status(200).json(
  buildPaginatedResponse(
    users,
    "Users retrieved successfully",
    {
      current_page: 1,
      total_pages: 5,
      total_items: 100,
      per_page: 20
    }
  )
);
```

## HTTP Status Codes

Maintain appropriate HTTP status codes while using the standardized format:

- **200**: Success (GET, PUT, PATCH)
- **201**: Created (POST)
- **400**: Bad Request (validation errors)
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **500**: Internal Server Error

## Migration Notes

### Before (Inconsistent Formats)
```typescript
// Format 1
res.status(400).json({ error: "Missing fields" });

// Format 2
res.status(400).json({ success: false, message: "Error" });

// Format 3
res.status(200).json({ success: true, message: "Success", data: result });
```

### After (Standardized Format)
```typescript
// All error responses
res.status(400).json(buildErrorResponse("Missing fields"));

// All success responses
res.status(200).json(buildSuccessResponse(result, "Operation successful"));
```

## Benefits

1. **Consistency**: All endpoints return the same response structure
2. **Frontend Compatibility**: Easier error handling and data extraction
3. **Maintainability**: Centralized response building logic
4. **Type Safety**: TypeScript interfaces ensure correct structure
5. **Documentation**: Clear, predictable API responses

## Testing

Run the response builder tests to ensure the utility works correctly:

```bash
npm test -- responseBuilder.test.ts
```

## Controllers Updated

The following controllers have been updated to use the standardized format:

- ✅ `application.controller.ts`
- ✅ `service-request.controller.ts`
- ✅ `user.controller.ts`
- ✅ `review.controller.ts`
- ✅ `service.controller.ts`
- ✅ `nft.controller.ts`
- ✅ `contract.controller.ts`
- ✅ `project.controller.ts`
- ✅ `message.controller.ts`
- ✅ `conversation.controller.ts`

## Error Handling

The global error handler (`AppError.ts`) also uses the standardized format:

```typescript
return res.status(statusCode).json({
  success: false,
  status: statusCode,
  message,
  ...(process.env.NODE_ENV === "development" && { stack: (err as Error).stack }),
  timestamp: new Date().toISOString(),
});
```
