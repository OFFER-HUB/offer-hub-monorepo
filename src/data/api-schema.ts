// ─────────────────────────────────────────────────────────────────────────────
// API Schema — endpoint definitions + mock data for the Interactive Explorer
// ─────────────────────────────────────────────────────────────────────────────

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

export interface Parameter {
  name: string;
  type: "string" | "number" | "select";
  required: boolean;
  description: string;
  placeholder?: string;
  options?: string[]; // for select type
}

export interface RequestBody {
  contentType: string;
  example: string; // JSON string
}

export interface MockResponse {
  status: number;
  label: string;
  body: string; // JSON string
}

export interface ApiEndpoint {
  method: HttpMethod;
  path: string;
  title: string;
  description: string;
  pathParams?: Parameter[];
  queryParams?: Parameter[];
  requestBody?: RequestBody;
  responses: MockResponse[];
}

export interface EndpointCategory {
  name: string;
  description: string;
  endpoints: ApiEndpoint[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Mock data
// ─────────────────────────────────────────────────────────────────────────────

export const API_SCHEMA: EndpointCategory[] = [
  {
    name: "Auth",
    description: "User registration and authentication",
    endpoints: [
      {
        method: "POST",
        path: "/auth/register",
        title: "Register a new user",
        description:
          "Creates a new user account and returns a JWT token for immediate authentication.",
        requestBody: {
          contentType: "application/json",
          example: JSON.stringify(
            {
              email: "user@example.com",
              password: "securePassword123",
              name: "John Doe",
            },
            null,
            2
          ),
        },
        responses: [
          {
            status: 200,
            label: "Success",
            body: JSON.stringify(
              {
                code: 200,
                type: "success",
                ok: true,
                message: "User registered successfully",
                data: {
                  id: "usr_01ABC",
                  email: "user@example.com",
                  name: "John Doe",
                  token: "eyJhbGciOiJIUzI1NiIs...",
                },
              },
              null,
              2
            ),
          },
          {
            status: 422,
            label: "Validation Error",
            body: JSON.stringify(
              {
                code: 422,
                type: "error",
                ok: false,
                message: "Validation failed",
                data: null,
                errors: [
                  "Email is already registered",
                  "Password must be at least 8 characters",
                ],
              },
              null,
              2
            ),
          },
        ],
      },
      {
        method: "POST",
        path: "/auth/login",
        title: "Login and receive a JWT",
        description:
          "Authenticates a user with email and password, returns a JWT for subsequent requests.",
        requestBody: {
          contentType: "application/json",
          example: JSON.stringify(
            {
              email: "user@example.com",
              password: "securePassword123",
            },
            null,
            2
          ),
        },
        responses: [
          {
            status: 200,
            label: "Success",
            body: JSON.stringify(
              {
                code: 200,
                type: "success",
                ok: true,
                message: "Login successful",
                data: {
                  token: "eyJhbGciOiJIUzI1NiIs...",
                  user: {
                    id: "usr_01ABC",
                    email: "user@example.com",
                    name: "John Doe",
                  },
                },
              },
              null,
              2
            ),
          },
          {
            status: 401,
            label: "Unauthorized",
            body: JSON.stringify(
              {
                code: 401,
                type: "error",
                ok: false,
                message: "Invalid email or password",
                data: null,
              },
              null,
              2
            ),
          },
        ],
      },
    ],
  },
  {
    name: "Balances",
    description: "User balance and transaction management",
    endpoints: [
      {
        method: "GET",
        path: "/balances",
        title: "Get user balances",
        description:
          "Returns the authenticated user's available and held balances across all currencies.",
        responses: [
          {
            status: 200,
            label: "Success",
            body: JSON.stringify(
              {
                code: 200,
                type: "success",
                ok: true,
                message: "Balances retrieved",
                data: {
                  balances: [
                    { currency: "USD", available: 1250.0, held: 200.0 },
                    { currency: "XLM", available: 5000.0, held: 0.0 },
                  ],
                },
              },
              null,
              2
            ),
          },
          {
            status: 401,
            label: "Unauthorized",
            body: JSON.stringify(
              {
                code: 401,
                type: "error",
                ok: false,
                message: "Missing or invalid authorization token",
                data: null,
              },
              null,
              2
            ),
          },
        ],
      },
      {
        method: "GET",
        path: "/balances/transactions",
        title: "Get paginated transaction history",
        description:
          "Returns paginated list of the user's transactions with optional filtering.",
        queryParams: [
          {
            name: "page",
            type: "number",
            required: false,
            description: "Page number (default: 1)",
            placeholder: "1",
          },
          {
            name: "limit",
            type: "number",
            required: false,
            description: "Results per page (default: 20, max: 100)",
            placeholder: "20",
          },
          {
            name: "currency",
            type: "select",
            required: false,
            description: "Filter by currency",
            options: ["USD", "XLM", "USDC"],
          },
        ],
        responses: [
          {
            status: 200,
            label: "Success",
            body: JSON.stringify(
              {
                code: 200,
                type: "success",
                ok: true,
                message: "Transactions retrieved",
                data: {
                  transactions: [
                    {
                      id: "txn_01XYZ",
                      type: "credit",
                      amount: 100.0,
                      currency: "USD",
                      description: "Escrow release — Project Alpha",
                      created_at: "2026-01-15T10:30:00.000Z",
                    },
                    {
                      id: "txn_02XYZ",
                      type: "debit",
                      amount: 50.0,
                      currency: "USD",
                      description: "Withdrawal to bank",
                      created_at: "2026-01-14T14:20:00.000Z",
                    },
                  ],
                  pagination: {
                    page: 1,
                    limit: 20,
                    total: 47,
                    pages: 3,
                  },
                },
              },
              null,
              2
            ),
          },
          {
            status: 401,
            label: "Unauthorized",
            body: JSON.stringify(
              {
                code: 401,
                type: "error",
                ok: false,
                message: "Missing or invalid authorization token",
                data: null,
              },
              null,
              2
            ),
          },
        ],
      },
    ],
  },
  {
    name: "Wallets",
    description: "Stellar wallet management",
    endpoints: [
      {
        method: "POST",
        path: "/wallets/connect",
        title: "Connect a Stellar wallet",
        description:
          "Links a Stellar public key to the authenticated user's account for on-chain transactions.",
        requestBody: {
          contentType: "application/json",
          example: JSON.stringify(
            {
              public_key: "GBCG42WTVWPO4Q6N...",
            },
            null,
            2
          ),
        },
        responses: [
          {
            status: 200,
            label: "Success",
            body: JSON.stringify(
              {
                code: 200,
                type: "success",
                ok: true,
                message: "Wallet connected successfully",
                data: {
                  wallet_id: "wal_01DEF",
                  public_key: "GBCG42WTVWPO4Q6N...",
                  connected_at: "2026-01-20T08:00:00.000Z",
                },
              },
              null,
              2
            ),
          },
          {
            status: 400,
            label: "Bad Request",
            body: JSON.stringify(
              {
                code: 400,
                type: "error",
                ok: false,
                message: "Invalid Stellar public key format",
                data: null,
              },
              null,
              2
            ),
          },
        ],
      },
    ],
  },
  {
    name: "Projects",
    description: "Project listing and creation",
    endpoints: [
      {
        method: "GET",
        path: "/projects",
        title: "List projects",
        description: "Returns a paginated list of projects visible to the authenticated user.",
        queryParams: [
          {
            name: "page",
            type: "number",
            required: false,
            description: "Page number (default: 1)",
            placeholder: "1",
          },
          {
            name: "limit",
            type: "number",
            required: false,
            description: "Results per page (default: 20)",
            placeholder: "20",
          },
        ],
        responses: [
          {
            status: 200,
            label: "Success",
            body: JSON.stringify(
              {
                code: 200,
                type: "success",
                ok: true,
                message: "Projects retrieved",
                data: {
                  projects: [
                    {
                      id: "prj_01GHI",
                      title: "Project Alpha",
                      description: "A sample freelance project",
                      budget: 2500.0,
                      currency: "USD",
                      status: "open",
                      created_at: "2026-01-10T09:00:00.000Z",
                    },
                    {
                      id: "prj_02GHI",
                      title: "Project Beta",
                      description: "Another project",
                      budget: 1000.0,
                      currency: "USDC",
                      status: "in_progress",
                      created_at: "2026-01-12T11:00:00.000Z",
                    },
                  ],
                  pagination: { page: 1, limit: 20, total: 12, pages: 1 },
                },
              },
              null,
              2
            ),
          },
          {
            status: 401,
            label: "Unauthorized",
            body: JSON.stringify(
              {
                code: 401,
                type: "error",
                ok: false,
                message: "Missing or invalid authorization token",
                data: null,
              },
              null,
              2
            ),
          },
        ],
      },
      {
        method: "POST",
        path: "/projects",
        title: "Create a project",
        description: "Creates a new project. Requires authentication.",
        requestBody: {
          contentType: "application/json",
          example: JSON.stringify(
            {
              title: "New Project",
              description: "Project description here",
              budget: 1500.0,
              currency: "USD",
            },
            null,
            2
          ),
        },
        responses: [
          {
            status: 200,
            label: "Success",
            body: JSON.stringify(
              {
                code: 200,
                type: "success",
                ok: true,
                message: "Project created successfully",
                data: {
                  id: "prj_03GHI",
                  title: "New Project",
                  description: "Project description here",
                  budget: 1500.0,
                  currency: "USD",
                  status: "open",
                  created_at: "2026-02-01T12:00:00.000Z",
                },
              },
              null,
              2
            ),
          },
          {
            status: 422,
            label: "Validation Error",
            body: JSON.stringify(
              {
                code: 422,
                type: "error",
                ok: false,
                message: "Validation failed",
                data: null,
                errors: ["Title is required", "Budget must be positive"],
              },
              null,
              2
            ),
          },
        ],
      },
    ],
  },
  {
    name: "Escrow",
    description: "Escrow contract management",
    endpoints: [
      {
        method: "POST",
        path: "/escrow/init",
        title: "Initialise an escrow",
        description:
          "Creates a new escrow contract between buyer and seller. Funds are held until release.",
        requestBody: {
          contentType: "application/json",
          example: JSON.stringify(
            {
              project_id: "prj_01GHI",
              seller_id: "usr_02ABC",
              amount: 2500.0,
              currency: "USD",
            },
            null,
            2
          ),
        },
        responses: [
          {
            status: 200,
            label: "Success",
            body: JSON.stringify(
              {
                code: 200,
                type: "success",
                ok: true,
                message: "Escrow initialised",
                data: {
                  escrow_id: "esc_01JKL",
                  project_id: "prj_01GHI",
                  buyer_id: "usr_01ABC",
                  seller_id: "usr_02ABC",
                  amount: 2500.0,
                  currency: "USD",
                  status: "funded",
                  created_at: "2026-02-01T14:00:00.000Z",
                },
              },
              null,
              2
            ),
          },
          {
            status: 400,
            label: "Bad Request",
            body: JSON.stringify(
              {
                code: 400,
                type: "error",
                ok: false,
                message: "Insufficient balance to fund escrow",
                data: null,
              },
              null,
              2
            ),
          },
        ],
      },
      {
        method: "POST",
        path: "/escrow/release",
        title: "Release escrowed funds",
        description:
          "Releases held funds from an escrow to the seller upon project completion.",
        requestBody: {
          contentType: "application/json",
          example: JSON.stringify(
            {
              escrow_id: "esc_01JKL",
            },
            null,
            2
          ),
        },
        responses: [
          {
            status: 200,
            label: "Success",
            body: JSON.stringify(
              {
                code: 200,
                type: "success",
                ok: true,
                message: "Escrow released successfully",
                data: {
                  escrow_id: "esc_01JKL",
                  status: "released",
                  released_amount: 2500.0,
                  released_at: "2026-02-10T16:00:00.000Z",
                },
              },
              null,
              2
            ),
          },
          {
            status: 400,
            label: "Bad Request",
            body: JSON.stringify(
              {
                code: 400,
                type: "error",
                ok: false,
                message: "Escrow is not in a releasable state",
                data: null,
              },
              null,
              2
            ),
          },
          {
            status: 401,
            label: "Unauthorized",
            body: JSON.stringify(
              {
                code: 401,
                type: "error",
                ok: false,
                message: "Only the buyer can release the escrow",
                data: null,
              },
              null,
              2
            ),
          },
        ],
      },
    ],
  },
];
