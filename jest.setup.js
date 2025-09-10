import "@testing-library/jest-dom";

// Mock Next.js router (App Router)
jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    };
  },
  usePathname() {
    return "/";
  },
  useSearchParams() {
    return new URLSearchParams();
  },
}));

// Mock Next.js router (Pages Router - for backward compatibility)
jest.mock("next/router", () => ({
  useRouter() {
    return {
      route: "/",
      pathname: "/",
      query: {},
      asPath: "/",
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      replace: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
    };
  },
}));

// Mock environment variables
process.env.NEXT_PUBLIC_API_URL = "http://localhost:3000/api";

// Mock Radix UI components
jest.mock("@radix-ui/react-progress", () => ({
  Root: ({ children, className, ...props }) => (
    <div className={className} {...props}>
      {children}
    </div>
  ),
  Indicator: ({ className, style }) => (
    <div className={className} style={style} />
  ),
}));

jest.mock("@radix-ui/react-avatar", () => ({
  Root: ({ children, className, ...props }) => (
    <div className={className} {...props}>
      {children}
    </div>
  ),
  Image: ({ className, ...props }) => <img className={className} {...props} />,
  Fallback: ({ children, className, ...props }) => (
    <div className={className} {...props}>
      {children}
    </div>
  ),
}));

// Mock the UI components that use Radix UI
jest.mock("@/components/ui/avatar", () => ({
  Avatar: ({ children, className, ...props }) => (
    <div className={className} {...props}>
      {children}
    </div>
  ),
  AvatarImage: ({ className, ...props }) => (
    <img className={className} {...props} />
  ),
  AvatarFallback: ({ children, className, ...props }) => (
    <div className={className} {...props}>
      {children}
    </div>
  ),
}));

jest.mock("@/components/ui/progress", () => ({
  Progress: ({ className, value, ...props }) => (
    <div className={className} {...props}>
      <div style={{ width: `${value || 0}%` }} />
    </div>
  ),
}));
