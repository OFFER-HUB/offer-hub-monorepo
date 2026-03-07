# Backend API Design

## 🎯 API Design Principles

1. **RESTful**: Follow REST conventions for resource-based APIs
2. **Consistent**: Uniform response formats and error handling
3. **Versioned**: API versioning for backwards compatibility
4. **Documented**: Clear, comprehensive API documentation
5. **Secure**: Authentication, authorization, and input validation
6. **Performant**: Efficient queries, caching, pagination

## 🏗️ API Architecture

### Base URL

```
Development:  http://localhost:4000/api
Production:   https://api.offerhub.com/api (planned)
```

### API Versioning

```
/api/v1/offers
/api/v1/users
/api/v1/auth
```

## 📋 RESTful Conventions

### Resource Naming

**Use plural nouns for resources:**

```
✅ Good
GET    /api/offers
GET    /api/users
POST   /api/offers

❌ Bad
GET    /api/offer
GET    /api/user
POST   /api/createOffer
```

### HTTP Methods

| Method | Purpose | Example |
|--------|---------|---------|
| `GET` | Retrieve resource(s) | `GET /api/offers` |
| `POST` | Create new resource | `POST /api/offers` |
| `PUT` | Replace entire resource | `PUT /api/offers/:id` |
| `PATCH` | Update partial resource | `PATCH /api/offers/:id` |
| `DELETE` | Delete resource | `DELETE /api/offers/:id` |

### Standard Routes

```typescript
// Offers Resource
GET    /api/offers              // List all offers (with pagination)
GET    /api/offers/:id          // Get single offer
POST   /api/offers              // Create new offer
PUT    /api/offers/:id          // Replace offer
PATCH  /api/offers/:id          // Update offer fields
DELETE /api/offers/:id          // Delete offer

// Users Resource
GET    /api/users/me            // Get current user
PATCH  /api/users/me            // Update current user
DELETE /api/users/me            // Delete current user account

// Authentication
POST   /api/auth/register       // Register new user
POST   /api/auth/login          // Login user
POST   /api/auth/logout         // Logout user
POST   /api/auth/refresh        // Refresh access token
POST   /api/auth/forgot-password // Request password reset
POST   /api/auth/reset-password  // Reset password
```

## 📝 Request/Response Format

### Successful Responses

**Single Resource:**

```json
{
  "data": {
    "id": "123",
    "title": "Senior Software Engineer",
    "company": "Tech Corp",
    "baseSalary": 150000,
    "createdAt": "2026-02-01T00:00:00Z",
    "updatedAt": "2026-02-08T00:00:00Z"
  }
}
```

**Collection (with pagination):**

```json
{
  "data": [
    {
      "id": "123",
      "title": "Senior Software Engineer",
      "company": "Tech Corp"
    },
    {
      "id": "124",
      "title": "Lead Designer",
      "company": "Design Co"
    }
  ],
  "meta": {
    "total": 42,
    "page": 1,
    "perPage": 20,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

**No Content (204):**

```
DELETE /api/offers/123
Status: 204 No Content
(empty body)
```

### Error Responses

**Standard Error Format:**

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": [
      {
        "field": "baseSalary",
        "message": "Must be a positive number"
      },
      {
        "field": "email",
        "message": "Must be a valid email address"
      }
    ]
  }
}
```

**Error Codes:**

| HTTP Status | Error Code | Description |
|-------------|------------|-------------|
| 400 | `BAD_REQUEST` | Malformed request |
| 400 | `VALIDATION_ERROR` | Input validation failed |
| 401 | `UNAUTHORIZED` | Missing or invalid authentication |
| 403 | `FORBIDDEN` | Insufficient permissions |
| 404 | `NOT_FOUND` | Resource not found |
| 409 | `CONFLICT` | Resource already exists |
| 429 | `RATE_LIMIT_EXCEEDED` | Too many requests |
| 500 | `INTERNAL_SERVER_ERROR` | Server error |
| 503 | `SERVICE_UNAVAILABLE` | Service temporarily unavailable |

## 🔍 Query Parameters

### Filtering

```
GET /api/offers?company=TechCorp
GET /api/offers?minSalary=100000&maxSalary=200000
GET /api/offers?status=active
```

### Sorting

```
GET /api/offers?sort=createdAt          // Ascending
GET /api/offers?sort=-createdAt         // Descending (- prefix)
GET /api/offers?sort=baseSalary,-createdAt  // Multiple fields
```

### Pagination

```
GET /api/offers?page=2&perPage=20
GET /api/offers?limit=50&offset=100
```

### Field Selection

```
GET /api/offers?fields=id,title,company,baseSalary
```

### Search

```
GET /api/offers?search=engineer
GET /api/offers?q=software
```

## 📊 Request Examples

### Create Offer

```http
POST /api/offers
Content-Type: application/json
Authorization: Bearer {token}

{
  "title": "Senior Software Engineer",
  "company": "Tech Corp",
  "baseSalary": 150000,
  "bonus": 20000,
  "equityValue": 50000,
  "location": "San Francisco, CA",
  "remote": true,
  "startDate": "2026-03-01",
  "benefits": {
    "healthInsurance": true,
    "retirement401k": true,
    "ptoD days": 20
  }
}
```

**Response (201 Created):**

```json
{
  "data": {
    "id": "uuid-here",
    "title": "Senior Software Engineer",
    "company": "Tech Corp",
    "baseSalary": 150000,
    "bonus": 20000,
    "equityValue": 50000,
    "location": "San Francisco, CA",
    "remote": true,
    "startDate": "2026-03-01",
    "benefits": {
      "healthInsurance": true,
      "retirement401k": true,
      "ptoDays": 20
    },
    "userId": "user-uuid",
    "createdAt": "2026-02-08T12:00:00Z",
    "updatedAt": "2026-02-08T12:00:00Z"
  }
}
```

### Update Offer

```http
PATCH /api/offers/uuid-here
Content-Type: application/json
Authorization: Bearer {token}

{
  "baseSalary": 160000,
  "bonus": 25000
}
```

**Response (200 OK):**

```json
{
  "data": {
    "id": "uuid-here",
    "baseSalary": 160000,
    "bonus": 25000,
    "updatedAt": "2026-02-08T13:00:00Z"
    // ... other fields
  }
}
```

### Get Offers with Filters

```http
GET /api/offers?minSalary=120000&sort=-baseSalary&page=1&perPage=10
Authorization: Bearer {token}
```

**Response (200 OK):**

```json
{
  "data": [
    {
      "id": "1",
      "title": "Staff Engineer",
      "baseSalary": 200000
    },
    {
      "id": "2",
      "title": "Senior Engineer",
      "baseSalary": 160000
    }
  ],
  "meta": {
    "total": 15,
    "page": 1,
    "perPage": 10,
    "totalPages": 2
  }
}
```

## 🔐 Authentication & Authorization

### Authentication Flow

```typescript
// 1. Register
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}

Response:
{
  "data": {
    "user": { "id": "uuid", "email": "user@example.com" },
    "accessToken": "jwt-token",
    "refreshToken": "refresh-token"
  }
}

// 2. Login
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "securePassword123"
}

Response:
{
  "data": {
    "user": { "id": "uuid", "email": "user@example.com" },
    "accessToken": "jwt-token",
    "refreshToken": "refresh-token"
  }
}

// 3. Access Protected Route
GET /api/offers
Authorization: Bearer {accessToken}

// 4. Refresh Token
POST /api/auth/refresh
{
  "refreshToken": "refresh-token"
}

Response:
{
  "data": {
    "accessToken": "new-jwt-token"
  }
}
```

### Authorization Headers

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## ✅ Input Validation

### Validation Schema Example (Zod)

```typescript
import { z } from "zod";

export const createOfferSchema = z.object({
  title: z.string().min(1).max(200),
  company: z.string().min(1).max(100),
  baseSalary: z.number().positive(),
  bonus: z.number().nonnegative().optional(),
  equityValue: z.number().nonnegative().optional(),
  location: z.string().min(1).max(100).optional(),
  remote: z.boolean().default(false),
  startDate: z.string().datetime().optional(),
  benefits: z.object({
    healthInsurance: z.boolean().optional(),
    retirement401k: z.boolean().optional(),
    ptoDays: z.number().int().min(0).max(365).optional(),
  }).optional(),
});

export type CreateOfferInput = z.infer<typeof createOfferSchema>;
```

### Validation Middleware

```typescript
export function validateRequest(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid request data",
            details: error.errors.map((err) => ({
              field: err.path.join("."),
              message: err.message,
            })),
          },
        });
      } else {
        next(error);
      }
    }
  };
}
```

## 🚀 Performance Best Practices

### Pagination

```typescript
// Always paginate list endpoints
GET /api/offers?page=1&perPage=20

// Implementation
const page = parseInt(req.query.page) || 1;
const perPage = Math.min(parseInt(req.query.perPage) || 20, 100); // Max 100
const offset = (page - 1) * perPage;

const offers = await prisma.offer.findMany({
  skip: offset,
  take: perPage,
});
```

### Field Selection

```typescript
// Allow clients to select specific fields
GET /api/offers?fields=id,title,company,baseSalary

// Implementation
const fields = req.query.fields?.split(',') || [];
const select = fields.length > 0
  ? Object.fromEntries(fields.map(f => [f, true]))
  : undefined;

const offers = await prisma.offer.findMany({ select });
```

### Caching Headers

```typescript
// Set appropriate cache headers
res.set('Cache-Control', 'private, max-age=300'); // 5 minutes
res.set('ETag', generateETag(data));
```

## 📚 Related Documentation

- [Authentication](./authentication.md) - Auth implementation details
- [Error Handling](./error-handling.md) - Error handling patterns
- [Database Schema](../data/schema.md) - Database models

---

**Last Updated**: February 2026
**API Version**: 1.0 (MVP)
