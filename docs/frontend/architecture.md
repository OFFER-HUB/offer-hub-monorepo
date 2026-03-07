# Frontend Architecture

This document outlines the architecture, patterns, and structure of the OFFER-HUB frontend application.

## Technology Stack

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4 (CSS variables)
- **State Management:** React hooks, Context API
- **HTTP Client:** Fetch API with custom wrapper
- **UI Library:** Custom neumorphic components

---

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth layout group
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/       # Dashboard layout group
│   │   ├── orders/
│   │   ├── balance/
│   │   └── settings/
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── not-found.tsx      # 404 page
├── components/            # Reusable components
│   ├── ui/               # Base UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   └── Modal.tsx
│   ├── forms/            # Form components
│   ├── layout/           # Layout components
│   │   ├── Navbar.tsx
│   │   ├── Sidebar.tsx
│   │   └── Footer.tsx
│   └── features/         # Feature-specific components
│       ├── OrderCard.tsx
│       ├── BalanceWidget.tsx
│       └── PaymentButton.tsx
├── lib/                  # Utilities and helpers
│   ├── http-client.ts   # API client wrapper
│   ├── utils.ts         # General utilities
│   └── cn.ts            # Class name merger (clsx + tailwind-merge)
├── hooks/               # Custom React hooks
│   ├── use-client-auth.ts
│   ├── use-fetch-data.ts
│   └── use-local-storage.ts
├── types/               # TypeScript types
│   ├── api-response.ts
│   ├── user.types.ts
│   └── order.types.ts
├── data/                # Mock data
│   ├── marketplace.data.ts
│   └── users.mock.ts
└── styles/              # Global styles
    └── globals.css      # Tailwind directives, keyframes, utilities
```

---

## Routing

### App Router Structure

Next.js 14+ uses the App Router with file-based routing:

```
app/
├── layout.tsx           # Root layout (applies to all pages)
├── page.tsx             # Home page (/)
├── (auth)/              # Route group (no URL segment)
│   ├── layout.tsx       # Auth layout
│   ├── login/page.tsx   # /login
│   └── register/page.tsx # /register
├── (dashboard)/         # Route group
│   ├── layout.tsx       # Dashboard layout
│   ├── orders/
│   │   ├── page.tsx     # /orders
│   │   └── [id]/page.tsx # /orders/:id
│   ├── balance/page.tsx # /balance
│   └── settings/page.tsx # /settings
└── not-found.tsx        # 404 page
```

**Route Groups:** `(auth)` and `(dashboard)` are route groups that don't affect the URL but allow shared layouts.

---

## Component Architecture

### Component Hierarchy

```
Page Component
  ├── Layout Components (Navbar, Sidebar, Footer)
  ├── Feature Components (OrderCard, BalanceWidget)
  │   └── UI Components (Button, Card, Input)
  └── Form Components (LoginForm, CreateOrderForm)
      └── UI Components (Input, Button, ErrorMessage)
```

### Component Patterns

#### 1. Server Components (Default)

```tsx
// app/orders/page.tsx
export default async function OrdersPage() {
  const orders = await fetchOrders(); // Server-side data fetching
  
  return (
    <div>
      <h1>Orders</h1>
      {orders.map(order => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  );
}
```

#### 2. Client Components

```tsx
'use client';

// components/features/OrderCard.tsx
export function OrderCard({ order }: { order: Order }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div onClick={() => setIsExpanded(!isExpanded)}>
      {/* Interactive content */}
    </div>
  );
}
```

**Rule:** Use `'use client'` only when needed (state, effects, event handlers).

---

## State Management

### Local State (useState)

For component-specific state:

```tsx
const [isOpen, setIsOpen] = useState(false);
const [formData, setFormData] = useState<FormData>({});
```

### Context API

For shared state across components:

```tsx
// contexts/AuthContext.tsx
'use client';

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  
  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
```

**Usage:**
```tsx
const { user, setUser } = useAuth();
```

---

## Data Fetching

### HTTP Client Wrapper

```typescript
// lib/http-client.ts
export async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getApiKey()}`,
        ...options?.headers,
      },
    });
    
    const data = await response.json();
    
    // Normalize to ApiResponse<T>
    if ('ok' in data && 'code' in data) {
      return data;
    }
    
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
    return {
      ok: false,
      code: 5000,
      type: 'error',
      title: 'Network error',
      message: 'Unable to connect to the server.',
      data: null,
      errors: null,
    };
  }
}
```

### Custom Hooks

```typescript
// hooks/use-fetch-data.ts
export function useFetchData<T>(endpoint: string) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      const response = await apiRequest<T>(endpoint);
      
      if (response.ok) {
        setData(response.data);
      } else {
        setError(response.message);
      }
      
      setIsLoading(false);
    }
    
    fetchData();
  }, [endpoint]);
  
  return { data, isLoading, error };
}
```

**Usage:**
```tsx
const { data: orders, isLoading, error } = useFetchData<Order[]>('/api/orders');
```

---

## Styling

### Tailwind CSS 4

**Configuration:**
```typescript
// tailwind.config.ts
export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#149A9B',
        secondary: '#002333',
        background: '#F1F3F7',
        // ... more colors
      },
    },
  },
};
```

**Global Styles:**
```css
/* styles/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer utilities {
  .shadow-raised {
    box-shadow: 6px 6px 12px #d1d5db, -6px -6px 12px #ffffff;
  }
  
  .shadow-sunken {
    box-shadow: inset 4px 4px 8px #d1d5db, inset -4px -4px 8px #ffffff;
  }
}
```

### Class Name Utility

```typescript
// lib/cn.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**Usage:**
```tsx
<div className={cn(
  'bg-background rounded-2xl p-6',
  isActive && 'shadow-raised',
  className
)} />
```

---

## Form Handling

### Controlled Components

```tsx
'use client';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<ValidationError[]>([]);
  
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    
    const response = await apiRequest<User>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.ok) {
      // Success
      router.push('/dashboard');
    } else {
      // Error
      setErrors(response.errors || []);
    }
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <Input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.find(e => e.field === 'email')?.message}
      />
      <Button type="submit">Login</Button>
    </form>
  );
}
```

---

## Error Handling

### Error Boundaries

```tsx
'use client';

export class ErrorBoundary extends Component<Props, State> {
  state = { hasError: false };
  
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorState onRetry={() => this.setState({ hasError: false })} />;
    }
    
    return this.props.children;
  }
}
```

### Error State Component

```tsx
export function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="text-center p-8">
      <h2 className="text-error text-xl font-semibold mb-2">
        Something went wrong
      </h2>
      <p className="text-secondary mb-4">
        We encountered an error. Please try again.
      </p>
      <Button onClick={onRetry}>Retry</Button>
    </div>
  );
}
```

---

## Performance Optimization

### Code Splitting

```tsx
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Skeleton />,
});
```

### Image Optimization

```tsx
import Image from 'next/image';

<Image
  src="/logo.png"
  alt="OFFER-HUB"
  width={200}
  height={50}
  priority
/>
```

### Memoization

```tsx
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);
const memoizedCallback = useCallback(() => doSomething(a, b), [a, b]);
```

---

## Testing

### Component Tests

```tsx
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
  
  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    screen.getByText('Click me').click();
    expect(handleClick).toHaveBeenCalled();
  });
});
```

---

**Next Steps:**
- Review [UI Standards](./ui-standards.md) for component behavior
- See [State Management](./state-management.md) for advanced patterns
- Check [Error Handling](./error-handling.md) for error patterns
- Read [Visual DNA](../design/visual-dna.md) for styling guidelines
