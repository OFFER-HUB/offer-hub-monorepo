# Naming Conventions

This document defines strict naming standards for the OFFER-HUB codebase. Consistent naming ensures readability, searchability, and maintainability across thousands of files.

## Core Principles

1. **Clarity over Brevity:** Names should be descriptive and self-explanatory
2. **Consistency:** Follow the same patterns throughout the codebase
3. **Searchability:** Names should be unique and easy to grep
4. **Convention over Configuration:** Stick to established patterns

---

## Directory & File Naming

### Directories (Folders)

**Convention:** `kebab-case`

**Rules:**
- Always lowercase
- Use hyphens to separate words
- Never use spaces, underscores, or PascalCase
- Be descriptive but concise

**Examples:**
```
✅ CORRECT:
auth-form/
user-dashboard/
payment-providers/
api-client/

❌ INCORRECT:
AuthForm/          (PascalCase)
user_dashboard/    (snake_case)
User Dashboard/    (spaces)
usrdash/          (unclear abbreviation)
```

---

### React Components

**Convention:** `PascalCase.tsx`

**Rules:**
- Filename must match the main exported component
- Use `.tsx` extension for TypeScript + JSX
- One component per file (except for tightly coupled sub-components)

**Examples:**
```tsx
✅ CORRECT:
OfferCard.tsx       → export function OfferCard() {}
UserProfile.tsx     → export function UserProfile() {}
PaymentButton.tsx   → export function PaymentButton() {}

❌ INCORRECT:
offerCard.tsx       (camelCase)
offer-card.tsx      (kebab-case)
OfferCard.ts        (missing JSX extension)
```

**Sub-components:**
```tsx
// OfferCard.tsx
export function OfferCard() {
  return (
    <div>
      <OfferCardHeader />
      <OfferCardBody />
    </div>
  );
}

// Tightly coupled sub-components can live in the same file
function OfferCardHeader() { /* ... */ }
function OfferCardBody() { /* ... */ }
```

---

### Custom Hooks

**Convention:** `use-kebab-case.ts`

**Rules:**
- Always start with `use-` prefix
- Use kebab-case for the rest
- Use `.ts` extension (not `.tsx` unless returning JSX)
- One hook per file

**Examples:**
```typescript
✅ CORRECT:
use-client-auth.ts      → export function useClientAuth() {}
use-fetch-data.ts       → export function useFetchData() {}
use-local-storage.ts    → export function useLocalStorage() {}

❌ INCORRECT:
useClientAuth.ts        (camelCase filename)
client-auth.ts          (missing use- prefix)
use_client_auth.ts      (snake_case)
```

---

### Utility Functions

**Convention:** `kebab-case.ts`

**Rules:**
- Use kebab-case
- Group by functional domain
- Use descriptive names

**Examples:**
```typescript
✅ CORRECT:
sanitize-html.ts        → export function sanitizeHtml() {}
format-currency.ts      → export function formatCurrency() {}
validate-email.ts       → export function validateEmail() {}

❌ INCORRECT:
utils.ts                (too generic)
SanitizeHtml.ts         (PascalCase)
sanitize_html.ts        (snake_case)
```

---

### Type Definitions

**Convention:** `PascalCase.ts` or `kebab-case.types.ts`

**Rules:**
- Use PascalCase for standalone type files
- Use `.types.ts` suffix for type collections
- Group related types together

**Examples:**
```typescript
✅ CORRECT:
ApiResponse.ts          → export type ApiResponse<T> = { ... }
user.types.ts           → export type User, UserRole, UserStatus
payment.types.ts        → export type Payment, PaymentMethod

❌ INCORRECT:
apiResponse.ts          (camelCase)
types.ts                (too generic)
user-types.ts           (inconsistent with .types.ts pattern)
```

---

## Variable Naming

### Boolean Variables

**Convention:** `is`, `has`, `can`, `should` prefixes

**Rules:**
- Explain a state or capability
- Use question-like phrasing

**Examples:**
```typescript
✅ CORRECT:
isLoading
hasError
canPerformAction
isMenuOpen
shouldShowModal
hasPermission

❌ INCORRECT:
loading          (not a question)
error            (not boolean-like)
menuOpen         (missing prefix)
```

---

### Functions

**Convention:** `camelCase` with action verbs

**Rules:**
- Start with a verb
- Be specific about what the function does
- Use consistent verb patterns

**Examples:**
```typescript
✅ CORRECT:
fetchUserDetails()
handleSubmitForm()
calculateTotalPrice()
validateEmailAddress()
formatCurrencyValue()

❌ INCORRECT:
userDetails()           (missing verb)
submit()                (too generic)
calc()                  (unclear abbreviation)
```

**Common Verb Patterns:**
- `get` / `fetch`: Retrieve data
- `set` / `update`: Modify data
- `create` / `add`: Create new data
- `delete` / `remove`: Remove data
- `handle`: Event handlers
- `validate`: Validation logic
- `format`: Data formatting
- `calculate`: Computations

---

### Event Handlers

**Convention:** `handle[Subject][Action]` for internal logic, `on[Action]` for props

**Internal Logic:**
```typescript
✅ CORRECT:
handleEmailChange()
handleFormSubmit()
handleButtonClick()
handleModalClose()

❌ INCORRECT:
emailChange()           (missing handle prefix)
onEmailChange()         (use for props, not internal)
changeEmail()           (unclear context)
```

**Props:**
```typescript
✅ CORRECT:
interface ModalProps {
  onClose: () => void;
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
}

❌ INCORRECT:
interface ModalProps {
  handleClose: () => void;    (use handle for internal)
  close: () => void;           (missing on prefix)
}
```

---

### Constants

**Convention:** `UPPER_SNAKE_CASE`

**Rules:**
- All uppercase
- Underscores between words
- Use for truly constant values

**Examples:**
```typescript
✅ CORRECT:
const MAX_UPLOAD_SIZE = 5 * 1024 * 1024;
const DEFAULT_PAGE_SIZE = 20;
const API_BASE_URL = 'https://api.example.com';
const SUPPORTED_FILE_TYPES = ['jpg', 'png', 'pdf'];

❌ INCORRECT:
const maxUploadSize = 5 * 1024 * 1024;  (camelCase)
const default_page_size = 20;           (lowercase)
const ApiBaseUrl = 'https://...';       (PascalCase)
```

**Note:** Configuration objects can use camelCase:
```typescript
const apiConfig = {
  baseUrl: 'https://api.example.com',
  timeout: 5000,
  retries: 3,
};
```

---

### TypeScript Types & Interfaces

**Convention:** `PascalCase`

**Rules:**
- Use PascalCase for types, interfaces, and enums
- Be descriptive and specific
- Avoid generic names like `Data` or `Info`

**Examples:**
```typescript
✅ CORRECT:
type ApiResponse<T> = { ... }
interface UserProfile { ... }
enum OrderStatus { ... }
type PaymentMethod = 'card' | 'crypto' | 'airtm';

❌ INCORRECT:
type apiResponse<T> = { ... }    (camelCase)
interface user_profile { ... }   (snake_case)
enum orderStatus { ... }         (camelCase)
type Data = { ... }              (too generic)
```

---

### Enums

**Convention:** `PascalCase` for enum name, `UPPER_SNAKE_CASE` for values

**Examples:**
```typescript
✅ CORRECT:
enum OrderStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

❌ INCORRECT:
enum orderStatus { ... }         (camelCase)
enum OrderStatus {
  pending = 'pending',           (lowercase values)
  inProgress = 'inProgress',     (camelCase values)
}
```

---

## API & Backend Naming

### API Endpoints

**Convention:** `kebab-case` with plural nouns

**Examples:**
```
✅ CORRECT:
GET  /api/users
POST /api/orders
GET  /api/payment-methods
POST /api/auth/api-keys

❌ INCORRECT:
GET  /api/Users           (PascalCase)
POST /api/order           (singular)
GET  /api/paymentMethods  (camelCase)
```

---

### Database Tables & Columns

**Convention:** `snake_case`

**Examples:**
```sql
✅ CORRECT:
users
order_items
payment_methods
created_at
updated_at

❌ INCORRECT:
Users              (PascalCase)
orderItems         (camelCase)
PaymentMethods     (PascalCase)
```

---

### Environment Variables

**Convention:** `UPPER_SNAKE_CASE`

**Examples:**
```bash
✅ CORRECT:
DATABASE_URL=...
API_KEY=...
PAYMENT_PROVIDER=crypto
WALLET_ENCRYPTION_KEY=...

❌ INCORRECT:
databaseUrl=...        (camelCase)
api-key=...            (kebab-case)
PaymentProvider=...    (PascalCase)
```

---

## Component Prop Naming

### Boolean Props

**Convention:** `is`, `has`, `should` prefixes

**Examples:**
```typescript
✅ CORRECT:
interface ButtonProps {
  isLoading?: boolean;
  isDisabled?: boolean;
  hasIcon?: boolean;
  shouldAutoFocus?: boolean;
}

❌ INCORRECT:
interface ButtonProps {
  loading?: boolean;     (missing prefix)
  disabled?: boolean;    (missing prefix)
}
```

---

### Callback Props

**Convention:** `on[Action]`

**Examples:**
```typescript
✅ CORRECT:
interface ModalProps {
  onClose: () => void;
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
}

❌ INCORRECT:
interface ModalProps {
  handleClose: () => void;   (use handle for internal)
  close: () => void;          (missing on prefix)
  submitCallback: () => void; (use on prefix)
}
```

---

## State Management

### React State

**Convention:** `[value, setValue]` pattern

**Examples:**
```typescript
✅ CORRECT:
const [isOpen, setIsOpen] = useState(false);
const [userData, setUserData] = useState<User | null>(null);
const [count, setCount] = useState(0);

❌ INCORRECT:
const [isOpen, setOpen] = useState(false);     (inconsistent)
const [userData, updateUserData] = useState(); (use set prefix)
```

---

## Test Files

**Convention:** `[filename].test.ts` or `[filename].spec.ts`

**Examples:**
```
✅ CORRECT:
OfferCard.test.tsx
use-client-auth.test.ts
sanitize-html.spec.ts

❌ INCORRECT:
OfferCard.tests.tsx    (plural)
test-OfferCard.tsx     (prefix instead of suffix)
```

---

## Mock Data Files

**Convention:** `[domain].data.ts` or `[domain].mock.ts`

**Examples:**
```typescript
✅ CORRECT:
marketplace.data.ts
users.mock.ts
orders.data.ts

❌ INCORRECT:
mockMarketplace.ts     (prefix instead of suffix)
marketplace-data.ts    (use .data.ts suffix)
```

---

## Naming Checklist

When creating new files or variables:

- [ ] Directories use `kebab-case`
- [ ] React components use `PascalCase.tsx`
- [ ] Hooks use `use-kebab-case.ts`
- [ ] Utilities use `kebab-case.ts`
- [ ] Booleans use `is/has/can/should` prefixes
- [ ] Functions use `camelCase` with action verbs
- [ ] Event handlers use `handle[Subject][Action]` internally
- [ ] Props use `on[Action]` for callbacks
- [ ] Constants use `UPPER_SNAKE_CASE`
- [ ] Types/Interfaces use `PascalCase`
- [ ] Enums use `PascalCase` with `UPPER_SNAKE_CASE` values
- [ ] Names are descriptive and searchable

---

**Next Steps:**
- Review [Code Style](./code-style.md) for formatting standards
- See [API Contract](./api-contract.md) for API naming patterns
- Check [Testing Standards](./testing.md) for test naming conventions
