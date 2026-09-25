// ─────────────────────────────────────────────────────────────────────────────
// API Schema — Verified Real Orchestrator Endpoints for the Interactive Explorer
// ─────────────────────────────────────────────────────────────────────────────

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface Parameter {
  name: string;
  type: "string" | "number" | "select" | "boolean";
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
  scope?: string;
  sourceController?: string;
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
// Verified Endpoint Definitions (Reviewed against Orchestrator Backend Controllers)
// ─────────────────────────────────────────────────────────────────────────────

export const API_SCHEMA: EndpointCategory[] = [
  {
    name: "Authentication & API Keys",
    description: "API key provisioning, scope enforcement, and frontend token issuance (AuthController)",
    endpoints: [
      {
        method: "POST",
        path: "/auth/api-keys",
        title: "Create API Key",
        description: "Generate a new API key with custom scopes. Requires Master Key authentication.",
        scope: "master",
        sourceController: "AuthController (src/auth/auth.controller.ts)",
        requestBody: {
          contentType: "application/json",
          example: JSON.stringify(
            {
              name: "Production Marketplace API Key",
              scopes: ["read", "write"],
            },
            null,
            2
          ),
        },
        responses: [
          {
            status: 201,
            label: "Created",
            body: JSON.stringify(
              {
                ok: true,
                code: 1001,
                type: "success",
                title: "API Key Created",
                message: "Save this key immediately - it will never be displayed again",
                data: {
                  id: "key_01HQ7ZX89ABC",
                  key: "ohk_live_xxxxxxxxxxxxxxxxxxxxxxxx",
                  name: "Production Marketplace API Key",
                  scopes: ["read", "write"],
                  createdAt: "2026-02-18T10:00:00.000Z",
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
                ok: false,
                code: 4003,
                type: "error",
                title: "Unauthorized",
                message: "Master API key required to manage keys",
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
        path: "/auth/api-keys",
        title: "List API Keys",
        description: "Returns all active and revoked API keys with masked key secrets.",
        scope: "master",
        sourceController: "AuthController (src/auth/auth.controller.ts)",
        responses: [
          {
            status: 200,
            label: "Success",
            body: JSON.stringify(
              {
                ok: true,
                code: 1000,
                type: "success",
                title: "API Keys Retrieved",
                message: "Found 2 active keys",
                data: [
                  {
                    id: "key_01HQ7ZX89ABC",
                    name: "Production Marketplace API Key",
                    keyPrefix: "ohk_live_xxxx...",
                    scopes: ["read", "write"],
                    createdAt: "2026-02-18T10:00:00.000Z",
                    revokedAt: null,
                  },
                ],
              },
              null,
              2
            ),
          },
        ],
      },
      {
        method: "DELETE",
        path: "/auth/api-keys/{id}",
        title: "Revoke API Key",
        description: "Immediately revokes the specified API key.",
        scope: "master",
        sourceController: "AuthController (src/auth/auth.controller.ts)",
        pathParams: [
          {
            name: "id",
            type: "string",
            required: true,
            description: "API Key ID to revoke",
            placeholder: "key_01HQ7ZX89ABC",
          },
        ],
        responses: [
          {
            status: 200,
            label: "Success",
            body: JSON.stringify(
              {
                ok: true,
                code: 1000,
                type: "success",
                title: "Key Revoked",
                message: "API key has been revoked and can no longer authenticate requests",
                data: { id: "key_01HQ7ZX89ABC", revokedAt: "2026-02-18T10:30:00.000Z" },
              },
              null,
              2
            ),
          },
        ],
      },
      {
        method: "POST",
        path: "/auth/tokens",
        title: "Create Short-Lived Token",
        description: "Generates a temporary client token (ohk_tok_...) for frontend use without exposing API keys.",
        scope: "write",
        sourceController: "AuthController (src/auth/auth.controller.ts)",
        requestBody: {
          contentType: "application/json",
          example: JSON.stringify(
            {
              userId: "usr_buyer123",
              expiresIn: 3600,
            },
            null,
            2
          ),
        },
        responses: [
          {
            status: 201,
            label: "Created",
            body: JSON.stringify(
              {
                ok: true,
                code: 1001,
                type: "success",
                title: "Token Issued",
                message: "Frontend token created with 1-hour expiration",
                data: {
                  token: "ohk_tok_xxxxxxxxxxxxxxxxxxxxxxxx",
                  userId: "usr_buyer123",
                  expiresAt: "2026-02-18T11:00:00.000Z",
                },
              },
              null,
              2
            ),
          },
        ],
      },
      {
        method: "GET",
        path: "/auth/me",
        title: "Get Caller Identity",
        description: "Retrieves details and scopes for the current Bearer token.",
        scope: "read",
        sourceController: "AuthController (src/auth/auth.controller.ts)",
        responses: [
          {
            status: 200,
            label: "Success",
            body: JSON.stringify(
              {
                ok: true,
                code: 1000,
                type: "success",
                title: "Identity Verified",
                message: "Authenticated caller info",
                data: {
                  keyId: "key_01HQ7ZX89ABC",
                  name: "Production Marketplace API Key",
                  scopes: ["read", "write"],
                },
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
    name: "Users & Identity",
    description: "User registration, metadata management, and invisible Stellar wallet linking (UsersController)",
    endpoints: [
      {
        method: "POST",
        path: "/users",
        title: "Register User",
        description: "Registers a new user and automatically creates an encrypted server-side Stellar wallet keypair in crypto mode.",
        scope: "write",
        sourceController: "UsersController (src/users/users.controller.ts)",
        requestBody: {
          contentType: "application/json",
          example: JSON.stringify(
            {
              email: "freelancer@example.com",
              type: "SELLER",
              metadata: { username: "alex_dev", tier: "pro" },
            },
            null,
            2
          ),
        },
        responses: [
          {
            status: 201,
            label: "Created",
            body: JSON.stringify(
              {
                ok: true,
                code: 1001,
                type: "success",
                title: "User Created",
                message: "User registered with invisible Stellar wallet",
                data: {
                  id: "usr_01HQ7XYZ89",
                  email: "freelancer@example.com",
                  type: "SELLER",
                  walletAddress: "GBXF4A7CKUVNLXYZ1234567890ABCDEFGH",
                  createdAt: "2026-02-18T10:00:00.000Z",
                },
              },
              null,
              2
            ),
          },
        ],
      },
      {
        method: "GET",
        path: "/users",
        title: "List Users",
        description: "Retrieves a paginated list of marketplace users.",
        scope: "read",
        sourceController: "UsersController (src/users/users.controller.ts)",
        queryParams: [
          { name: "page", type: "number", required: false, description: "Page number", placeholder: "1" },
          { name: "limit", type: "number", required: false, description: "Page limit (max 100)", placeholder: "20" },
          { name: "type", type: "select", required: false, description: "User type filter", options: ["BUYER", "SELLER", "BOTH"] },
        ],
        responses: [
          {
            status: 200,
            label: "Success",
            body: JSON.stringify(
              {
                ok: true,
                code: 1000,
                type: "success",
                title: "Users Retrieved",
                message: "Found 1 user",
                data: [
                  {
                    id: "usr_01HQ7XYZ89",
                    email: "freelancer@example.com",
                    type: "SELLER",
                    walletAddress: "GBXF4A7CKUVNLXYZ1234567890ABCDEFGH",
                    createdAt: "2026-02-18T10:00:00.000Z",
                  },
                ],
              },
              null,
              2
            ),
          },
        ],
      },
      {
        method: "GET",
        path: "/users/{id}",
        title: "Get User by ID",
        description: "Returns profile details and wallet address for a user.",
        scope: "read",
        sourceController: "UsersController (src/users/users.controller.ts)",
        pathParams: [
          { name: "id", type: "string", required: true, description: "User ID", placeholder: "usr_01HQ7XYZ89" },
        ],
        responses: [
          {
            status: 200,
            label: "Success",
            body: JSON.stringify(
              {
                ok: true,
                code: 1000,
                type: "success",
                title: "User Found",
                message: "User profile loaded",
                data: {
                  id: "usr_01HQ7XYZ89",
                  email: "freelancer@example.com",
                  type: "SELLER",
                  walletAddress: "GBXF4A7CKUVNLXYZ1234567890ABCDEFGH",
                  airtmUserId: null,
                  createdAt: "2026-02-18T10:00:00.000Z",
                },
              },
              null,
              2
            ),
          },
        ],
      },
      {
        method: "PATCH",
        path: "/users/{id}",
        title: "Update User",
        description: "Updates user email or custom metadata attributes.",
        scope: "write",
        sourceController: "UsersController (src/users/users.controller.ts)",
        pathParams: [
          { name: "id", type: "string", required: true, description: "User ID", placeholder: "usr_01HQ7XYZ89" },
        ],
        requestBody: {
          contentType: "application/json",
          example: JSON.stringify({ metadata: { tier: "elite", verified: true } }, null, 2),
        },
        responses: [
          {
            status: 200,
            label: "Success",
            body: JSON.stringify(
              {
                ok: true,
                code: 1000,
                type: "success",
                title: "User Updated",
                message: "User metadata successfully modified",
                data: { id: "usr_01HQ7XYZ89", metadata: { tier: "elite", verified: true } },
              },
              null,
              2
            ),
          },
        ],
      },
      {
        method: "POST",
        path: "/users/{id}/airtm-link",
        title: "Link AirTM Account",
        description: "Links external AirTM user identity for fiat payins/payouts.",
        scope: "write",
        sourceController: "UsersController (src/users/users.controller.ts)",
        pathParams: [
          { name: "id", type: "string", required: true, description: "User ID", placeholder: "usr_01HQ7XYZ89" },
        ],
        requestBody: {
          contentType: "application/json",
          example: JSON.stringify({ airtmUserId: "airtm_user_9921", airtmEmail: "user@airtm.com" }, null, 2),
        },
        responses: [
          {
            status: 200,
            label: "Success",
            body: JSON.stringify(
              {
                ok: true,
                code: 1000,
                type: "success",
                title: "AirTM Linked",
                message: "AirTM account linked to user profile",
                data: { userId: "usr_01HQ7XYZ89", airtmUserId: "airtm_user_9921" },
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
    name: "Balance & Ledger",
    description: "Per-user ledger tracking (available vs reserved), blockchain synchronization, and admin adjustments (BalanceController)",
    endpoints: [
      {
        method: "GET",
        path: "/balance/{userId}",
        title: "Get User Balance",
        description: "Retrieves user available balance and reserved funds locked in active orders.",
        scope: "read",
        sourceController: "BalanceController (src/balance/balance.controller.ts)",
        pathParams: [
          { name: "userId", type: "string", required: true, description: "User ID", placeholder: "usr_buyer123" },
        ],
        responses: [
          {
            status: 200,
            label: "Success",
            body: JSON.stringify(
              {
                ok: true,
                code: 1000,
                type: "success",
                title: "Balance Retrieved",
                message: "Current balance state",
                data: {
                  userId: "usr_buyer123",
                  available: "1250.00",
                  reserved: "200.00",
                  total: "1450.00",
                  currency: "USD",
                  updatedAt: "2026-02-18T10:00:00.000Z",
                },
              },
              null,
              2
            ),
          },
        ],
      },
      {
        method: "POST",
        path: "/balance/{userId}/sync",
        title: "Sync Balance from Chain",
        description: "Forces a real-time balance reconciliation against the Stellar USDC trustline.",
        scope: "write",
        sourceController: "BalanceController (src/balance/balance.controller.ts)",
        pathParams: [
          { name: "userId", type: "string", required: true, description: "User ID", placeholder: "usr_buyer123" },
        ],
        responses: [
          {
            status: 200,
            label: "Success",
            body: JSON.stringify(
              {
                ok: true,
                code: 1000,
                type: "success",
                title: "Balance Synchronized",
                message: "Balance synced with Stellar Horizon",
                data: {
                  userId: "usr_buyer123",
                  available: "1250.00",
                  reserved: "200.00",
                  currency: "USD",
                },
              },
              null,
              2
            ),
          },
        ],
      },
      {
        method: "POST",
        path: "/balance/{userId}/reserve",
        title: "Reserve Balance",
        description: "Moves funds from available to reserved balance for an upcoming order.",
        scope: "write",
        sourceController: "BalanceController (src/balance/balance.controller.ts)",
        pathParams: [
          { name: "userId", type: "string", required: true, description: "User ID", placeholder: "usr_buyer123" },
        ],
        requestBody: {
          contentType: "application/json",
          example: JSON.stringify({ amount: "80.00", orderId: "ord_VxaM981" }, null, 2),
        },
        responses: [
          {
            status: 200,
            label: "Success",
            body: JSON.stringify(
              {
                ok: true,
                code: 1000,
                type: "success",
                title: "Funds Reserved",
                message: "Reserved $80.00 for order ord_VxaM981",
                data: { available: "1170.00", reserved: "280.00" },
              },
              null,
              2
            ),
          },
        ],
      },
      {
        method: "POST",
        path: "/balance/{userId}/release",
        title: "Release Reserved Balance",
        description: "Unlocks reserved funds and returns them to available balance.",
        scope: "write",
        sourceController: "BalanceController (src/balance/balance.controller.ts)",
        pathParams: [
          { name: "userId", type: "string", required: true, description: "User ID", placeholder: "usr_buyer123" },
        ],
        requestBody: {
          contentType: "application/json",
          example: JSON.stringify({ amount: "80.00", orderId: "ord_VxaM981" }, null, 2),
        },
        responses: [
          {
            status: 200,
            label: "Success",
            body: JSON.stringify(
              {
                ok: true,
                code: 1000,
                type: "success",
                title: "Funds Released",
                message: "Returned $80.00 to available balance",
                data: { available: "1250.00", reserved: "200.00" },
              },
              null,
              2
            ),
          },
        ],
      },
      {
        method: "POST",
        path: "/balance/{userId}/credit",
        title: "Credit User Balance",
        description: "Admin or support balance credit adjustment with audit trail.",
        scope: "support",
        sourceController: "BalanceController (src/balance/balance.controller.ts)",
        pathParams: [
          { name: "userId", type: "string", required: true, description: "User ID", placeholder: "usr_buyer123" },
        ],
        requestBody: {
          contentType: "application/json",
          example: JSON.stringify({ amount: "50.00", currency: "USD", reason: "Support dispute adjustment" }, null, 2),
        },
        responses: [
          {
            status: 200,
            label: "Success",
            body: JSON.stringify(
              {
                ok: true,
                code: 1000,
                type: "success",
                title: "Balance Credited",
                message: "Credited $50.00 to user account",
                data: { userId: "usr_buyer123", newAvailable: "1300.00" },
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
    name: "Orders & Lifecycle",
    description: "End-to-end commercial order lifecycle, state machine, and escrow management (OrdersController)",
    endpoints: [
      {
        method: "POST",
        path: "/orders",
        title: "Create Order",
        description: "Creates an order record in ORDER_CREATED state. Accepts Idempotency-Key header.",
        scope: "write",
        sourceController: "OrdersController (src/orders/orders.controller.ts)",
        requestBody: {
          contentType: "application/json",
          example: JSON.stringify(
            {
              buyerId: "usr_buyer123",
              sellerId: "usr_seller456",
              amount: "80.00",
              currency: "USD",
              title: "Logo Design Service",
              description: "Custom SVG branding assets",
              clientOrderRef: "mkt_order_9981",
            },
            null,
            2
          ),
        },
        responses: [
          {
            status: 201,
            label: "Created",
            body: JSON.stringify(
              {
                ok: true,
                code: 1001,
                type: "success",
                title: "Order Created",
                message: "Order created in ORDER_CREATED state",
                data: {
                  id: "ord_VxaM981HQ",
                  status: "ORDER_CREATED",
                  buyerId: "usr_buyer123",
                  sellerId: "usr_seller456",
                  amount: "80.00",
                  currency: "USD",
                  title: "Logo Design Service",
                  createdAt: "2026-02-18T10:00:00.000Z",
                },
              },
              null,
              2
            ),
          },
        ],
      },
      {
        method: "GET",
        path: "/orders",
        title: "List Orders",
        description: "Retrieves a paginated list of orders filtered by buyer, seller, or status.",
        scope: "read",
        sourceController: "OrdersController (src/orders/orders.controller.ts)",
        queryParams: [
          { name: "page", type: "number", required: false, description: "Page number", placeholder: "1" },
          { name: "limit", type: "number", required: false, description: "Page size (default 20)", placeholder: "20" },
          { name: "status", type: "select", required: false, description: "Filter by status", options: ["ORDER_CREATED", "FUNDS_RESERVED", "IN_PROGRESS", "CLOSED"] },
          { name: "buyerId", type: "string", required: false, description: "Filter by buyer ID" },
          { name: "sellerId", type: "string", required: false, description: "Filter by seller ID" },
        ],
        responses: [
          {
            status: 200,
            label: "Success",
            body: JSON.stringify(
              {
                ok: true,
                code: 1000,
                type: "success",
                title: "Orders Retrieved",
                message: "Found 1 order",
                data: [
                  {
                    id: "ord_VxaM981HQ",
                    status: "IN_PROGRESS",
                    buyerId: "usr_buyer123",
                    sellerId: "usr_seller456",
                    amount: "80.00",
                    createdAt: "2026-02-18T10:00:00.000Z",
                  },
                ],
              },
              null,
              2
            ),
          },
        ],
      },
      {
        method: "GET",
        path: "/orders/{id}",
        title: "Get Order Details",
        description: "Returns order status, escrow smart contract link, and milestone details.",
        scope: "read",
        sourceController: "OrdersController (src/orders/orders.controller.ts)",
        pathParams: [
          { name: "id", type: "string", required: true, description: "Order ID", placeholder: "ord_VxaM981HQ" },
        ],
        responses: [
          {
            status: 200,
            label: "Success",
            body: JSON.stringify(
              {
                ok: true,
                code: 1000,
                type: "success",
                title: "Order Found",
                message: "Order details loaded",
                data: {
                  id: "ord_VxaM981HQ",
                  status: "IN_PROGRESS",
                  buyerId: "usr_buyer123",
                  sellerId: "usr_seller456",
                  amount: "80.00",
                  currency: "USD",
                  escrowId: "esc_01HQ7ZX",
                  createdAt: "2026-02-18T10:00:00.000Z",
                },
              },
              null,
              2
            ),
          },
        ],
      },
      {
        method: "POST",
        path: "/orders/{id}/reserve",
        title: "Reserve Order Funds",
        description: "Locks buyer available funds for the order, transitioning state to FUNDS_RESERVED.",
        scope: "write",
        sourceController: "OrdersController (src/orders/orders.controller.ts)",
        pathParams: [
          { name: "id", type: "string", required: true, description: "Order ID", placeholder: "ord_VxaM981HQ" },
        ],
        responses: [
          {
            status: 200,
            label: "Success",
            body: JSON.stringify(
              {
                ok: true,
                code: 1000,
                type: "success",
                title: "Order Funds Reserved",
                message: "Order state moved to FUNDS_RESERVED",
                data: { id: "ord_VxaM981HQ", status: "FUNDS_RESERVED", reservedAt: "2026-02-18T10:01:00.000Z" },
              },
              null,
              2
            ),
          },
        ],
      },
      {
        method: "POST",
        path: "/orders/{id}/cancel",
        title: "Cancel Order",
        description: "Cancels order prior to escrow funding and releases any reserved buyer balance.",
        scope: "write",
        sourceController: "OrdersController (src/orders/orders.controller.ts)",
        pathParams: [
          { name: "id", type: "string", required: true, description: "Order ID", placeholder: "ord_VxaM981HQ" },
        ],
        requestBody: {
          contentType: "application/json",
          example: JSON.stringify({ canceledBy: "BUYER", reason: "Scope changed before project started" }, null, 2),
        },
        responses: [
          {
            status: 200,
            label: "Success",
            body: JSON.stringify(
              {
                ok: true,
                code: 1000,
                type: "success",
                title: "Order Canceled",
                message: "Order closed and funds unlocked",
                data: { id: "ord_VxaM981HQ", status: "CLOSED", finalStatus: "CANCELED" },
              },
              null,
              2
            ),
          },
        ],
      },
      {
        method: "POST",
        path: "/orders/{id}/escrow",
        title: "Deploy Order Escrow",
        description: "Deploys a Soroban smart contract via Trustless Work for this order.",
        scope: "write",
        sourceController: "OrdersController (src/orders/orders.controller.ts)",
        pathParams: [
          { name: "id", type: "string", required: true, description: "Order ID", placeholder: "ord_VxaM981HQ" },
        ],
        responses: [
          {
            status: 200,
            label: "Success",
            body: JSON.stringify(
              {
                ok: true,
                code: 1000,
                type: "success",
                title: "Escrow Contract Deployed",
                message: "Soroban smart contract deployed on Stellar testnet",
                data: {
                  id: "ord_VxaM981HQ",
                  status: "ESCROW_CREATED",
                  escrow: { id: "esc_01HQ7ZX", trustlessContractId: "CBX249SDF890...", status: "CREATED" },
                },
              },
              null,
              2
            ),
          },
        ],
      },
      {
        method: "POST",
        path: "/orders/{id}/escrow/fund",
        title: "Fund Order Escrow",
        description: "Signs on-chain funding transaction with buyer invisible wallet. Moves order to IN_PROGRESS.",
        scope: "write",
        sourceController: "OrdersController (src/orders/orders.controller.ts)",
        pathParams: [
          { name: "id", type: "string", required: true, description: "Order ID", placeholder: "ord_VxaM981HQ" },
        ],
        responses: [
          {
            status: 200,
            label: "Success",
            body: JSON.stringify(
              {
                ok: true,
                code: 1000,
                type: "success",
                title: "Escrow Funded",
                message: "USDC locked in smart contract; order moved to IN_PROGRESS",
                data: {
                  id: "ord_VxaM981HQ",
                  status: "IN_PROGRESS",
                  escrow: { id: "esc_01HQ7ZX", status: "FUNDED", fundedAt: "2026-02-18T10:05:00.000Z" },
                },
              },
              null,
              2
            ),
          },
        ],
      },
      {
        method: "POST",
        path: "/orders/{id}/resolution/release",
        title: "Release Escrow to Seller",
        description: "Executes 3 sequential Stellar transactions to approve milestones and release USDC to seller.",
        scope: "write",
        sourceController: "OrdersController (src/orders/orders.controller.ts)",
        pathParams: [
          { name: "id", type: "string", required: true, description: "Order ID", placeholder: "ord_VxaM981HQ" },
        ],
        requestBody: {
          contentType: "application/json",
          example: JSON.stringify({ requestedBy: "BUYER" }, null, 2),
        },
        responses: [
          {
            status: 200,
            label: "Success",
            body: JSON.stringify(
              {
                ok: true,
                code: 1000,
                type: "success",
                title: "Escrow Released",
                message: "USDC paid to seller wallet; order CLOSED",
                data: { id: "ord_VxaM981HQ", status: "CLOSED", finalStatus: "RELEASED", closedAt: "2026-02-18T11:00:00.000Z" },
              },
              null,
              2
            ),
          },
        ],
      },
      {
        method: "POST",
        path: "/orders/{id}/resolution/refund",
        title: "Refund Escrow to Buyer",
        description: "Executes 2 sequential Stellar transactions to return 100% of escrowed USDC to buyer wallet.",
        scope: "write",
        sourceController: "OrdersController (src/orders/orders.controller.ts)",
        pathParams: [
          { name: "id", type: "string", required: true, description: "Order ID", placeholder: "ord_VxaM981HQ" },
        ],
        requestBody: {
          contentType: "application/json",
          example: JSON.stringify({ requestedBy: "BUYER", reason: "Seller failed to deliver by deadline" }, null, 2),
        },
        responses: [
          {
            status: 200,
            label: "Success",
            body: JSON.stringify(
              {
                ok: true,
                code: 1000,
                type: "success",
                title: "Escrow Refunded",
                message: "USDC refunded to buyer wallet; order CLOSED",
                data: { id: "ord_VxaM981HQ", status: "CLOSED", finalStatus: "REFUNDED" },
              },
              null,
              2
            ),
          },
        ],
      },
      {
        method: "POST",
        path: "/orders/{id}/resolution/dispute",
        title: "Open Order Dispute",
        description: "Freezes in-progress order and opens a formal dispute case for arbitration.",
        scope: "write",
        sourceController: "OrdersController (src/orders/orders.controller.ts)",
        pathParams: [
          { name: "id", type: "string", required: true, description: "Order ID", placeholder: "ord_VxaM981HQ" },
        ],
        requestBody: {
          contentType: "application/json",
          example: JSON.stringify({ openedBy: "BUYER", reason: "QUALITY_ISSUE", notes: "Work submitted does not match specifications" }, null, 2),
        },
        responses: [
          {
            status: 200,
            label: "Success",
            body: JSON.stringify(
              {
                ok: true,
                code: 1000,
                type: "success",
                title: "Dispute Opened",
                message: "Order frozen in DISPUTED state; dispute case created",
                data: {
                  id: "ord_VxaM981HQ",
                  status: "DISPUTED",
                  dispute: { id: "dsp_01HQ7ZX", status: "OPEN", reason: "QUALITY_ISSUE" },
                },
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
    name: "Escrow Smart Contracts",
    description: "Direct management and inspection of Trustless Work Soroban escrow contracts (EscrowController)",
    endpoints: [
      {
        method: "POST",
        path: "/escrow",
        title: "Create Escrow Contract",
        description: "Direct creation of a Soroban smart contract escrow.",
        scope: "write",
        sourceController: "EscrowController (src/escrow/escrow.controller.ts)",
        requestBody: {
          contentType: "application/json",
          example: JSON.stringify(
            {
              orderId: "ord_VxaM981HQ",
              buyerId: "usr_buyer123",
              sellerId: "usr_seller456",
              amount: "80.00",
              currency: "USD",
            },
            null,
            2
          ),
        },
        responses: [
          {
            status: 201,
            label: "Created",
            body: JSON.stringify(
              {
                ok: true,
                code: 1001,
                type: "success",
                title: "Escrow Contract Created",
                message: "Soroban contract deployed",
                data: { id: "esc_01HQ7ZX", orderId: "ord_VxaM981HQ", status: "CREATED", trustlessContractId: "CBX249SDF..." },
              },
              null,
              2
            ),
          },
        ],
      },
      {
        method: "GET",
        path: "/escrow",
        title: "List Escrow Contracts",
        description: "Lists all deployed escrow contracts.",
        scope: "read",
        sourceController: "EscrowController (src/escrow/escrow.controller.ts)",
        responses: [
          {
            status: 200,
            label: "Success",
            body: JSON.stringify(
              {
                ok: true,
                code: 1000,
                type: "success",
                title: "Escrows Retrieved",
                message: "Found 1 escrow",
                data: [
                  {
                    id: "esc_01HQ7ZX",
                    orderId: "ord_VxaM981HQ",
                    status: "FUNDED",
                    amount: "80.00",
                    trustlessContractId: "CBX249SDF...",
                  },
                ],
              },
              null,
              2
            ),
          },
        ],
      },
      {
        method: "GET",
        path: "/escrow/{id}",
        title: "Get Escrow Details",
        description: "Retrieves complete on-chain escrow state, signer addresses, and contract configuration.",
        scope: "read",
        sourceController: "EscrowController (src/escrow/escrow.controller.ts)",
        pathParams: [
          { name: "id", type: "string", required: true, description: "Escrow ID", placeholder: "esc_01HQ7ZX" },
        ],
        responses: [
          {
            status: 200,
            label: "Success",
            body: JSON.stringify(
              {
                ok: true,
                code: 1000,
                type: "success",
                title: "Escrow Details",
                message: "On-chain state loaded",
                data: {
                  id: "esc_01HQ7ZX",
                  orderId: "ord_VxaM981HQ",
                  status: "FUNDED",
                  amount: "80.00",
                  buyerAddress: "GBXF...",
                  sellerAddress: "GSELLER...",
                  platformAddress: "GPLATFORM...",
                  trustlessContractId: "CBX249SDF...",
                  fundedAt: "2026-02-18T10:05:00.000Z",
                },
              },
              null,
              2
            ),
          },
        ],
      },
      {
        method: "POST",
        path: "/escrow/{id}/fund",
        title: "Fund Escrow Contract",
        description: "Directly funds a deployed escrow contract on Stellar.",
        scope: "write",
        sourceController: "EscrowController (src/escrow/escrow.controller.ts)",
        pathParams: [
          { name: "id", type: "string", required: true, description: "Escrow ID", placeholder: "esc_01HQ7ZX" },
        ],
        responses: [
          {
            status: 200,
            label: "Success",
            body: JSON.stringify(
              {
                ok: true,
                code: 1000,
                type: "success",
                title: "Escrow Funded",
                message: "Contract funded on Stellar",
                data: { id: "esc_01HQ7ZX", status: "FUNDED" },
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
    name: "Resolution & Settlement",
    description: "Multi-signature escrow release, refund, and split dispute execution (ResolutionController)",
    endpoints: [
      {
        method: "POST",
        path: "/resolution/release",
        title: "Execute Milestone Release",
        description: "Executes 3-tx on-chain milestone completion, approval, and release to seller.",
        scope: "write",
        sourceController: "ResolutionController (src/resolution/resolution.controller.ts)",
        requestBody: {
          contentType: "application/json",
          example: JSON.stringify({ escrowId: "esc_01HQ7ZX", orderId: "ord_VxaM981HQ" }, null, 2),
        },
        responses: [
          {
            status: 200,
            label: "Success",
            body: JSON.stringify(
              {
                ok: true,
                code: 1000,
                type: "success",
                title: "Release Completed",
                message: "3 Stellar transactions submitted successfully",
                data: {
                  success: true,
                  status: "RELEASED",
                  transactions: [
                    "tx_change_milestone_status_hash_1",
                    "tx_approve_milestone_hash_2",
                    "tx_release_funds_hash_3",
                  ],
                },
              },
              null,
              2
            ),
          },
        ],
      },
      {
        method: "POST",
        path: "/resolution/refund",
        title: "Execute Full Refund",
        description: "Executes 2-tx on-chain dispute and 100% refund resolution to buyer.",
        scope: "write",
        sourceController: "ResolutionController (src/resolution/resolution.controller.ts)",
        requestBody: {
          contentType: "application/json",
          example: JSON.stringify({ escrowId: "esc_01HQ7ZX", reason: "Seller did not deliver" }, null, 2),
        },
        responses: [
          {
            status: 200,
            label: "Success",
            body: JSON.stringify(
              {
                ok: true,
                code: 1000,
                type: "success",
                title: "Refund Completed",
                message: "2 Stellar transactions executed; 100% refunded to buyer",
                data: {
                  success: true,
                  status: "REFUNDED",
                  transactions: ["tx_dispute_escrow_hash_1", "tx_resolve_dispute_hash_2"],
                },
              },
              null,
              2
            ),
          },
        ],
      },
      {
        method: "POST",
        path: "/resolution/resolve",
        title: "Arbitrate Custom Split Resolution",
        description: "Executes platform dispute resolution with arbitrated split distribution.",
        scope: "support",
        sourceController: "ResolutionController (src/resolution/resolution.controller.ts)",
        requestBody: {
          contentType: "application/json",
          example: JSON.stringify(
            {
              disputeId: "dsp_01HQ7ZX",
              decision: "SPLIT",
              releaseAmount: "60.00",
              refundAmount: "20.00",
              note: "75/25 partial delivery settlement",
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
                ok: true,
                code: 1000,
                type: "success",
                title: "Dispute Arbitrated",
                message: "Split settlement executed on-chain",
                data: {
                  success: true,
                  decision: "SPLIT",
                  distributions: [
                    { address: "GSELLER...", amount: "60.00" },
                    { address: "GBUYER...", amount: "20.00" },
                  ],
                },
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
    name: "Top-Ups (Fiat On-Ramp)",
    description: "Fiat deposit on-ramp via AirTM payment gateway (TopUpsController)",
    endpoints: [
      {
        method: "POST",
        path: "/topups",
        title: "Create Fiat Top-Up",
        description: "Initiates AirTM payin request and returns confirmation URI for user redirection.",
        scope: "write",
        sourceController: "TopUpsController (src/topups/topups.controller.ts)",
        requestBody: {
          contentType: "application/json",
          example: JSON.stringify(
            {
              userId: "usr_buyer123",
              amount: "100.00",
              currency: "USD",
              redirectUrl: "https://marketplace.com/wallet/success",
            },
            null,
            2
          ),
        },
        responses: [
          {
            status: 201,
            label: "Created",
            body: JSON.stringify(
              {
                ok: true,
                code: 1001,
                type: "success",
                title: "Top-Up Initialized",
                message: "Redirect user to confirmationUri to complete payment",
                data: {
                  topupId: "tp_xyz789ABC",
                  status: "TOPUP_AWAITING_USER_CONFIRMATION",
                  amount: "100.00",
                  currency: "USD",
                  confirmationUri: "https://app.airtm.com/p/confirm/xxx",
                },
              },
              null,
              2
            ),
          },
        ],
      },
      {
        method: "GET",
        path: "/topups/{id}",
        title: "Get Top-Up Status",
        description: "Retrieves top-up transaction status and external confirmation details.",
        scope: "read",
        sourceController: "TopUpsController (src/topups/topups.controller.ts)",
        pathParams: [
          { name: "id", type: "string", required: true, description: "Top-Up ID", placeholder: "tp_xyz789ABC" },
        ],
        responses: [
          {
            status: 200,
            label: "Success",
            body: JSON.stringify(
              {
                ok: true,
                code: 1000,
                type: "success",
                title: "Top-Up Details",
                message: "Top-up status loaded",
                data: {
                  id: "tp_xyz789ABC",
                  status: "TOPUP_SUCCEEDED",
                  amount: "100.00",
                  userId: "usr_buyer123",
                  airtmPayinId: "airtm_payin_123",
                  createdAt: "2026-02-18T10:00:00.000Z",
                },
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
    name: "Withdrawals (Off-Ramp)",
    description: "Synchronous Stellar USDC payments and AirTM fiat payouts (WithdrawalsController)",
    endpoints: [
      {
        method: "POST",
        path: "/withdrawals",
        title: "Create Withdrawal",
        description: "In crypto mode, executes on-chain Stellar USDC payment synchronously and returns WITHDRAWAL_COMPLETED.",
        scope: "write",
        sourceController: "WithdrawalsController (src/withdrawals/withdrawals.controller.ts)",
        requestBody: {
          contentType: "application/json",
          example: JSON.stringify(
            {
              userId: "usr_seller456",
              amount: "50.00",
              destinationType: "stellar",
              destination: "GBXF4A7CKUVNLXYZ1234567890ABCDEFGH",
            },
            null,
            2
          ),
        },
        responses: [
          {
            status: 201,
            label: "Created",
            body: JSON.stringify(
              {
                ok: true,
                code: 1001,
                type: "success",
                title: "Withdrawal Completed",
                message: "Stellar transaction confirmed on-chain",
                data: {
                  withdrawalId: "wd_xyz789ABC",
                  status: "WITHDRAWAL_COMPLETED",
                  amount: "50.00",
                  destination: "GBXF4A7CKUVNLXYZ1234567890ABCDEFGH",
                  transactionHash: "tx_hash_stellar_sample_placeholder",
                  completedAt: "2026-02-18T17:37:12.000Z",
                },
              },
              null,
              2
            ),
          },
        ],
      },
      {
        method: "GET",
        path: "/withdrawals/{id}",
        title: "Get Withdrawal Status",
        description: "Returns withdrawal transaction details and blockchain transaction hash.",
        scope: "read",
        sourceController: "WithdrawalsController (src/withdrawals/withdrawals.controller.ts)",
        pathParams: [
          { name: "id", type: "string", required: true, description: "Withdrawal ID", placeholder: "wd_xyz789ABC" },
        ],
        responses: [
          {
            status: 200,
            label: "Success",
            body: JSON.stringify(
              {
                ok: true,
                code: 1000,
                type: "success",
                title: "Withdrawal Found",
                message: "Withdrawal record loaded",
                data: {
                  id: "wd_xyz789ABC",
                  status: "WITHDRAWAL_COMPLETED",
                  amount: "50.00",
                  destinationType: "stellar",
                  transactionHash: "tx_hash_stellar_sample_placeholder",
                  completedAt: "2026-02-18T17:37:12.000Z",
                },
              },
              null,
              2
            ),
          },
        ],
      },
      {
        method: "POST",
        path: "/withdrawals/{id}/commit",
        title: "Commit AirTM Withdrawal",
        description: "Commits an AirTM payout request after marketplace review window.",
        scope: "write",
        sourceController: "WithdrawalsController (src/withdrawals/withdrawals.controller.ts)",
        pathParams: [
          { name: "id", type: "string", required: true, description: "Withdrawal ID", placeholder: "wd_xyz789ABC" },
        ],
        responses: [
          {
            status: 200,
            label: "Success",
            body: JSON.stringify(
              {
                ok: true,
                code: 1000,
                type: "success",
                title: "Withdrawal Committed",
                message: "Balance debited and payout submitted to AirTM",
                data: { id: "wd_xyz789ABC", status: "WITHDRAWAL_PROCESSING" },
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
    name: "Disputes & Arbitration",
    description: "Arbitration dispute cases, evidence threads, and resolution decisions (DisputesController)",
    endpoints: [
      {
        method: "POST",
        path: "/disputes",
        title: "Open Dispute",
        description: "Creates an arbitration dispute on an in-progress order.",
        scope: "write",
        sourceController: "DisputesController (src/disputes/disputes.controller.ts)",
        requestBody: {
          contentType: "application/json",
          example: JSON.stringify(
            {
              orderId: "ord_VxaM981HQ",
              openedBy: "BUYER",
              reason: "QUALITY_ISSUE",
              notes: "Work does not match approved wireframe",
            },
            null,
            2
          ),
        },
        responses: [
          {
            status: 201,
            label: "Created",
            body: JSON.stringify(
              {
                ok: true,
                code: 1001,
                type: "success",
                title: "Dispute Opened",
                message: "Dispute case registered in OPEN state",
                data: {
                  id: "dsp_01HQ7ZX",
                  orderId: "ord_VxaM981HQ",
                  status: "OPEN",
                  reason: "QUALITY_ISSUE",
                  createdAt: "2026-02-18T10:00:00.000Z",
                },
              },
              null,
              2
            ),
          },
        ],
      },
      {
        method: "GET",
        path: "/disputes/{id}",
        title: "Get Dispute Details",
        description: "Retrieves dispute record, assigned support agent, and order context.",
        scope: "read",
        sourceController: "DisputesController (src/disputes/disputes.controller.ts)",
        pathParams: [
          { name: "id", type: "string", required: true, description: "Dispute ID", placeholder: "dsp_01HQ7ZX" },
        ],
        responses: [
          {
            status: 200,
            label: "Success",
            body: JSON.stringify(
              {
                ok: true,
                code: 1000,
                type: "success",
                title: "Dispute Details",
                message: "Dispute case loaded",
                data: {
                  id: "dsp_01HQ7ZX",
                  status: "UNDER_REVIEW",
                  openedBy: "BUYER",
                  reason: "QUALITY_ISSUE",
                  assignedTo: "agent_support01",
                  createdAt: "2026-02-18T10:00:00.000Z",
                },
              },
              null,
              2
            ),
          },
        ],
      },
      {
        method: "POST",
        path: "/disputes/{id}/assign",
        title: "Assign Dispute to Agent",
        description: "Assigns a dispute to a support agent, transitioning state to UNDER_REVIEW.",
        scope: "support",
        sourceController: "DisputesController (src/disputes/disputes.controller.ts)",
        pathParams: [
          { name: "id", type: "string", required: true, description: "Dispute ID", placeholder: "dsp_01HQ7ZX" },
        ],
        requestBody: {
          contentType: "application/json",
          example: JSON.stringify({ agentId: "agent_support01", notes: "Reviewing delivery timeline" }, null, 2),
        },
        responses: [
          {
            status: 200,
            label: "Success",
            body: JSON.stringify(
              {
                ok: true,
                code: 1000,
                type: "success",
                title: "Dispute Assigned",
                message: "Dispute assigned to agent_support01",
                data: { id: "dsp_01HQ7ZX", status: "UNDER_REVIEW", assignedTo: "agent_support01" },
              },
              null,
              2
            ),
          },
        ],
      },
      {
        method: "POST",
        path: "/disputes/{id}/resolve",
        title: "Resolve Dispute",
        description: "Executes arbitrated decision on-chain (FULL_RELEASE, FULL_REFUND, or SPLIT).",
        scope: "support",
        sourceController: "DisputesController (src/disputes/disputes.controller.ts)",
        pathParams: [
          { name: "id", type: "string", required: true, description: "Dispute ID", placeholder: "dsp_01HQ7ZX" },
        ],
        requestBody: {
          contentType: "application/json",
          example: JSON.stringify(
            {
              decision: "SPLIT",
              releaseAmount: "60.00",
              refundAmount: "20.00",
              note: "Arbitrated 75% release and 25% refund",
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
                ok: true,
                code: 1000,
                type: "success",
                title: "Dispute Resolved",
                message: "Arbitrated settlement executed on-chain",
                data: {
                  id: "dsp_01HQ7ZX",
                  status: "RESOLVED",
                  decision: "SPLIT",
                  releaseAmount: "60.00",
                  refundAmount: "20.00",
                  resolvedAt: "2026-02-18T12:00:00.000Z",
                },
              },
              null,
              2
            ),
          },
        ],
      },
      {
        method: "POST",
        path: "/disputes/{id}/comments",
        title: "Add Dispute Comment",
        description: "Adds a message or evidence link to a dispute discussion thread.",
        scope: "write",
        sourceController: "DisputesController (src/disputes/disputes.controller.ts)",
        pathParams: [
          { name: "id", type: "string", required: true, description: "Dispute ID", placeholder: "dsp_01HQ7ZX" },
        ],
        requestBody: {
          contentType: "application/json",
          example: JSON.stringify(
            {
              authorId: "usr_buyer123",
              authorRole: "BUYER",
              message: "Attached evidence screenshot showing initial delivery rejection.",
            },
            null,
            2
          ),
        },
        responses: [
          {
            status: 201,
            label: "Created",
            body: JSON.stringify(
              {
                ok: true,
                code: 1001,
                type: "success",
                title: "Comment Added",
                message: "Comment posted to dispute thread",
                data: {
                  id: "cm_01HQ7ZX89",
                  disputeId: "dsp_01HQ7ZX",
                  authorId: "usr_buyer123",
                  message: "Attached evidence screenshot...",
                  createdAt: "2026-02-18T10:15:00.000Z",
                },
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
    name: "Events & Streaming",
    description: "Real-time Server-Sent Events (SSE) and historical event queries (EventsController)",
    endpoints: [
      {
        method: "GET",
        path: "/events",
        title: "Real-Time Event Stream (SSE)",
        description: "Subscribes to live Server-Sent Events (SSE) stream. Supports reconnection via Last-Event-ID header.",
        scope: "read",
        sourceController: "EventsController (src/events/events.controller.ts)",
        queryParams: [
          { name: "types", type: "string", required: false, description: "Comma-separated event types (e.g. order.escrow_funded,balance.credited)" },
          { name: "resourceTypes", type: "string", required: false, description: "Comma-separated resource types (e.g. Order,Balance)" },
        ],
        responses: [
          {
            status: 200,
            label: "SSE Stream",
            body: JSON.stringify(
              {
                eventId: "evt_n_8yumeOFwqPnSbhvemqJ",
                eventType: "order.escrow_funded",
                occurredAt: "2026-02-18T17:37:12.000Z",
                aggregateId: "ord_VxaM981HQ",
                aggregateType: "Order",
                payload: {
                  orderId: "ord_VxaM981HQ",
                  escrowId: "esc_01HQ7ZX",
                  fundedAt: "2026-02-18T17:37:12.000Z",
                },
              },
              null,
              2
            ),
          },
        ],
      },
      {
        method: "GET",
        path: "/events/history",
        title: "Query Historical Events",
        description: "Queries historical domain events stored in the PostgreSQL audit log.",
        scope: "read",
        sourceController: "EventsController (src/events/events.controller.ts)",
        queryParams: [
          { name: "types", type: "string", required: false, description: "Filter by event types" },
          { name: "aggregateId", type: "string", required: false, description: "Filter by resource ID" },
        ],
        responses: [
          {
            status: 200,
            label: "Success",
            body: JSON.stringify(
              {
                ok: true,
                code: 1000,
                type: "success",
                title: "Events History",
                message: "Found 1 event",
                data: [
                  {
                    eventId: "evt_n_8yumeOFwqPnSbhvemqJ",
                    eventType: "order.escrow_funded",
                    occurredAt: "2026-02-18T17:37:12.000Z",
                  },
                ],
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
    name: "Invisible Wallets",
    description: "Server-side invisible Stellar keypairs, deposit addresses, and on-chain syncing (WalletController)",
    endpoints: [
      {
        method: "GET",
        path: "/wallet/deposit-address",
        title: "Get Deposit Address",
        description: "Returns the permanent Stellar USDC deposit address for the caller.",
        scope: "read",
        sourceController: "WalletController (src/wallet/wallet.controller.ts)",
        responses: [
          {
            status: 200,
            label: "Success",
            body: JSON.stringify(
              {
                ok: true,
                code: 1000,
                type: "success",
                title: "Deposit Address",
                message: "Send USDC on Stellar network",
                data: {
                  address: "GBXF4A7CKUVNLXYZ1234567890ABCDEFGH",
                  network: "stellar",
                  asset: "USDC",
                  memo: null,
                  instructions: "Send USDC (Stellar) to this address. Deposits credited automatically within 30s.",
                },
              },
              null,
              2
            ),
          },
        ],
      },
      {
        method: "GET",
        path: "/wallet/{userId}/deposit-address",
        title: "Get User Deposit Address",
        description: "Returns the Stellar USDC deposit address for a specific user ID.",
        scope: "read",
        sourceController: "WalletController (src/wallet/wallet.controller.ts)",
        pathParams: [
          { name: "userId", type: "string", required: true, description: "User ID", placeholder: "usr_buyer123" },
        ],
        responses: [
          {
            status: 200,
            label: "Success",
            body: JSON.stringify(
              {
                ok: true,
                code: 1000,
                type: "success",
                title: "Deposit Address",
                message: "User deposit address loaded",
                data: {
                  address: "GBXF4A7CKUVNLXYZ1234567890ABCDEFGH",
                  network: "stellar",
                  asset: "USDC",
                },
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
    name: "Audit Logging",
    description: "Immutable audit log query and state diff inspection (AuditController)",
    endpoints: [
      {
        method: "GET",
        path: "/audit",
        title: "List Audit Logs",
        description: "Queries immutable audit logs of state transitions and sensitive mutations.",
        scope: "support",
        sourceController: "AuditController (src/audit/audit.controller.ts)",
        queryParams: [
          { name: "page", type: "number", required: false, description: "Page number", placeholder: "1" },
          { name: "limit", type: "number", required: false, description: "Limit", placeholder: "20" },
          { name: "resourceType", type: "string", required: false, description: "Resource filter (e.g. Order)" },
        ],
        responses: [
          {
            status: 200,
            label: "Success",
            body: JSON.stringify(
              {
                ok: true,
                code: 1000,
                type: "success",
                title: "Audit Logs",
                message: "Found 1 audit log",
                data: [
                  {
                    id: "aud_01HQ7ZX89",
                    action: "order.create",
                    actorId: "usr_buyer123",
                    resourceType: "Order",
                    resourceId: "ord_VxaM981HQ",
                    result: "SUCCESS",
                    createdAt: "2026-02-18T10:00:00.000Z",
                  },
                ],
              },
              null,
              2
            ),
          },
        ],
      },
      {
        method: "GET",
        path: "/audit/{id}",
        title: "Get Audit Log Details",
        description: "Retrieves complete audit record including redacted before/after state snapshots.",
        scope: "support",
        sourceController: "AuditController (src/audit/audit.controller.ts)",
        pathParams: [
          { name: "id", type: "string", required: true, description: "Audit Log ID", placeholder: "aud_01HQ7ZX89" },
        ],
        responses: [
          {
            status: 200,
            label: "Success",
            body: JSON.stringify(
              {
                ok: true,
                code: 1000,
                type: "success",
                title: "Audit Record",
                message: "Full state transition snapshot",
                data: {
                  id: "aud_01HQ7ZX89",
                  action: "order.create",
                  actorId: "usr_buyer123",
                  resourceType: "Order",
                  resourceId: "ord_VxaM981HQ",
                  beforeState: null,
                  afterState: { id: "ord_VxaM981HQ", status: "ORDER_CREATED", amount: "80.00" },
                  correlationId: "req_01HQ7ZX89",
                },
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
    name: "Webhooks Ingress",
    description: "Incoming webhook ingress for AirTM and Trustless Work notifications (WebhooksController)",
    endpoints: [
      {
        method: "POST",
        path: "/webhooks/airtm",
        title: "AirTM Webhook Ingress",
        description: "Ingress endpoint for AirTM payin and payout events. Verified with HMAC signature header.",
        sourceController: "WebhooksController (src/webhooks/webhooks.controller.ts)",
        requestBody: {
          contentType: "application/json",
          example: JSON.stringify(
            {
              event: "payin.succeeded",
              payinId: "airtm_payin_123",
              data: { amount: "100.00", userId: "usr_buyer123" },
            },
            null,
            2
          ),
        },
        responses: [
          {
            status: 200,
            label: "Success",
            body: JSON.stringify({ received: true }, null, 2),
          },
        ],
      },
      {
        method: "POST",
        path: "/webhooks/trustless-work",
        title: "Trustless Work Webhook Ingress",
        description: "Ingress endpoint for Trustless Work escrow contract lifecycle notifications.",
        sourceController: "WebhooksController (src/webhooks/webhooks.controller.ts)",
        requestBody: {
          contentType: "application/json",
          example: JSON.stringify(
            {
              event: "escrow.funded",
              contractId: "CBX249SDF...",
              data: { amount: "80.00" },
            },
            null,
            2
          ),
        },
        responses: [
          {
            status: 200,
            label: "Success",
            body: JSON.stringify({ received: true }, null, 2),
          },
        ],
      },
    ],
  },
  {
    name: "System & Health",
    description: "System health probes, runtime configuration, and maintenance mode (HealthController & SystemController)",
    endpoints: [
      {
        method: "GET",
        path: "/health",
        title: "Health Check",
        description: "Returns process health status, version, and component status.",
        sourceController: "HealthController (src/health/health.controller.ts)",
        responses: [
          {
            status: 200,
            label: "Success",
            body: JSON.stringify(
              {
                status: "ok",
                timestamp: "2026-02-18T10:00:00.000Z",
                version: "1.0.0",
                uptime: 12450.5,
                database: "connected",
                redis: "connected",
                horizon: "connected",
              },
              null,
              2
            ),
          },
        ],
      },
      {
        method: "GET",
        path: "/system/info",
        title: "System Runtime Info",
        description: "Returns active payment provider, Stellar network mode, and runtime configuration.",
        scope: "read",
        sourceController: "SystemController (src/system/system.controller.ts)",
        responses: [
          {
            status: 200,
            label: "Success",
            body: JSON.stringify(
              {
                environment: "production",
                paymentProvider: "crypto",
                stellarNetwork: "testnet",
                version: "1.0.0",
                blockchainMonitorActive: true,
                maintenanceMode: false,
              },
              null,
              2
            ),
          },
        ],
      },
      {
        method: "POST",
        path: "/system/maintenance",
        title: "Toggle Maintenance Mode",
        description: "Enables or disables system maintenance mode. Requires Master Key.",
        scope: "master",
        sourceController: "SystemController (src/system/system.controller.ts)",
        requestBody: {
          contentType: "application/json",
          example: JSON.stringify({ enabled: true, message: "Scheduled database maintenance in progress." }, null, 2),
        },
        responses: [
          {
            status: 200,
            label: "Success",
            body: JSON.stringify(
              {
                ok: true,
                code: 1000,
                type: "success",
                title: "Maintenance Mode Updated",
                message: "Maintenance mode is now active",
                data: { maintenanceMode: true, message: "Scheduled database maintenance in progress." },
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
