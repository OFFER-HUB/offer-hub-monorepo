# API Contract Standard

This document defines the mandatory API response structure for all OFFER-HUB endpoints. Consistency in API responses ensures predictable client behavior and simplified error handling.

## Core Principle

**All API responses MUST follow the `ApiResponse<T>` contract.**

This applies to:
- All REST endpoints
- All service layer functions
- All data-fetching operations

---

## The ApiResponse<T> Structure

```typescript
interface ApiResponse<T = any> {
  ok: boolean;                        // Quick success check
  code: number;                       // Semantic response code
  type: 'success' | 'error' | 'warning';
  title: string;                      // Short headline for UI
  message: string;                    // Explicit user/developer feedback
  data: T | null;                     // The actual payload
  errors?: ValidationError[] | null;  // Field-level validation errors
}
```

---

## Field Definitions

### `ok: boolean`

**Purpose:** Quick success/failure check without parsing the entire response.

**Values:**
- `true`: Request succeeded
- `false`: Request failed

**Usage:**
```typescript
if (response.ok) {
  // Handle success
  console.log(response.data);
} else {
  // Handle error
  console.error(response.message);
}
```

---

### `code: number`

**Purpose:** Semantic code for programmatic handling.

**Standard Codes:**

| Code | Meaning | HTTP Status | Usage |
|:-----|:--------|:------------|:------|
| `1000` | Success | 200 | Successful operation |
| `1001` | Created | 201 | Resource created successfully |
| `1002` | Accepted | 202 | Request accepted, processing async |
| `4000` | Bad Request | 400 | Invalid request format |
| `4001` | Validation Error | 400 | Field validation failed |
| `4003` | Forbidden | 403 | Insufficient permissions |
| `4004` | Not Found | 404 | Resource not found |
| `4009` | Conflict | 409 | Idempotency key conflict |
| `4029` | Too Many Requests | 429 | Rate limit exceeded |
| `5000` | Internal Error | 500 | Server-side error |
| `5003` | Service Unavailable | 503 | External service down |

**Usage:**
```typescript
switch (response.code) {
  case 1000:
    // Success
    break;
  case 4001:
    // Show validation errors
    break;
  case 5000:
    // Show generic error
    break;
}
```

---

### `type: 'success' | 'error' | 'warning'`

**Purpose:** Visual indicator for UI components (toast, alert, badge).

**Values:**
- `'success'`: Green, checkmark icon
- `'error'`: Red, X icon
- `'warning'`: Amber, warning icon

**Usage:**
```tsx
<Toast type={response.type} title={response.title}>
  {response.message}
</Toast>
```

---

### `title: string`

**Purpose:** Short, user-facing headline for UI display.

**Guidelines:**
- Keep under 50 characters
- Use sentence case
- Be specific but concise
- Avoid technical jargon

**Examples:**
```typescript
✅ CORRECT:
"Order created successfully"
"Invalid email address"
"Payment processing failed"

❌ INCORRECT:
"Success"                    (too generic)
"ERROR: VALIDATION_FAILED"   (technical, all caps)
"The order has been successfully created and is now pending approval" (too long)
```

---

### `message: string`

**Purpose:** Detailed, actionable feedback for users and developers.

**Guidelines:**
- Explain what happened
- Provide actionable next steps
- Be helpful, not accusatory
- Include relevant context

**Examples:**
```typescript
✅ CORRECT:
"Your order has been created and is awaiting payment. Please complete the payment within 24 hours."
"The email address you entered is invalid. Please check and try again."
"We couldn't process your payment. Please verify your payment details and try again."

❌ INCORRECT:
"Error"                      (not helpful)
"Invalid input"              (not specific)
"An error occurred"          (no context)
```

---

### `data: T | null`

**Purpose:** The actual response payload.

**Rules:**
- `null` on errors (when `ok: false`)
- Typed according to the endpoint
- Can be an object, array, or primitive

**Examples:**
```typescript
// Single resource
data: {
  id: 'usr_123',
  name: 'John Doe',
  email: 'john@example.com'
}

// Collection
data: {
  items: [...],
  total: 100,
  page: 1,
  pageSize: 20
}

// Primitive
data: true

// Error case
data: null
```

---

### `errors?: ValidationError[] | null`

**Purpose:** Field-level validation errors for forms.

**Structure:**
```typescript
interface ValidationError {
  field: string;      // Field name (e.g., 'email', 'password')
  message: string;    // User-facing error message
  code?: string;      // Optional error code (e.g., 'INVALID_FORMAT')
}
```

**Example:**
```typescript
errors: [
  {
    field: 'email',
    message: 'Email address is required',
    code: 'REQUIRED'
  },
  {
    field: 'password',
    message: 'Password must be at least 8 characters',
    code: 'MIN_LENGTH'
  }
]
```

**Usage in Forms:**
```tsx
{response.errors?.map(error => (
  <div key={error.field} className="text-error text-sm">
    {error.message}
  </div>
))}
```

---

## Response Examples

### Success Response

```json
{
  "ok": true,
  "code": 1000,
  "type": "success",
  "title": "Order created successfully",
  "message": "Your order #12345 has been created and is awaiting payment.",
  "data": {
    "id": "ord_12345",
    "status": "PENDING",
    "amount": 100.00,
    "currency": "USD",
    "createdAt": "2026-02-17T19:40:00Z"
  },
  "errors": null
}
```

---

### Validation Error Response

```json
{
  "ok": false,
  "code": 4001,
  "type": "error",
  "title": "Validation failed",
  "message": "Please correct the errors below and try again.",
  "data": null,
  "errors": [
    {
      "field": "email",
      "message": "Email address is required",
      "code": "REQUIRED"
    },
    {
      "field": "amount",
      "message": "Amount must be greater than 0",
      "code": "MIN_VALUE"
    }
  ]
}
```

---

### Not Found Response

```json
{
  "ok": false,
  "code": 4004,
  "type": "error",
  "title": "Order not found",
  "message": "The order you're looking for doesn't exist or has been deleted.",
  "data": null,
  "errors": null
}
```

---

### Internal Error Response

```json
{
  "ok": false,
  "code": 5000,
  "type": "error",
  "title": "Something went wrong",
  "message": "We encountered an unexpected error. Please try again later or contact support if the problem persists.",
  "data": null,
  "errors": null
}
```

---

### Collection Response

```json
{
  "ok": true,
  "code": 1000,
  "type": "success",
  "title": "Orders retrieved successfully",
  "message": "Found 45 orders matching your criteria.",
  "data": {
    "items": [
      { "id": "ord_1", "amount": 100 },
      { "id": "ord_2", "amount": 200 }
    ],
    "total": 45,
    "page": 1,
    "pageSize": 20,
    "totalPages": 3
  },
  "errors": null
}
```

---

### Empty Collection Response

```json
{
  "ok": true,
  "code": 1000,
  "type": "success",
  "title": "No orders found",
  "message": "You don't have any orders yet. Create your first order to get started.",
  "data": {
    "items": [],
    "total": 0,
    "page": 1,
    "pageSize": 20,
    "totalPages": 0
  },
  "errors": null
}
```

---

## Implementation Guidelines

### Backend (NestJS)

**Service Layer:**
```typescript
async createOrder(dto: CreateOrderDto): Promise<ApiResponse<Order>> {
  try {
    const order = await this.orderRepository.create(dto);
    
    return {
      ok: true,
      code: 1001,
      type: 'success',
      title: 'Order created successfully',
      message: `Your order #${order.id} has been created.`,
      data: order,
      errors: null,
    };
  } catch (error) {
    return {
      ok: false,
      code: 5000,
      type: 'error',
      title: 'Failed to create order',
      message: 'We encountered an error while creating your order. Please try again.',
      data: null,
      errors: null,
    };
  }
}
```

**Controller:**
```typescript
@Post()
async create(@Body() dto: CreateOrderDto): Promise<ApiResponse<Order>> {
  return this.orderService.createOrder(dto);
}
```

---

### Frontend (Next.js)

**HTTP Client Wrapper:**
```typescript
export async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(endpoint, options);
    const data = await response.json();
    
    // Server returned ApiResponse structure
    if ('ok' in data && 'code' in data) {
      return data;
    }
    
    // Normalize non-standard responses
    return {
      ok: response.ok,
      code: response.ok ? 1000 : 5000,
      type: response.ok ? 'success' : 'error',
      title: response.ok ? 'Success' : 'Error',
      message: data.message || response.statusText,
      data: response.ok ? data : null,
      errors: null,
    };
  } catch (error) {
    // Network error
    return {
      ok: false,
      code: 5000,
      type: 'error',
      title: 'Network error',
      message: 'Unable to connect to the server. Please check your internet connection.',
      data: null,
      errors: null,
    };
  }
}
```

**Usage:**
```typescript
const response = await apiRequest<Order>('/api/orders', {
  method: 'POST',
  body: JSON.stringify(orderData),
});

if (response.ok) {
  toast.success(response.title, response.message);
  router.push(`/orders/${response.data.id}`);
} else {
  toast.error(response.title, response.message);
  if (response.errors) {
    setFormErrors(response.errors);
  }
}
```

---

## Error Handling Patterns

### Validation Errors

```typescript
if (response.code === 4001 && response.errors) {
  // Display field-level errors
  response.errors.forEach(error => {
    setFieldError(error.field, error.message);
  });
}
```

### Not Found

```typescript
if (response.code === 4004) {
  // Redirect to 404 page
  router.push('/404');
}
```

### Unauthorized

```typescript
if (response.code === 4001) {
  // Redirect to login
  router.push('/login');
}
```

### Rate Limiting

```typescript
if (response.code === 4029) {
  // Show rate limit message
  toast.warning(response.title, response.message);
}
```

---

## Best Practices

### ✅ DO

- Always return `ApiResponse<T>` from services
- Provide helpful, actionable messages
- Include field-level errors for validation failures
- Use semantic codes consistently
- Normalize external API responses to `ApiResponse<T>`

### ❌ DON'T

- Return raw errors to the client
- Use generic messages like "Error" or "Success"
- Expose internal error details (stack traces, DB errors)
- Mix response formats across endpoints
- Skip the `errors` field for validation failures

---

## TypeScript Definition

```typescript
// src/types/api-response.ts

export interface ApiResponse<T = any> {
  ok: boolean;
  code: number;
  type: 'success' | 'error' | 'warning';
  title: string;
  message: string;
  data: T | null;
  errors?: ValidationError[] | null;
}

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export type PaginatedResponse<T> = ApiResponse<PaginatedData<T>>;
```

---

## Testing

### Unit Test Example

```typescript
describe('OrderService', () => {
  it('should return ApiResponse on success', async () => {
    const response = await orderService.createOrder(mockDto);
    
    expect(response.ok).toBe(true);
    expect(response.code).toBe(1001);
    expect(response.type).toBe('success');
    expect(response.data).toBeDefined();
    expect(response.errors).toBeNull();
  });
  
  it('should return ApiResponse on validation error', async () => {
    const response = await orderService.createOrder(invalidDto);
    
    expect(response.ok).toBe(false);
    expect(response.code).toBe(4001);
    expect(response.type).toBe('error');
    expect(response.data).toBeNull();
    expect(response.errors).toHaveLength(2);
  });
});
```

---

**Next Steps:**
- Review [Naming Conventions](./naming-conventions.md) for API endpoint naming
- See [Testing Standards](./testing.md) for API testing patterns
- Check [Backend Modules](../backend/modules.md) for implementation examples
