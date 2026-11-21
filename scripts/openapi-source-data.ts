// ─────────────────────────────────────────────────────────────────────────────
// API Schema — real endpoint definitions for the OFFER-HUB Orchestrator API
// ─────────────────────────────────────────────────────────────────────────────
//
// Source of truth: apps/api/src/modules/*/*.controller.ts and their DTOs in the
// orchestrator repo (https://github.com/OFFER-HUB/OFFER-HUB). Every endpoint below
// cites the controller file/handler (and DTO file, where one exists) it was
// verified against. This file, plus scripts/generate-openapi.ts, is the sole
// source for the generated public/openapi.json — see scripts/README.md.
//
// Keep this in sync with the real API: if a route, parameter, or response shape
// changes in the orchestrator, update the matching entry here and regenerate
// (npm run generate:openapi).

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface Parameter {
  name: string;
  type: "string" | "number" | "select";
  required: boolean;
  description: string;
  placeholder?: string;
  options?: string[]; // for select type
}

// A minimal JSON Schema subset — enough to describe every request/response
// shape in this file and to emit real OpenAPI component schemas, without
// pulling in a JSON Schema library.
export interface SchemaProperty {
  type: "string" | "number" | "boolean" | "object" | "array";
  description?: string;
  format?: string;
  enum?: string[];
  nullable?: boolean;
  default?: unknown;
  items?: SchemaProperty;
  properties?: Record<string, SchemaProperty>;
  required?: string[]; // for nested object-type properties with their own required fields
}

export interface JsonSchema {
  name: string; // registered under components.schemas with this name
  type: "object" | "string" | "array";
  description?: string;
  required?: string[];
  properties?: Record<string, SchemaProperty>;
  items?: SchemaProperty;
}

export interface RequestBody {
  contentType: string;
  example: string; // JSON string
  schema?: JsonSchema;
}

export interface MockResponse {
  status: number;
  label: string;
  body: string; // JSON string, or raw text for non-JSON content types (e.g. SSE)
  contentType?: string; // defaults to application/json
  schema?: JsonSchema;
  description?: string; // used when there is no body (e.g. a redirect)
}

export interface SecurityRequirement {
  scheme: "bearerAuth" | "none";
  scopes?: string[];
}

export interface ErrorRef {
  status: number;
  code: string;
  when: string;
}

export interface ApiEndpoint {
  method: HttpMethod;
  path: string;
  title: string;
  description: string;
  controllerFile?: string;
  controllerHandler?: string;
  dtoFile?: string;
  security?: SecurityRequirement[];
  pathParams?: Parameter[];
  queryParams?: Parameter[];
  requestBody?: RequestBody;
  responses: MockResponse[];
  errors?: ErrorRef[];
}

export interface EndpointCategory {
  name: string;
  description: string;
  endpoints: ApiEndpoint[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Real endpoint data — 52 endpoints verified against the orchestrator's 14
// controllers (apps/api/src/modules/*/*.controller.ts)
// ─────────────────────────────────────────────────────────────────────────────

export const API_SCHEMA: EndpointCategory[] = [
  {
    name: "Auth",
    description:
      "Create and list API keys, exchange a key for a short-lived token, and read the current auth context.",
    endpoints: [
      {
        method: "POST",
        path: "/api/v1/auth/api-keys",
        title: "Create API key",
        description:
          "Creates an API key. The plain-text key is in this response only; the database stores a salted hash.",
        controllerFile: "apps/api/src/modules/auth/auth.controller.ts",
        controllerHandler: "createApiKey",
        security: [
          {
            scheme: "bearerAuth",
            scopes: ["support"],
          },
        ],
        requestBody: {
          contentType: "application/json",
          example:
            '{\n  "name": "Marketplace backend",\n  "scopes": [\n    "read",\n    "write"\n  ]\n}',
          schema: {
            name: "CreateApiKeyRequest",
            type: "object",
            required: ["name", "scopes"],
            properties: {
              name: {
                type: "string",
                description: "Human-readable label for the key.",
              },
              scopes: {
                type: "array",
                items: {
                  type: "string",
                  enum: ["read", "write", "support", "*"],
                },
                description: "Scopes granted to the key.",
              },
            },
          },
        },
        responses: [
          {
            status: 201,
            label: "Created",
            body: '{\n  "data": {\n    "id": "key_V1StGXR8Z5jdHi6B3mEv0",\n    "key": "ohk_live_key_V1StGXR8Z5jdHi6B3mEv0_9f2c1a7e5b3d8f6041c2a9e7b5d3f1a08c6e4b2d7f9a1c3e",\n    "name": "Marketplace backend",\n    "scopes": [\n      "read",\n      "write"\n    ]\n  },\n  "meta": {\n    "requestId": "req_1ab90c",\n    "timestamp": "2026-09-30T10:00:00.000Z"\n  }\n}',
            schema: {
              name: "CreateApiKeyResponse",
              type: "object",
              properties: {
                data: {
                  type: "object",
                  properties: {
                    id: {
                      type: "string",
                    },
                    key: {
                      type: "string",
                      description: "Shown once only.",
                    },
                    name: {
                      type: "string",
                    },
                    scopes: {
                      type: "array",
                      items: {
                        type: "string",
                      },
                    },
                  },
                },
                meta: {
                  type: "object",
                },
              },
            },
          },
        ],
        errors: [
          {
            status: 401,
            code: "UNAUTHORIZED",
            when: "Missing, malformed or unknown credential.",
          },
          {
            status: 403,
            code: "INSUFFICIENT_SCOPE",
            when: "The caller does not have the support scope.",
          },
        ],
      },
      {
        method: "GET",
        path: "/api/v1/auth/api-keys",
        title: "List API keys",
        description:
          "Lists API keys, newest first. Key values are never returned, only their metadata.",
        controllerFile: "apps/api/src/modules/auth/auth.controller.ts",
        controllerHandler: "listApiKeys",
        security: [
          {
            scheme: "bearerAuth",
            scopes: ["support"],
          },
        ],
        queryParams: [
          {
            name: "limit",
            type: "number",
            required: false,
            description: "Keys per page; capped at 100, default 20.",
          },
          {
            name: "cursor",
            type: "string",
            required: false,
            description: "The nextCursor from the previous page.",
          },
        ],
        responses: [
          {
            status: 200,
            label: "OK",
            body: '{\n  "data": {\n    "data": [\n      {\n        "id": "key_V1StGXR8Z5jdHi6B3mEv0",\n        "name": "Marketplace backend",\n        "scopes": [\n          "read",\n          "write"\n        ],\n        "lastUsedAt": "2026-09-30T09:58:12.000Z",\n        "createdAt": "2026-09-29T14:20:00.000Z"\n      }\n    ],\n    "pagination": {\n      "hasMore": false,\n      "nextCursor": null\n    }\n  },\n  "meta": {\n    "requestId": "req_1ab90d",\n    "timestamp": "2026-09-30T10:00:05.000Z"\n  }\n}',
            schema: {
              name: "ListApiKeysResponse",
              type: "object",
              properties: {
                data: {
                  type: "object",
                  properties: {
                    data: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: {
                            type: "string",
                          },
                          name: {
                            type: "string",
                          },
                          scopes: {
                            type: "array",
                            items: {
                              type: "string",
                            },
                          },
                          lastUsedAt: {
                            type: "string",
                            nullable: true,
                          },
                          createdAt: {
                            type: "string",
                          },
                        },
                      },
                    },
                    pagination: {
                      type: "object",
                      properties: {
                        hasMore: {
                          type: "boolean",
                        },
                        nextCursor: {
                          type: "string",
                          nullable: true,
                        },
                      },
                    },
                  },
                },
                meta: {
                  type: "object",
                },
              },
            },
          },
        ],
        errors: [
          {
            status: 401,
            code: "UNAUTHORIZED",
            when: "Missing, malformed or unknown credential.",
          },
          {
            status: 403,
            code: "INSUFFICIENT_SCOPE",
            when: "The caller does not have the support scope.",
          },
        ],
      },
      {
        method: "POST",
        path: "/api/v1/auth/api-keys/{id}/token",
        title: "Generate short-lived token",
        description:
          "Exchanges an API key ID for a short-lived token (ohk_tok_...) valid for 1 hour, carrying the scopes of the key with that ID. No request body.",
        controllerFile: "apps/api/src/modules/auth/auth.controller.ts",
        controllerHandler: "generateToken",
        security: [
          {
            scheme: "bearerAuth",
            scopes: ["write"],
          },
        ],
        pathParams: [
          {
            name: "id",
            type: "string",
            required: true,
            description: "The API key ID, not the key secret.",
          },
        ],
        responses: [
          {
            status: 201,
            label: "Created",
            body: '{\n  "data": {\n    "token": "ohk_tok_eyJhbGciOiJIUzI1NiIs..."\n  },\n  "meta": {\n    "requestId": "req_1ab90e",\n    "timestamp": "2026-09-30T10:01:00.000Z"\n  }\n}',
            schema: {
              name: "GenerateTokenResponse",
              type: "object",
              properties: {
                data: {
                  type: "object",
                  properties: {
                    token: {
                      type: "string",
                    },
                  },
                },
                meta: {
                  type: "object",
                },
              },
            },
          },
        ],
        errors: [
          {
            status: 401,
            code: "UNAUTHORIZED",
            when: "Caller credential invalid, or no key exists with that id.",
          },
          {
            status: 403,
            code: "INSUFFICIENT_SCOPE",
            when: "The caller does not have the write scope.",
          },
        ],
      },
      {
        method: "GET",
        path: "/api/v1/auth/me",
        title: "Current auth context",
        description:
          "Returns the identity behind the credential sent. Any valid API key, token, or master key works; no specific scope is needed.",
        controllerFile: "apps/api/src/modules/auth/auth.controller.ts",
        controllerHandler: "getMe",
        security: [
          {
            scheme: "bearerAuth",
          },
        ],
        responses: [
          {
            status: 200,
            label: "OK",
            body: '{\n  "data": {\n    "apiKeyId": "key_V1StGXR8Z5jdHi6B3mEv0",\n    "apiKeyName": "Marketplace backend",\n    "scopes": [\n      "read",\n      "write"\n    ]\n  }\n}',
            schema: {
              name: "AuthMeResponse",
              type: "object",
              properties: {
                data: {
                  type: "object",
                  properties: {
                    apiKeyId: {
                      type: "string",
                    },
                    apiKeyName: {
                      type: "string",
                      nullable: true,
                    },
                    scopes: {
                      type: "array",
                      items: {
                        type: "string",
                      },
                    },
                  },
                },
              },
            },
          },
        ],
        errors: [
          {
            status: 401,
            code: "UNAUTHORIZED",
            when: "Missing, malformed, unknown or expired credential.",
          },
        ],
      },
    ],
  },
  {
    name: "Config & Health",
    description:
      "Public endpoints needing no credential: platform configuration and basic/detailed health checks.",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/config",
        title: "Platform configuration (public)",
        description:
          "Returns platform configuration (limits, currencies, feature flags). Limits/currencies/provider names are hardcoded string literals in the controller, not read from the environment.",
        controllerFile: "apps/api/src/modules/config/config.controller.ts",
        controllerHandler: "getConfig",
        security: [],
        responses: [
          {
            status: 200,
            label: "OK",
            body: '{\n  "data": {\n    "currencies": [\n      "USD"\n    ],\n    "limits": {\n      "topup": {\n        "min": "1.00",\n        "max": "10000.00"\n      },\n      "withdrawal": {\n        "min": "10.00",\n        "max": "5000.00"\n      },\n      "order": {\n        "min": "1.00",\n        "max": "50000.00"\n      }\n    },\n    "features": {\n      "milestones": true,\n      "disputes": true,\n      "sse": false,\n      "airtm": true,\n      "trustlessWork": true\n    },\n    "providers": {\n      "fiat": "airtm",\n      "escrow": "trustless_work"\n    },\n    "version": "1.0.0"\n  }\n}',
            schema: {
              name: "PlatformConfigResponse",
              type: "object",
              properties: {
                data: {
                  type: "object",
                  properties: {
                    currencies: {
                      type: "array",
                      items: {
                        type: "string",
                      },
                    },
                    limits: {
                      type: "object",
                      properties: {
                        topup: {
                          type: "object",
                          properties: {
                            min: {
                              type: "string",
                            },
                            max: {
                              type: "string",
                            },
                          },
                        },
                        withdrawal: {
                          type: "object",
                          properties: {
                            min: {
                              type: "string",
                            },
                            max: {
                              type: "string",
                            },
                          },
                        },
                        order: {
                          type: "object",
                          properties: {
                            min: {
                              type: "string",
                            },
                            max: {
                              type: "string",
                            },
                          },
                        },
                      },
                    },
                    features: {
                      type: "object",
                      properties: {
                        milestones: {
                          type: "boolean",
                        },
                        disputes: {
                          type: "boolean",
                        },
                        sse: {
                          type: "boolean",
                        },
                        airtm: {
                          type: "boolean",
                        },
                        trustlessWork: {
                          type: "boolean",
                        },
                      },
                    },
                    providers: {
                      type: "object",
                      properties: {
                        fiat: {
                          type: "string",
                        },
                        escrow: {
                          type: "string",
                        },
                      },
                    },
                    version: {
                      type: "string",
                    },
                  },
                },
              },
            },
          },
        ],
      },
      {
        method: "GET",
        path: "/api/v1/health",
        title: "Basic health check (public)",
        description:
          "Does no I/O and answers immediately; tells you only that the API process is up.",
        controllerFile: "apps/api/src/modules/health/health.controller.ts",
        controllerHandler: "getHealth",
        security: [],
        responses: [
          {
            status: 200,
            label: "OK",
            body: '{\n  "data": {\n    "status": "healthy",\n    "version": "1.0.0",\n    "timestamp": "2026-09-30T10:00:00.000Z"\n  },\n  "meta": {\n    "requestId": "req_1ab90c",\n    "timestamp": "2026-09-30T10:00:00.002Z"\n  }\n}',
            schema: {
              name: "BasicHealthResponse",
              type: "object",
              properties: {
                data: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                      enum: ["healthy"],
                    },
                    version: {
                      type: "string",
                    },
                    timestamp: {
                      type: "string",
                    },
                  },
                },
                meta: {
                  type: "object",
                },
              },
            },
          },
        ],
      },
      {
        method: "GET",
        path: "/api/v1/health/detailed",
        title: "Detailed health check (public)",
        description:
          "Tests database, Redis, Airtm, and Trustless Work in parallel, each capped at 5 seconds. Always returns HTTP 200; read data.status for the real result.",
        controllerFile: "apps/api/src/modules/health/health.controller.ts",
        controllerHandler: "getDetailedHealth",
        security: [],
        responses: [
          {
            status: 200,
            label: "OK",
            body: '{\n  "data": {\n    "status": "degraded",\n    "version": "1.0.0",\n    "dependencies": {\n      "database": {\n        "status": "healthy",\n        "latency": 4\n      },\n      "redis": {\n        "status": "healthy",\n        "latency": 2\n      },\n      "airtm": {\n        "status": "degraded",\n        "error": "Not configured"\n      },\n      "trustlessWork": {\n        "status": "healthy",\n        "latency": 180\n      }\n    },\n    "timestamp": "2026-09-30T10:00:00.000Z"\n  },\n  "meta": {\n    "requestId": "req_1ab90d",\n    "timestamp": "2026-09-30T10:00:00.190Z"\n  }\n}',
            schema: {
              name: "DetailedHealthResponse",
              type: "object",
              properties: {
                data: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                      enum: ["healthy", "degraded", "unhealthy"],
                    },
                    version: {
                      type: "string",
                    },
                    dependencies: {
                      type: "object",
                      properties: {
                        database: {
                          type: "object",
                          properties: {
                            status: {
                              type: "string",
                              enum: ["healthy", "unhealthy"],
                            },
                            latency: {
                              type: "number",
                            },
                            error: {
                              type: "string",
                              nullable: true,
                            },
                          },
                        },
                        redis: {
                          type: "object",
                          properties: {
                            status: {
                              type: "string",
                              enum: ["healthy", "unhealthy"],
                            },
                            latency: {
                              type: "number",
                            },
                            error: {
                              type: "string",
                              nullable: true,
                            },
                          },
                        },
                        airtm: {
                          type: "object",
                          properties: {
                            status: {
                              type: "string",
                              enum: ["healthy", "degraded"],
                            },
                            latency: {
                              type: "number",
                            },
                            error: {
                              type: "string",
                              nullable: true,
                            },
                          },
                        },
                        trustlessWork: {
                          type: "object",
                          properties: {
                            status: {
                              type: "string",
                              enum: ["healthy", "degraded"],
                            },
                            latency: {
                              type: "number",
                            },
                            error: {
                              type: "string",
                              nullable: true,
                            },
                          },
                        },
                      },
                    },
                    timestamp: {
                      type: "string",
                    },
                  },
                },
                meta: {
                  type: "object",
                },
              },
            },
          },
        ],
      },
    ],
  },
  {
    name: "Orders",
    description:
      "Order lifecycle up to escrow funding, plus milestone bookkeeping inside IN_PROGRESS.",
    endpoints: [
      {
        method: "POST",
        path: "/api/v1/orders",
        title: "Create order",
        description:
          "Creates the order row and, optionally, its milestones. No funds move and no contract is deployed by this call.",
        controllerFile: "apps/api/src/modules/orders/orders.controller.ts",
        controllerHandler: "create",
        dtoFile: "apps/api/src/modules/orders/dto/create-order.dto.ts",
        security: [],
        requestBody: {
          contentType: "application/json",
          example:
            '{\n  "buyerId": "usr_buyer123",\n  "sellerId": "usr_seller456",\n  "amount": "5000.00",\n  "currency": "USD",\n  "title": "Mobile App Development",\n  "description": "Design, build and ship a customer app",\n  "clientOrderRef": "REQ-1001",\n  "milestones": [\n    {\n      "ref": "design",\n      "title": "UI/UX Design",\n      "amount": "1000.00"\n    }\n  ]\n}',
          schema: {
            name: "CreateOrderRequest",
            type: "object",
            required: ["buyerId", "sellerId", "amount", "title"],
            properties: {
              buyerId: {
                type: "string",
                description: "Internal buyer user ID with the usr_ prefix.",
              },
              sellerId: {
                type: "string",
                description: "Internal seller user ID with the usr_ prefix.",
              },
              amount: {
                type: "string",
                description:
                  'Decimal string with exactly two places, e.g. "100.00".',
              },
              title: {
                type: "string",
                description: "Human-readable order title.",
              },
              currency: {
                type: "string",
                description: "Currency code. Defaults to USD.",
                default: "USD",
              },
              description: {
                type: "string",
                nullable: true,
                description: "Free-form scope text.",
              },
              clientOrderRef: {
                type: "string",
                nullable: true,
                description:
                  "Your own unique order reference; practical idempotency key.",
              },
              metadata: {
                type: "object",
                nullable: true,
                description:
                  "Arbitrary JSON. metadata.platformFee overrides the default 5% platform fee.",
              },
              milestones: {
                type: "array",
                description:
                  "Sub-deliverables; amounts must sum exactly to amount.",
                items: {
                  type: "object",
                  required: ["ref"],
                  properties: {
                    ref: {
                      type: "string",
                      description:
                        "Marketplace milestone reference, used in the complete path.",
                    },
                    title: {
                      type: "string",
                    },
                    amount: {
                      type: "string",
                    },
                  },
                },
              },
            },
          },
        },
        responses: [
          {
            status: 201,
            label: "Created",
            body: '{\n  "data": {\n    "success": true,\n    "data": {\n      "id": "ord_xyz789",\n      "clientOrderRef": "REQ-1001",\n      "buyerId": "usr_buyer123",\n      "sellerId": "usr_seller456",\n      "amount": "5000.00",\n      "currency": "USD",\n      "status": "ORDER_CREATED",\n      "title": "Mobile App Development",\n      "description": "Design, build and ship a customer app",\n      "metadata": {\n        "platformFee": "3.5"\n      },\n      "escrow": null,\n      "milestones": [\n        {\n          "id": "mls_abc123",\n          "orderId": "ord_xyz789",\n          "milestoneRef": "design",\n          "title": "UI/UX Design",\n          "amount": "1000.00",\n          "status": "OPEN"\n        }\n      ],\n      "createdAt": "2026-02-25T12:00:00.000Z",\n      "updatedAt": "2026-02-25T12:00:00.000Z"\n    }\n  },\n  "meta": {\n    "requestId": "req_1ab90c",\n    "timestamp": "2026-02-25T12:00:00.404Z"\n  }\n}',
            schema: {
              name: "CreateOrderResponse",
              type: "object",
              required: ["data", "meta"],
              properties: {
                data: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                    },
                    data: {
                      type: "object",
                      properties: {
                        id: {
                          type: "string",
                        },
                        clientOrderRef: {
                          type: "string",
                          nullable: true,
                        },
                        buyerId: {
                          type: "string",
                        },
                        sellerId: {
                          type: "string",
                        },
                        amount: {
                          type: "string",
                        },
                        currency: {
                          type: "string",
                        },
                        status: {
                          type: "string",
                          enum: ["ORDER_CREATED"],
                        },
                        title: {
                          type: "string",
                        },
                        description: {
                          type: "string",
                          nullable: true,
                        },
                        metadata: {
                          type: "object",
                          nullable: true,
                        },
                        escrow: {
                          type: "object",
                          nullable: true,
                        },
                        milestones: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              id: {
                                type: "string",
                              },
                              milestoneRef: {
                                type: "string",
                              },
                              title: {
                                type: "string",
                              },
                              amount: {
                                type: "string",
                              },
                              status: {
                                type: "string",
                                enum: ["OPEN", "COMPLETED"],
                              },
                            },
                          },
                        },
                        createdAt: {
                          type: "string",
                        },
                        updatedAt: {
                          type: "string",
                        },
                      },
                    },
                  },
                },
                meta: {
                  type: "object",
                  properties: {
                    requestId: {
                      type: "string",
                    },
                    timestamp: {
                      type: "string",
                    },
                  },
                },
              },
            },
          },
        ],
        errors: [
          {
            status: 400,
            code: "VALIDATION_ERROR",
            when: "A required field is missing, wrong type/casing, or an unknown property.",
          },
          {
            status: 400,
            code: "INVALID_REQUEST",
            when: "buyerId and sellerId are the same user.",
          },
          {
            status: 400,
            code: "INVALID_AMOUNT_FORMAT",
            when: "amount is not a two-decimal string, or milestone amounts do not sum to it.",
          },
          {
            status: 404,
            code: "ORDER_NOT_FOUND",
            when: "The buyer or seller user ID does not exist.",
          },
        ],
      },
      {
        method: "GET",
        path: "/api/v1/orders",
        title: "List orders",
        description:
          "Lists orders newest first, with cursor pagination and role/status filters.",
        controllerFile: "apps/api/src/modules/orders/orders.controller.ts",
        controllerHandler: "findAll",
        security: [],
        queryParams: [
          {
            name: "buyer_id",
            type: "string",
            required: false,
            description: "Return orders where this user is the buyer.",
          },
          {
            name: "seller_id",
            type: "string",
            required: false,
            description: "Return orders where this user is the seller.",
          },
          {
            name: "status",
            type: "select",
            required: false,
            description: "Filter by one status. Unknown values are ignored.",
            options: [
              "ORDER_CREATED",
              "FUNDS_RESERVED",
              "ESCROW_CREATING",
              "ESCROW_FUNDING",
              "ESCROW_FUNDED",
              "IN_PROGRESS",
              "RELEASE_REQUESTED",
              "RELEASED",
              "REFUND_REQUESTED",
              "REFUNDED",
              "DISPUTED",
              "CLOSED",
            ],
          },
          {
            name: "limit",
            type: "number",
            required: false,
            description: "Items per page; capped at 100, default 20.",
          },
          {
            name: "cursor",
            type: "string",
            required: false,
            description: "The nextCursor from the previous page.",
          },
        ],
        responses: [
          {
            status: 200,
            label: "OK",
            body: '{\n  "data": {\n    "success": true,\n    "data": [\n      {\n        "id": "ord_xyz789",\n        "buyerId": "usr_buyer123",\n        "sellerId": "usr_seller456",\n        "amount": "5000.00",\n        "currency": "USD",\n        "status": "IN_PROGRESS",\n        "title": "Mobile App Development",\n        "createdAt": "2026-02-25T12:00:00.000Z"\n      }\n    ],\n    "hasMore": true,\n    "nextCursor": "ord_abc123"\n  },\n  "meta": {\n    "requestId": "3f2b8c1e-9d4a-4c7e-8a51-0b6e2d9f7a13",\n    "timestamp": "2026-02-25T12:00:00.412Z"\n  }\n}',
            schema: {
              name: "ListOrdersResponse",
              type: "object",
              properties: {
                data: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                    },
                    data: {
                      type: "array",
                      items: {
                        type: "object",
                      },
                    },
                    hasMore: {
                      type: "boolean",
                    },
                    nextCursor: {
                      type: "string",
                      nullable: true,
                    },
                  },
                },
                meta: {
                  type: "object",
                  properties: {
                    requestId: {
                      type: "string",
                    },
                    timestamp: {
                      type: "string",
                    },
                  },
                },
              },
            },
          },
        ],
      },
      {
        method: "GET",
        path: "/api/v1/orders/{id}",
        title: "Get order",
        description:
          "Fetches one order, including its escrow and milestones relations.",
        controllerFile: "apps/api/src/modules/orders/orders.controller.ts",
        controllerHandler: "findOne",
        security: [],
        pathParams: [
          {
            name: "id",
            type: "string",
            required: true,
            description: "Order ID with the ord_ prefix.",
          },
        ],
        responses: [
          {
            status: 200,
            label: "OK",
            body: '{\n  "data": {\n    "success": true,\n    "data": {\n      "id": "ord_xyz789",\n      "clientOrderRef": "REQ-1001",\n      "buyerId": "usr_buyer123",\n      "sellerId": "usr_seller456",\n      "amount": "5000.00",\n      "currency": "USD",\n      "status": "IN_PROGRESS",\n      "title": "Mobile App Development",\n      "escrow": {\n        "id": "esc_01JKL",\n        "trustlessContractId": "CCBSP2XK4T7Q",\n        "status": "FUNDED",\n        "fundedAt": "2026-02-25T12:07:41.512Z"\n      },\n      "milestones": [\n        {\n          "id": "mls_abc123",\n          "milestoneRef": "design",\n          "title": "UI/UX Design",\n          "amount": "1000.00",\n          "status": "COMPLETED"\n        }\n      ],\n      "createdAt": "2026-02-25T12:00:00.000Z",\n      "updatedAt": "2026-02-25T12:07:41.600Z"\n    }\n  },\n  "meta": {\n    "requestId": "req_1ab91d",\n    "timestamp": "2026-02-25T12:09:12.331Z"\n  }\n}',
            schema: {
              name: "GetOrderResponse",
              type: "object",
              properties: {
                data: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                    },
                    data: {
                      type: "object",
                      properties: {
                        id: {
                          type: "string",
                        },
                        clientOrderRef: {
                          type: "string",
                          nullable: true,
                        },
                        amount: {
                          type: "string",
                        },
                        currency: {
                          type: "string",
                        },
                        status: {
                          type: "string",
                          enum: [
                            "ORDER_CREATED",
                            "FUNDS_RESERVED",
                            "ESCROW_CREATING",
                            "ESCROW_FUNDING",
                            "ESCROW_FUNDED",
                            "IN_PROGRESS",
                            "RELEASE_REQUESTED",
                            "RELEASED",
                            "REFUND_REQUESTED",
                            "REFUNDED",
                            "DISPUTED",
                            "CLOSED",
                          ],
                        },
                        title: {
                          type: "string",
                        },
                        description: {
                          type: "string",
                          nullable: true,
                        },
                        metadata: {
                          type: "object",
                          nullable: true,
                        },
                        escrow: {
                          type: "object",
                          nullable: true,
                        },
                        milestones: {
                          type: "array",
                          items: {
                            type: "object",
                          },
                        },
                      },
                    },
                  },
                },
                meta: {
                  type: "object",
                },
              },
            },
          },
        ],
        errors: [
          {
            status: 404,
            code: "ORDER_NOT_FOUND",
            when: "No order with that ID.",
          },
        ],
      },
      {
        method: "POST",
        path: "/api/v1/orders/{id}/reserve",
        title: "Reserve funds",
        description:
          "Moves order.amount from the buyer's available balance to reserved. Mandatory step before escrow creation. Sends no request body.",
        controllerFile: "apps/api/src/modules/orders/orders.controller.ts",
        controllerHandler: "reserveFunds",
        security: [],
        pathParams: [
          {
            name: "id",
            type: "string",
            required: true,
            description: "Order ID with the ord_ prefix.",
          },
        ],
        responses: [
          {
            status: 201,
            label: "Created",
            body: '{\n  "data": {\n    "success": true,\n    "data": {\n      "id": "ord_xyz789",\n      "buyerId": "usr_buyer123",\n      "sellerId": "usr_seller456",\n      "amount": "5000.00",\n      "currency": "USD",\n      "status": "FUNDS_RESERVED",\n      "title": "Mobile App Development",\n      "escrow": null,\n      "milestones": [],\n      "createdAt": "2026-02-25T12:00:00.000Z",\n      "updatedAt": "2026-02-25T12:03:18.204Z"\n    }\n  },\n  "meta": {\n    "requestId": "req_1ab92e",\n    "timestamp": "2026-02-25T12:03:18.331Z"\n  }\n}',
            schema: {
              name: "ReserveOrderResponse",
              type: "object",
              properties: {
                data: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                    },
                    data: {
                      type: "object",
                      properties: {
                        id: {
                          type: "string",
                        },
                        status: {
                          type: "string",
                          enum: ["ORDER_CREATED", "FUNDS_RESERVED"],
                        },
                        amount: {
                          type: "string",
                        },
                        currency: {
                          type: "string",
                        },
                        escrow: {
                          type: "object",
                          nullable: true,
                        },
                        milestones: {
                          type: "array",
                          items: {
                            type: "object",
                          },
                        },
                      },
                    },
                  },
                },
                meta: {
                  type: "object",
                },
              },
            },
          },
        ],
        errors: [
          {
            status: 400,
            code: "INVALID_STATE",
            when: "The order is not ORDER_CREATED.",
          },
          {
            status: 404,
            code: "ORDER_NOT_FOUND",
            when: "Unknown order ID.",
          },
          {
            status: 409,
            code: "FUNDS_ALREADY_RESERVED",
            when: "Reserving twice.",
          },
          {
            status: 422,
            code: "INSUFFICIENT_FUNDS",
            when: "Buyer available balance is below order.amount.",
          },
        ],
      },
      {
        method: "POST",
        path: "/api/v1/orders/{id}/cancel",
        title: "Cancel order",
        description:
          "Cancels an order that has not reached escrow. Moves to CLOSED; reserved funds (if any) return to the buyer's available balance.",
        controllerFile: "apps/api/src/modules/orders/orders.controller.ts",
        controllerHandler: "cancel",
        dtoFile: "apps/api/src/modules/orders/dto/cancel-order.dto.ts",
        security: [],
        pathParams: [
          {
            name: "id",
            type: "string",
            required: true,
            description: "Order ID with the ord_ prefix.",
          },
        ],
        requestBody: {
          contentType: "application/json",
          example: '{\n  "reason": "Buyer changed mind before escrow"\n}',
          schema: {
            name: "CancelOrderRequest",
            type: "object",
            required: [],
            properties: {
              reason: {
                type: "string",
                nullable: true,
                description:
                  "Free text recorded on the audit entry. Optional; omit the body entirely to send none.",
              },
            },
          },
        },
        responses: [
          {
            status: 201,
            label: "Created",
            body: '{\n  "data": {\n    "success": true,\n    "data": {\n      "id": "ord_xyz789",\n      "buyerId": "usr_buyer123",\n      "sellerId": "usr_seller456",\n      "amount": "5000.00",\n      "currency": "USD",\n      "status": "CLOSED",\n      "title": "Mobile App Development",\n      "escrow": null,\n      "milestones": [],\n      "updatedAt": "2026-02-25T12:04:55.882Z"\n    }\n  },\n  "meta": {\n    "requestId": "req_1ab93f",\n    "timestamp": "2026-02-25T12:04:56.010Z"\n  }\n}',
            schema: {
              name: "CancelOrderResponse",
              type: "object",
              properties: {
                data: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                    },
                    data: {
                      type: "object",
                      properties: {
                        id: {
                          type: "string",
                        },
                        status: {
                          type: "string",
                          enum: ["CLOSED"],
                        },
                        finalStatus: {
                          type: "string",
                          enum: ["CANCELED"],
                          nullable: true,
                        },
                        escrow: {
                          type: "object",
                          nullable: true,
                        },
                        milestones: {
                          type: "array",
                          items: {
                            type: "object",
                          },
                        },
                      },
                    },
                  },
                },
                meta: {
                  type: "object",
                },
              },
            },
          },
        ],
        errors: [
          {
            status: 400,
            code: "VALIDATION_ERROR",
            when: "Unknown body property or non-string reason.",
          },
          {
            status: 400,
            code: "INVALID_STATE",
            when: "The order is past FUNDS_RESERVED.",
          },
          {
            status: 404,
            code: "ORDER_NOT_FOUND",
            when: "Unknown order ID.",
          },
        ],
      },
      {
        method: "GET",
        path: "/api/v1/orders/{id}/milestones",
        title: "Get milestones",
        description:
          "Lists the milestones of one order, ordered by creation time.",
        controllerFile: "apps/api/src/modules/orders/orders.controller.ts",
        controllerHandler: "getMilestones",
        security: [],
        pathParams: [
          {
            name: "id",
            type: "string",
            required: true,
            description: "Order ID with the ord_ prefix.",
          },
        ],
        responses: [
          {
            status: 200,
            label: "OK",
            body: '{\n  "data": {\n    "success": true,\n    "data": [\n      {\n        "id": "mls_abc123",\n        "orderId": "ord_xyz789",\n        "milestoneRef": "design",\n        "title": "UI/UX Design",\n        "amount": "1000.00",\n        "status": "COMPLETED",\n        "createdAt": "2026-02-25T12:00:00.000Z"\n      }\n    ]\n  },\n  "meta": {\n    "requestId": "req_1ab940",\n    "timestamp": "2026-02-25T12:20:02.774Z"\n  }\n}',
            schema: {
              name: "ListMilestonesResponse",
              type: "object",
              properties: {
                data: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                    },
                    data: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: {
                            type: "string",
                          },
                          orderId: {
                            type: "string",
                          },
                          milestoneRef: {
                            type: "string",
                          },
                          title: {
                            type: "string",
                          },
                          amount: {
                            type: "string",
                          },
                          status: {
                            type: "string",
                            enum: ["OPEN", "COMPLETED"],
                          },
                          createdAt: {
                            type: "string",
                          },
                        },
                      },
                    },
                  },
                },
                meta: {
                  type: "object",
                },
              },
            },
          },
        ],
        errors: [
          {
            status: 404,
            code: "ORDER_NOT_FOUND",
            when: "Unknown order ID.",
          },
        ],
      },
      {
        method: "POST",
        path: "/api/v1/orders/{id}/milestones/{milestoneRef}/complete",
        title: "Complete milestone",
        description:
          "Marks one milestone COMPLETED. Bookkeeping write only; moves no money and makes no on-chain call. No request body.",
        controllerFile: "apps/api/src/modules/orders/orders.controller.ts",
        controllerHandler: "completeMilestone",
        security: [],
        pathParams: [
          {
            name: "id",
            type: "string",
            required: true,
            description: "Order ID with the ord_ prefix.",
          },
          {
            name: "milestoneRef",
            type: "string",
            required: true,
            description: "The ref supplied when the order was created.",
          },
        ],
        responses: [
          {
            status: 201,
            label: "Created",
            body: '{\n  "data": {\n    "success": true,\n    "data": {\n      "id": "mls_abc123",\n      "orderId": "ord_xyz789",\n      "milestoneRef": "design",\n      "title": "UI/UX Design",\n      "amount": "1000.00",\n      "status": "COMPLETED",\n      "createdAt": "2026-02-25T12:00:00.000Z"\n    }\n  },\n  "meta": {\n    "requestId": "req_1ab951",\n    "timestamp": "2026-02-25T12:22:44.117Z"\n  }\n}',
            schema: {
              name: "CompleteMilestoneResponse",
              type: "object",
              properties: {
                data: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                    },
                    data: {
                      type: "object",
                      properties: {
                        id: {
                          type: "string",
                        },
                        orderId: {
                          type: "string",
                        },
                        milestoneRef: {
                          type: "string",
                        },
                        title: {
                          type: "string",
                        },
                        amount: {
                          type: "string",
                        },
                        status: {
                          type: "string",
                          enum: ["COMPLETED"],
                        },
                        createdAt: {
                          type: "string",
                        },
                      },
                    },
                  },
                },
                meta: {
                  type: "object",
                },
              },
            },
          },
        ],
        errors: [
          {
            status: 400,
            code: "INVALID_STATE",
            when: "Order is not IN_PROGRESS, or the milestone is already COMPLETED.",
          },
          {
            status: 404,
            code: "ORDER_NOT_FOUND",
            when: "Unknown order ID.",
          },
          {
            status: 404,
            code: "MILESTONE_NOT_FOUND",
            when: "No milestone with that milestoneRef on the order.",
          },
        ],
      },
    ],
  },
  {
    name: "Escrow",
    description:
      "Smart contract creation and funding for a funded order, deployed through Trustless Work.",
    endpoints: [
      {
        method: "POST",
        path: "/api/v1/orders/{id}/escrow",
        title: "Create escrow contract",
        description:
          "Deploys the Trustless Work escrow contract for an order in FUNDS_RESERVED and links it to the order. No request body.",
        controllerFile: "apps/api/src/modules/orders/orders.controller.ts",
        controllerHandler: "createEscrow",
        security: [],
        pathParams: [
          {
            name: "id",
            type: "string",
            required: true,
            description: "Order ID with the ord_ prefix.",
          },
        ],
        responses: [
          {
            status: 201,
            label: "Created",
            body: '{\n  "data": {\n    "success": true,\n    "data": {\n      "id": "ord_abc123",\n      "status": "ESCROW_FUNDING",\n      "amount": "2500.00",\n      "currency": "USD",\n      "escrow": {\n        "id": "esc_01JKL",\n        "trustlessContractId": "CCBSP2XK4T7Q",\n        "status": "CREATED",\n        "amount": "2500.00"\n      }\n    }\n  },\n  "meta": {\n    "requestId": "req_2c8a10",\n    "timestamp": "2026-02-10T09:00:44.700Z"\n  }\n}',
            schema: {
              name: "CreateEscrowResponse",
              type: "object",
              properties: {
                data: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                    },
                    data: {
                      type: "object",
                      properties: {
                        id: {
                          type: "string",
                        },
                        status: {
                          type: "string",
                          enum: ["ESCROW_CREATING", "ESCROW_FUNDING"],
                        },
                        escrow: {
                          type: "object",
                          properties: {
                            id: {
                              type: "string",
                            },
                            trustlessContractId: {
                              type: "string",
                              nullable: true,
                            },
                            status: {
                              type: "string",
                              enum: ["CREATING", "CREATED"],
                            },
                            amount: {
                              type: "string",
                            },
                          },
                        },
                      },
                    },
                  },
                },
                meta: {
                  type: "object",
                },
              },
            },
          },
        ],
        errors: [
          {
            status: 400,
            code: "INVALID_STATE",
            when: "Order is not FUNDS_RESERVED.",
          },
          {
            status: 404,
            code: "ORDER_NOT_FOUND",
            when: "Unknown order ID.",
          },
          {
            status: 409,
            code: "ESCROW_ALREADY_EXISTS",
            when: "The order already has an escrow record.",
          },
          {
            status: 500,
            code: "INTERNAL_ERROR",
            when: "Missing payment accounts, bad milestone totals, or a provider failure; order is rolled back to FUNDS_RESERVED.",
          },
        ],
      },
      {
        method: "POST",
        path: "/api/v1/orders/{id}/escrow/fund",
        title: "Fund escrow",
        description:
          "Moves the buyer's reserved balance into the on-chain contract and moves the order to IN_PROGRESS. No request body.",
        controllerFile: "apps/api/src/modules/orders/orders.controller.ts",
        controllerHandler: "fundEscrow",
        security: [],
        pathParams: [
          {
            name: "id",
            type: "string",
            required: true,
            description: "Order ID with the ord_ prefix.",
          },
        ],
        responses: [
          {
            status: 201,
            label: "Created",
            body: '{\n  "data": {\n    "success": true,\n    "data": {\n      "id": "ord_abc123",\n      "status": "IN_PROGRESS",\n      "escrow": {\n        "id": "esc_01JKL",\n        "status": "FUNDED",\n        "fundedAt": "2026-02-10T09:02:11.120Z"\n      }\n    }\n  },\n  "meta": {\n    "requestId": "req_2c8a11",\n    "timestamp": "2026-02-10T09:02:11.402Z"\n  }\n}',
            schema: {
              name: "FundEscrowResponse",
              type: "object",
              properties: {
                data: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                    },
                    data: {
                      type: "object",
                      properties: {
                        id: {
                          type: "string",
                        },
                        status: {
                          type: "string",
                          enum: ["ESCROW_FUNDING", "IN_PROGRESS"],
                        },
                        escrow: {
                          type: "object",
                          properties: {
                            status: {
                              type: "string",
                              enum: ["CREATED", "FUNDED"],
                            },
                            fundedAt: {
                              type: "string",
                              nullable: true,
                            },
                          },
                        },
                      },
                    },
                  },
                },
                meta: {
                  type: "object",
                },
              },
            },
          },
        ],
        errors: [
          {
            status: 400,
            code: "INVALID_STATE",
            when: "Order is not ESCROW_FUNDING.",
          },
          {
            status: 400,
            code: "ESCROW_FUNDING_FAILED",
            when: "The funding flow failed and was rolled back.",
          },
          {
            status: 422,
            code: "RESERVE_NOT_FOUND",
            when: "Buyer's reserved balance is below order.amount.",
          },
          {
            status: 500,
            code: "INTERNAL_ERROR",
            when: "No escrow row for the order, or the escrow is not CREATED.",
          },
        ],
      },
    ],
  },
  {
    name: "Resolution",
    description:
      "Settles a funded escrow: release to seller, refund to buyer, or open a dispute.",
    endpoints: [
      {
        method: "POST",
        path: "/api/v1/orders/{orderId}/resolution/release",
        title: "Release to seller",
        description:
          "Releases the escrowed funds to the seller. Requires every milestone COMPLETED. Completes synchronously; the returned order is already CLOSED.",
        controllerFile:
          "apps/api/src/modules/resolution/resolution.controller.ts",
        controllerHandler: "requestRelease",
        dtoFile: "apps/api/src/modules/resolution/dto/request-release.dto.ts",
        security: [],
        pathParams: [
          {
            name: "orderId",
            type: "string",
            required: true,
            description: "Order ID with the ord_ prefix.",
          },
        ],
        requestBody: {
          contentType: "application/json",
          example: '{\n  "reason": "All milestones delivered and approved"\n}',
          schema: {
            name: "RequestReleaseRequest",
            type: "object",
            required: [],
            properties: {
              reason: {
                type: "string",
                nullable: true,
                description:
                  "Free-text reason recorded in the audit log; body itself is optional.",
              },
            },
          },
        },
        responses: [
          {
            status: 200,
            label: "OK",
            body: '{\n  "data": {\n    "success": true,\n    "data": {\n      "id": "ord_abc123",\n      "status": "CLOSED",\n      "amount": "2500.00",\n      "escrow": {\n        "id": "esc_01JKL",\n        "status": "RELEASED",\n        "releasedAt": "2026-02-17T16:40:02.881Z"\n      }\n    }\n  },\n  "meta": {\n    "requestId": "req_7f3a1c",\n    "timestamp": "2026-02-17T16:40:03.004Z"\n  }\n}',
            schema: {
              name: "ReleaseResponse",
              type: "object",
              properties: {
                data: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                    },
                    data: {
                      type: "object",
                      properties: {
                        id: {
                          type: "string",
                        },
                        status: {
                          type: "string",
                          enum: ["RELEASE_REQUESTED", "RELEASED", "CLOSED"],
                        },
                        escrow: {
                          type: "object",
                          properties: {
                            status: {
                              type: "string",
                              enum: ["FUNDED", "RELEASED"],
                            },
                            releasedAt: {
                              type: "string",
                              nullable: true,
                            },
                          },
                        },
                      },
                    },
                  },
                },
                meta: {
                  type: "object",
                },
              },
            },
          },
        ],
        errors: [
          {
            status: 400,
            code: "VALIDATION_ERROR",
            when: "Unknown or malformed body property.",
          },
          {
            status: 400,
            code: "INVALID_STATE",
            when: "Order not IN_PROGRESS, escrow missing/not FUNDED, or a milestone not COMPLETED.",
          },
          {
            status: 404,
            code: "ORDER_NOT_FOUND",
            when: "No order with that ID.",
          },
          {
            status: 409,
            code: "DISPUTE_ALREADY_OPEN",
            when: "A dispute that is not RESOLVED blocks the release.",
          },
          {
            status: 500,
            code: "INTERNAL_ERROR",
            when: "A Trustless Work call failed; order rolled back to IN_PROGRESS.",
          },
        ],
      },
      {
        method: "POST",
        path: "/api/v1/orders/{orderId}/resolution/refund",
        title: "Refund to buyer",
        description:
          "Returns the escrowed funds to the buyer via a dispute-then-resolve flow against Trustless Work. Completes synchronously; the returned order is already CLOSED.",
        controllerFile:
          "apps/api/src/modules/resolution/resolution.controller.ts",
        controllerHandler: "requestRefund",
        dtoFile: "apps/api/src/modules/resolution/dto/request-refund.dto.ts",
        security: [],
        pathParams: [
          {
            name: "orderId",
            type: "string",
            required: true,
            description: "Order ID with the ord_ prefix.",
          },
        ],
        requestBody: {
          contentType: "application/json",
          example:
            '{\n  "reason": "Seller never delivered the agreed scope"\n}',
          schema: {
            name: "RequestRefundRequest",
            type: "object",
            required: ["reason"],
            properties: {
              reason: {
                type: "string",
                description: "Non-empty reason for the refund; required.",
              },
            },
          },
        },
        responses: [
          {
            status: 200,
            label: "OK",
            body: '{\n  "data": {\n    "success": true,\n    "data": {\n      "id": "ord_abc123",\n      "status": "CLOSED",\n      "escrow": {\n        "status": "REFUNDED",\n        "refundedAt": "2026-02-17T17:02:55.140Z"\n      },\n      "milestones": []\n    }\n  },\n  "meta": {\n    "requestId": "req_91b2de",\n    "timestamp": "2026-02-17T17:02:55.510Z"\n  }\n}',
            schema: {
              name: "RefundResponse",
              type: "object",
              properties: {
                data: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                    },
                    data: {
                      type: "object",
                      properties: {
                        id: {
                          type: "string",
                        },
                        status: {
                          type: "string",
                          enum: ["REFUND_REQUESTED", "REFUNDED", "CLOSED"],
                        },
                        escrow: {
                          type: "object",
                          properties: {
                            status: {
                              type: "string",
                              enum: ["FUNDED", "REFUNDED"],
                            },
                            refundedAt: {
                              type: "string",
                              nullable: true,
                            },
                          },
                        },
                      },
                    },
                  },
                },
                meta: {
                  type: "object",
                },
              },
            },
          },
        ],
        errors: [
          {
            status: 400,
            code: "VALIDATION_ERROR",
            when: "reason missing, not a string, empty, or unknown property.",
          },
          {
            status: 400,
            code: "INVALID_STATE",
            when: "Order not IN_PROGRESS, escrow missing/not FUNDED.",
          },
          {
            status: 404,
            code: "ORDER_NOT_FOUND",
            when: "No order with that ID.",
          },
          {
            status: 409,
            code: "DISPUTE_ALREADY_OPEN",
            when: "A dispute that is not RESOLVED blocks the refund.",
          },
          {
            status: 500,
            code: "INTERNAL_ERROR",
            when: "A Trustless Work call failed; order rolled back to IN_PROGRESS.",
          },
        ],
      },
      {
        method: "POST",
        path: "/api/v1/orders/{orderId}/resolution/dispute",
        title: "Open dispute",
        description:
          "Freezes the escrow and opens a dispute. No on-chain transaction is sent.",
        controllerFile:
          "apps/api/src/modules/resolution/resolution.controller.ts",
        controllerHandler: "openDispute",
        dtoFile: "apps/api/src/modules/resolution/dto/open-dispute.dto.ts",
        security: [],
        pathParams: [
          {
            name: "orderId",
            type: "string",
            required: true,
            description: "Order ID with the ord_ prefix.",
          },
        ],
        requestBody: {
          contentType: "application/json",
          example:
            '{\n  "orderId": "ord_abc123",\n  "openedBy": "BUYER",\n  "reason": "QUALITY_ISSUE",\n  "evidence": [\n    "https://files.example.com/revision-3.png"\n  ]\n}',
          schema: {
            name: "OpenDisputeRequest",
            type: "object",
            required: ["orderId", "openedBy", "reason"],
            properties: {
              orderId: {
                type: "string",
                description:
                  "Required by the DTO even though the service uses the path parameter.",
              },
              openedBy: {
                type: "string",
                enum: ["BUYER", "SELLER"],
              },
              reason: {
                type: "string",
                enum: ["NOT_DELIVERED", "QUALITY_ISSUE", "OTHER"],
              },
              evidence: {
                type: "array",
                items: {
                  type: "string",
                },
                description: "Evidence reference URLs.",
              },
            },
          },
        },
        responses: [
          {
            status: 201,
            label: "Created",
            body: '{\n  "data": {\n    "success": true,\n    "data": {\n      "id": "dsp_01JKQ7",\n      "orderId": "ord_abc123",\n      "openedBy": "BUYER",\n      "reason": "QUALITY_ISSUE",\n      "evidence": [\n        "https://files.example.com/revision-3.png"\n      ],\n      "status": "OPEN",\n      "order": {\n        "id": "ord_abc123",\n        "status": "DISPUTED"\n      }\n    }\n  },\n  "meta": {\n    "requestId": "req_4d0f81",\n    "timestamp": "2026-02-16T11:20:09.180Z"\n  }\n}',
            schema: {
              name: "OpenDisputeResponse",
              type: "object",
              properties: {
                data: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                    },
                    data: {
                      type: "object",
                      properties: {
                        id: {
                          type: "string",
                        },
                        orderId: {
                          type: "string",
                        },
                        openedBy: {
                          type: "string",
                          enum: ["BUYER", "SELLER"],
                        },
                        reason: {
                          type: "string",
                          enum: ["NOT_DELIVERED", "QUALITY_ISSUE", "OTHER"],
                        },
                        evidence: {
                          type: "array",
                          items: {
                            type: "string",
                          },
                          nullable: true,
                        },
                        status: {
                          type: "string",
                          enum: ["OPEN", "UNDER_REVIEW", "RESOLVED"],
                        },
                        order: {
                          type: "object",
                          properties: {
                            status: {
                              type: "string",
                              enum: ["DISPUTED"],
                            },
                          },
                        },
                      },
                    },
                  },
                },
                meta: {
                  type: "object",
                },
              },
            },
          },
        ],
        errors: [
          {
            status: 400,
            code: "VALIDATION_ERROR",
            when: "Missing orderId/openedBy/reason, unknown enum value, non-array evidence, or unknown property.",
          },
          {
            status: 400,
            code: "INVALID_STATE",
            when: "Order not IN_PROGRESS.",
          },
          {
            status: 404,
            code: "ORDER_NOT_FOUND",
            when: "No order with that ID.",
          },
          {
            status: 409,
            code: "DISPUTE_ALREADY_OPEN",
            when: "A dispute for this order exists and is not RESOLVED.",
          },
        ],
      },
    ],
  },
  // NOTE: disputes.mdx documents bearerAuth with read/write scopes for these 4 endpoints, but
  // disputes.controller.ts (OFFER-HUB/OFFER-HUB) has no @UseGuards/@Scopes decorators, and neither
  // main.ts nor app.module.ts register a global auth guard (the only APP_GUARD is RateLimitGuard).
  // security below reflects the real, currently-unenforced code, not the docs' claim. Flagged for
  // the orchestrator maintainers in the PR description; not something this PR can fix (separate repo).
  {
    name: "Disputes",
    description:
      "List, inspect, assign, and resolve disputes raised on escrowed orders.",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/disputes",
        title: "List disputes",
        description:
          "Returns all disputes for the caller's marketplace, newest first. Not paginated — returns every match.",
        controllerFile: "apps/api/src/modules/disputes/disputes.controller.ts",
        controllerHandler: "listDisputes",
        security: [],
        queryParams: [
          {
            name: "orderId",
            type: "string",
            required: false,
            description: "Filter to disputes of a single order",
          },
          {
            name: "status",
            type: "select",
            required: false,
            description: "Dispute status filter",
            options: ["OPEN", "UNDER_REVIEW", "RESOLVED"],
          },
          {
            name: "openedBy",
            type: "select",
            required: false,
            description: "Who opened the dispute",
            options: ["BUYER", "SELLER"],
          },
        ],
        responses: [
          {
            status: 200,
            label: "Success",
            body: '{\n  "data": {\n    "success": true,\n    "data": [\n      {\n        "id": "dsp_01JABCDEF",\n        "orderId": "ord_01HGFEDCBA",\n        "openedBy": "BUYER",\n        "reason": "NOT_DELIVERED",\n        "evidence": [\n          "https://cdn.example.com/proof.png"\n        ],\n        "status": "OPEN",\n        "resolutionDecision": null,\n        "decisionNote": null,\n        "createdAt": "2026-02-01T10:15:00.000Z",\n        "updatedAt": "2026-02-01T10:15:00.000Z"\n      }\n    ]\n  },\n  "meta": {\n    "requestId": "3f2b8c1e-9d4a-4c7e-8a51-0b6e2d9f7a13",\n    "timestamp": "2026-02-25T12:00:00.412Z"\n  }\n}',
            schema: {
              name: "ListDisputesResponse",
              type: "object",
              required: ["data"],
              properties: {
                data: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                    },
                    data: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: {
                            type: "string",
                          },
                          orderId: {
                            type: "string",
                          },
                          openedBy: {
                            type: "string",
                            enum: ["BUYER", "SELLER"],
                          },
                          reason: {
                            type: "string",
                            enum: ["NOT_DELIVERED", "QUALITY_ISSUE", "OTHER"],
                          },
                          evidence: {
                            type: "array",
                            items: {
                              type: "string",
                            },
                          },
                          status: {
                            type: "string",
                            enum: ["OPEN", "UNDER_REVIEW", "RESOLVED"],
                          },
                          resolutionDecision: {
                            type: "string",
                            nullable: true,
                            enum: ["FULL_RELEASE", "FULL_REFUND", "SPLIT"],
                          },
                          decisionNote: {
                            type: "string",
                            nullable: true,
                          },
                          createdAt: {
                            type: "string",
                            format: "date-time",
                          },
                          updatedAt: {
                            type: "string",
                            format: "date-time",
                          },
                        },
                      },
                    },
                  },
                },
                meta: {
                  type: "object",
                  properties: {
                    requestId: {
                      type: "string",
                    },
                    timestamp: {
                      type: "string",
                      format: "date-time",
                    },
                  },
                },
              },
            },
          },
        ],
        errors: [
          {
            status: 401,
            code: "UNAUTHORIZED",
            when: "Missing or invalid API key (per the documented security model; not currently enforced in code, see note above)",
          },
        ],
      },
      {
        method: "GET",
        path: "/api/v1/disputes/{id}",
        title: "Get a dispute",
        description:
          "Returns a single dispute including the related order (with escrow, dispute, and milestones relations).",
        controllerFile: "apps/api/src/modules/disputes/disputes.controller.ts",
        controllerHandler: "getDispute",
        security: [],
        pathParams: [
          {
            name: "id",
            type: "string",
            required: true,
            description: "Dispute identifier",
          },
        ],
        responses: [
          {
            status: 200,
            label: "Success",
            body: '{\n  "data": {\n    "success": true,\n    "data": {\n      "id": "dsp_01JABCDEF",\n      "orderId": "ord_01HGFEDCBA",\n      "openedBy": "BUYER",\n      "reason": "QUALITY_ISSUE",\n      "evidence": [\n        "https://cdn.example.com/screenshot.png"\n      ],\n      "status": "UNDER_REVIEW",\n      "resolutionDecision": null,\n      "decisionNote": null,\n      "createdAt": "2026-02-01T10:15:00.000Z",\n      "updatedAt": "2026-02-02T09:30:00.000Z",\n      "order": {\n        "id": "ord_01HGFEDCBA",\n        "amount": "100.00",\n        "escrow": {\n          "id": "esc_01JKL",\n          "status": "FUNDED"\n        },\n        "milestones": []\n      }\n    }\n  },\n  "meta": {\n    "requestId": "3f2b8c1e-9d4a-4c7e-8a51-0b6e2d9f7a13",\n    "timestamp": "2026-02-25T12:00:00.412Z"\n  }\n}',
            schema: {
              name: "GetDisputeResponse",
              type: "object",
              properties: {
                data: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                    },
                    data: {
                      type: "object",
                      properties: {
                        id: {
                          type: "string",
                        },
                        orderId: {
                          type: "string",
                        },
                        openedBy: {
                          type: "string",
                          enum: ["BUYER", "SELLER"],
                        },
                        reason: {
                          type: "string",
                          enum: ["NOT_DELIVERED", "QUALITY_ISSUE", "OTHER"],
                        },
                        evidence: {
                          type: "array",
                          items: {
                            type: "string",
                          },
                        },
                        status: {
                          type: "string",
                          enum: ["OPEN", "UNDER_REVIEW", "RESOLVED"],
                        },
                        resolutionDecision: {
                          type: "string",
                          nullable: true,
                          enum: ["FULL_RELEASE", "FULL_REFUND", "SPLIT"],
                        },
                        decisionNote: {
                          type: "string",
                          nullable: true,
                        },
                        createdAt: {
                          type: "string",
                          format: "date-time",
                        },
                        updatedAt: {
                          type: "string",
                          format: "date-time",
                        },
                        order: {
                          type: "object",
                          description:
                            "Present when relations are included; has nested escrow and milestones",
                        },
                      },
                    },
                  },
                },
                meta: {
                  type: "object",
                  properties: {
                    requestId: {
                      type: "string",
                    },
                    timestamp: {
                      type: "string",
                      format: "date-time",
                    },
                  },
                },
              },
            },
          },
        ],
        errors: [
          {
            status: 404,
            code: "DISPUTE_NOT_FOUND",
            when: "No dispute with the given id",
          },
        ],
      },
      {
        method: "POST",
        path: "/api/v1/disputes/{id}/assign",
        title: "Assign a dispute",
        description:
          "Moves an OPEN dispute to UNDER_REVIEW and records the assigned support agent. Requires the dispute to be in OPEN state; writes a DISPUTE_ASSIGNED audit entry and emits dispute.under_review on the event bus. Supports an optional Idempotency-Key header.",
        controllerFile: "apps/api/src/modules/disputes/disputes.controller.ts",
        controllerHandler: "assignDispute",
        dtoFile: "apps/api/src/modules/resolution/dto/assign-dispute.dto.ts",
        security: [],
        pathParams: [
          {
            name: "id",
            type: "string",
            required: true,
            description: "Dispute identifier",
          },
        ],
        requestBody: {
          contentType: "application/json",
          example: '{\n  "assignedTo": "agent_support01"\n}',
          schema: {
            name: "AssignDisputeRequest",
            type: "object",
            required: ["assignedTo"],
            properties: {
              assignedTo: {
                type: "string",
                description:
                  "Support agent handling the review (@IsString @IsNotEmpty)",
              },
            },
          },
        },
        responses: [
          {
            status: 200,
            label: "Success (controller declares @HttpCode(HttpStatus.OK))",
            body: '{\n  "data": {\n    "success": true,\n    "data": {\n      "id": "dsp_01JABCDEF",\n      "orderId": "ord_01HGFEDCBA",\n      "openedBy": "BUYER",\n      "reason": "NOT_DELIVERED",\n      "evidence": [\n        "https://cdn.example.com/proof.png"\n      ],\n      "status": "UNDER_REVIEW",\n      "resolutionDecision": null,\n      "decisionNote": null,\n      "createdAt": "2026-02-01T10:15:00.000Z",\n      "updatedAt": "2026-02-03T08:00:00.000Z"\n    }\n  },\n  "meta": {\n    "requestId": "3f2b8c1e-9d4a-4c7e-8a51-0b6e2d9f7a13",\n    "timestamp": "2026-02-25T12:00:00.412Z"\n  }\n}',
            schema: {
              name: "AssignDisputeResponse",
              type: "object",
              properties: {
                data: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                    },
                    data: {
                      type: "object",
                      properties: {
                        id: {
                          type: "string",
                        },
                        orderId: {
                          type: "string",
                        },
                        status: {
                          type: "string",
                          enum: ["OPEN", "UNDER_REVIEW", "RESOLVED"],
                        },
                        updatedAt: {
                          type: "string",
                          format: "date-time",
                        },
                      },
                    },
                  },
                },
                meta: {
                  type: "object",
                },
              },
            },
          },
        ],
        errors: [
          {
            status: 400,
            code: "VALIDATION_ERROR",
            when: "assignedTo missing or empty",
          },
          {
            status: 400,
            code: "INVALID_STATE",
            when: "Dispute is not in OPEN state (InvalidDisputeStateException extends BadRequestException — HTTP status comes from the exception class, not the shared ERROR_HTTP_STATUS map, which is why this is 400 and not 409)",
          },
          {
            status: 404,
            code: "DISPUTE_NOT_FOUND",
            when: "No dispute with the given id",
          },
        ],
      },
      {
        method: "POST",
        path: "/api/v1/disputes/{id}/resolve",
        title: "Resolve a dispute",
        description:
          "Closes a dispute that is UNDER_REVIEW by executing a financial decision (FULL_RELEASE, FULL_REFUND, or SPLIT) and setting status to RESOLVED. Writes a DISPUTE_RESOLVED audit entry and emits dispute.resolved. Supports an optional Idempotency-Key header.",
        controllerFile: "apps/api/src/modules/disputes/disputes.controller.ts",
        controllerHandler: "resolveDispute",
        dtoFile: "apps/api/src/modules/resolution/dto/resolve-dispute.dto.ts",
        security: [],
        pathParams: [
          {
            name: "id",
            type: "string",
            required: true,
            description: "Dispute identifier",
          },
        ],
        requestBody: {
          contentType: "application/json",
          example:
            '{\n  "decision": "SPLIT",\n  "releaseAmount": "60.00",\n  "refundAmount": "40.00",\n  "note": "Partial work completed"\n}',
          schema: {
            name: "ResolveDisputeRequest",
            type: "object",
            required: ["decision"],
            properties: {
              decision: {
                type: "string",
                enum: ["FULL_RELEASE", "FULL_REFUND", "SPLIT"],
                description: "@IsEnum(ResolutionDecision)",
              },
              releaseAmount: {
                type: "string",
                format: "decimal",
                description:
                  "Seller portion; required when decision=SPLIT. @Matches(/^\\d+\\.\\d{2}$/)",
              },
              refundAmount: {
                type: "string",
                format: "decimal",
                description:
                  "Buyer portion; required when decision=SPLIT. @Matches(/^\\d+\\.\\d{2}$/). releaseAmount + refundAmount must equal the order amount exactly.",
              },
              note: {
                type: "string",
                description:
                  "Free-form note stored as decisionNote. @IsOptional",
              },
            },
          },
        },
        responses: [
          {
            status: 200,
            label: "Success",
            body: '{\n  "data": {\n    "success": true,\n    "data": {\n      "id": "dsp_01JABCDEF",\n      "orderId": "ord_01HGFEDCBA",\n      "openedBy": "BUYER",\n      "reason": "NOT_DELIVERED",\n      "evidence": [\n        "https://cdn.example.com/proof.png"\n      ],\n      "status": "RESOLVED",\n      "resolutionDecision": "SPLIT",\n      "decisionNote": "Partial work completed",\n      "createdAt": "2026-02-01T10:15:00.000Z",\n      "updatedAt": "2026-02-04T12:00:00.000Z"\n    }\n  },\n  "meta": {\n    "requestId": "3f2b8c1e-9d4a-4c7e-8a51-0b6e2d9f7a13",\n    "timestamp": "2026-02-25T12:00:00.412Z"\n  }\n}',
            schema: {
              name: "ResolveDisputeResponse",
              type: "object",
              properties: {
                data: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                    },
                    data: {
                      type: "object",
                      properties: {
                        id: {
                          type: "string",
                        },
                        status: {
                          type: "string",
                          enum: ["OPEN", "UNDER_REVIEW", "RESOLVED"],
                        },
                        resolutionDecision: {
                          type: "string",
                          enum: ["FULL_RELEASE", "FULL_REFUND", "SPLIT"],
                        },
                        decisionNote: {
                          type: "string",
                          nullable: true,
                        },
                        updatedAt: {
                          type: "string",
                          format: "date-time",
                        },
                      },
                    },
                  },
                },
                meta: {
                  type: "object",
                },
              },
            },
          },
        ],
        errors: [
          {
            status: 400,
            code: "VALIDATION_ERROR",
            when: "Body fails DTO validation, e.g. decision not in enum or amount not matching ^\\d+\\.\\d{2}$",
          },
          {
            status: 400,
            code: "INVALID_STATE",
            when: "Dispute is not in UNDER_REVIEW state",
          },
          {
            status: 404,
            code: "DISPUTE_NOT_FOUND",
            when: "No dispute with the given id",
          },
          {
            status: 422,
            code: "INVALID_AMOUNT",
            when: "SPLIT without both amounts, or releaseAmount + refundAmount does not equal the order amount (InvalidDisputeResolutionException extends UnprocessableEntityException)",
          },
        ],
      },
    ],
  },
  {
    name: "Users",
    description:
      "Create users with an automatic balance, and link a user's Airtm account.",
    endpoints: [
      {
        method: "POST",
        path: "/api/v1/users",
        title: "Create user",
        description:
          "Creates a user and their balance in one transaction. If a user with the same externalUserId already exists, the existing user is returned instead of an error.",
        controllerFile: "apps/api/src/modules/users/users.controller.ts",
        controllerHandler: "createUser",
        dtoFile: "apps/api/src/modules/users/dto/create-user.dto.ts",
        security: [
          {
            scheme: "bearerAuth",
            scopes: ["write"],
          },
        ],
        requestBody: {
          contentType: "application/json",
          example:
            '{\n  "externalUserId": "user_123",\n  "email": "buyer@example.com",\n  "type": "BUYER"\n}',
          schema: {
            name: "CreateUserRequest",
            type: "object",
            required: ["externalUserId"],
            properties: {
              externalUserId: {
                type: "string",
                description:
                  "Your marketplace's own ID for this user; unique platform-wide.",
              },
              email: {
                type: "string",
                nullable: true,
              },
              type: {
                type: "string",
                enum: ["BUYER", "SELLER", "BOTH"],
                default: "BOTH",
              },
            },
          },
        },
        responses: [
          {
            status: 201,
            label: "Created",
            body: '{\n  "data": {\n    "id": "usr_V1StGXR8Z5jdHi6B3mEv0",\n    "externalUserId": "user_123",\n    "email": "buyer@example.com",\n    "type": "BUYER",\n    "status": "ACTIVE",\n    "balance": {\n      "available": "0.00",\n      "reserved": "0.00",\n      "currency": "USD"\n    },\n    "airtmLinked": false,\n    "airtmUserId": null,\n    "airtmLinkedAt": null,\n    "createdAt": "2026-09-30T10:00:00.000Z",\n    "updatedAt": "2026-09-30T10:00:00.000Z"\n  }\n}',
            schema: {
              name: "CreateUserResponse",
              type: "object",
              properties: {
                data: {
                  type: "object",
                  properties: {
                    id: {
                      type: "string",
                    },
                    externalUserId: {
                      type: "string",
                    },
                    email: {
                      type: "string",
                      nullable: true,
                    },
                    type: {
                      type: "string",
                      enum: ["BUYER", "SELLER", "BOTH"],
                    },
                    status: {
                      type: "string",
                    },
                    balance: {
                      type: "object",
                      properties: {
                        available: {
                          type: "string",
                        },
                        reserved: {
                          type: "string",
                        },
                        currency: {
                          type: "string",
                        },
                      },
                    },
                    airtmLinked: {
                      type: "boolean",
                    },
                    airtmUserId: {
                      type: "string",
                      nullable: true,
                    },
                    airtmLinkedAt: {
                      type: "string",
                      nullable: true,
                    },
                    createdAt: {
                      type: "string",
                    },
                    updatedAt: {
                      type: "string",
                    },
                  },
                },
              },
            },
          },
        ],
        errors: [
          {
            status: 400,
            code: "VALIDATION_ERROR",
            when: "externalUserId missing/empty, email invalid, type not an enum value, or unknown property.",
          },
          {
            status: 401,
            code: "UNAUTHORIZED",
            when: "Missing, malformed or unknown credential.",
          },
          {
            status: 403,
            code: "INSUFFICIENT_SCOPE",
            when: "The caller does not have the write scope.",
          },
        ],
      },
      {
        method: "POST",
        path: "/api/v1/users/{id}/airtm/link",
        title: "Link Airtm account",
        description:
          "Verifies a user's email against Airtm and stores the link. If already linked, the stored link is returned without re-verifying.",
        controllerFile: "apps/api/src/modules/users/users.controller.ts",
        controllerHandler: "linkAirtm",
        dtoFile: "apps/api/src/modules/users/dto/link-airtm.dto.ts",
        security: [
          {
            scheme: "bearerAuth",
            scopes: ["write"],
          },
        ],
        pathParams: [
          {
            name: "id",
            type: "string",
            required: true,
            description:
              "The internal user ID (usr_ prefix), not externalUserId.",
          },
        ],
        requestBody: {
          contentType: "application/json",
          example: '{\n  "email": "buyer@example.com"\n}',
          schema: {
            name: "LinkAirtmRequest",
            type: "object",
            required: ["email"],
            properties: {
              email: {
                type: "string",
                description: "Must match the email registered in Airtm.",
              },
            },
          },
        },
        responses: [
          {
            status: 200,
            label: "OK",
            body: '{\n  "data": {\n    "userId": "usr_V1StGXR8Z5jdHi6B3mEv0",\n    "airtmUserId": "airtm_8f3a2c",\n    "airtmLinkedAt": "2026-09-30T10:05:00.000Z",\n    "eligible": true,\n    "email": "buyer@example.com"\n  }\n}',
            schema: {
              name: "LinkAirtmResponse",
              type: "object",
              properties: {
                data: {
                  type: "object",
                  properties: {
                    userId: {
                      type: "string",
                    },
                    airtmUserId: {
                      type: "string",
                    },
                    airtmLinkedAt: {
                      type: "string",
                    },
                    eligible: {
                      type: "boolean",
                    },
                    email: {
                      type: "string",
                    },
                  },
                },
              },
            },
          },
        ],
        errors: [
          {
            status: 400,
            code: "VALIDATION_ERROR",
            when: "email missing/invalid, or unknown property.",
          },
          {
            status: 400,
            code: "USER_NOT_FOUND",
            when: "Airtm has no account for that email.",
          },
          {
            status: 400,
            code: "USER_INACTIVE",
            when: "The Airtm account is inactive.",
          },
          {
            status: 400,
            code: "AIRTM_USER_INVALID",
            when: "Airtm verification failed for another reason.",
          },
          {
            status: 401,
            code: "UNAUTHORIZED",
            when: "Missing, malformed or unknown credential.",
          },
          {
            status: 403,
            code: "INSUFFICIENT_SCOPE",
            when: "The caller does not have the write scope.",
          },
          {
            status: 404,
            code: "USER_NOT_FOUND",
            when: "No user with that internal ID on your platform.",
          },
        ],
      },
    ],
  },
  {
    name: "Wallet & Top-ups",
    description:
      "Stellar wallet info, crypto deposit instructions, transaction history, and AirTM top-up flow.",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/users/{userId}/wallet",
        title: "Get wallet info",
        description:
          "Returns the user's primary Stellar wallet with current on-chain USDC and XLM balances.",
        controllerFile: "apps/api/src/modules/wallet/wallet.controller.ts",
        controllerHandler: "getWallet",
        dtoFile: "apps/api/src/modules/wallet/dto/wallet-response.dto.ts",
        security: [
          {
            scheme: "bearerAuth",
            scopes: ["read"],
          },
        ],
        pathParams: [
          {
            name: "userId",
            type: "string",
            required: true,
            description: "Internal OFFER-HUB user ID (prefix usr_).",
          },
        ],
        responses: [
          {
            status: 200,
            label: "OK",
            body: '{\n  "data": {\n    "publicKey": "GABCDEF...",\n    "type": "INVISIBLE",\n    "provider": "STELLAR",\n    "isActive": true,\n    "isPrimary": true,\n    "balance": {\n      "usdc": "150.0000000",\n      "xlm": "5.0000000"\n    },\n    "createdAt": "2026-09-24T10:00:00.000Z"\n  }\n}',
            schema: {
              name: "WalletInfoResponse",
              type: "object",
              properties: {
                data: {
                  type: "object",
                  properties: {
                    publicKey: {
                      type: "string",
                    },
                    type: {
                      type: "string",
                      enum: ["INVISIBLE", "EXTERNAL"],
                    },
                    provider: {
                      type: "string",
                      enum: ["STELLAR"],
                    },
                    isActive: {
                      type: "boolean",
                    },
                    isPrimary: {
                      type: "boolean",
                    },
                    balance: {
                      type: "object",
                      properties: {
                        usdc: {
                          type: "string",
                        },
                        xlm: {
                          type: "string",
                        },
                      },
                    },
                    createdAt: {
                      type: "string",
                    },
                  },
                },
              },
            },
          },
        ],
        errors: [
          {
            status: 401,
            code: "UNAUTHORIZED",
            when: "Missing or invalid API key.",
          },
          {
            status: 403,
            code: "INSUFFICIENT_SCOPE",
            when: "API key lacks read scope.",
          },
          {
            status: 404,
            code: "WALLET_NOT_FOUND",
            when: "No active primary wallet.",
          },
        ],
      },
      {
        method: "GET",
        path: "/api/v1/users/{userId}/wallet/deposit",
        title: "Get deposit address",
        description:
          "Returns deposit instructions: the Stellar address to send USDC to, plus asset and network details.",
        controllerFile: "apps/api/src/modules/wallet/wallet.controller.ts",
        controllerHandler: "getDepositAddress",
        dtoFile: "apps/api/src/modules/wallet/dto/wallet-response.dto.ts",
        security: [
          {
            scheme: "bearerAuth",
            scopes: ["read"],
          },
        ],
        pathParams: [
          {
            name: "userId",
            type: "string",
            required: true,
            description: "Internal OFFER-HUB user ID (prefix usr_).",
          },
        ],
        responses: [
          {
            status: 200,
            label: "OK",
            body: '{\n  "data": {\n    "provider": "crypto",\n    "method": "stellar_address",\n    "address": "GCV24WNJYXPG3QFNP6ZQMLVEMHQX5S6J2OWKGVF5U3XC6HF4QQHG7WMD",\n    "asset": {\n      "code": "USDC",\n      "issuer": "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5"\n    },\n    "network": "testnet",\n    "instructions": "Send USDC to this Stellar address. Deposits are detected automatically within seconds."\n  }\n}',
            schema: {
              name: "DepositInfoResponse",
              type: "object",
              properties: {
                data: {
                  type: "object",
                  properties: {
                    provider: {
                      type: "string",
                      enum: ["crypto"],
                    },
                    method: {
                      type: "string",
                      enum: ["stellar_address"],
                    },
                    address: {
                      type: "string",
                    },
                    asset: {
                      type: "object",
                      properties: {
                        code: {
                          type: "string",
                        },
                        issuer: {
                          type: "string",
                        },
                      },
                    },
                    network: {
                      type: "string",
                      enum: ["testnet", "mainnet"],
                    },
                    instructions: {
                      type: "string",
                    },
                  },
                },
              },
            },
          },
        ],
        errors: [
          {
            status: 401,
            code: "UNAUTHORIZED",
            when: "Missing or invalid API key.",
          },
          {
            status: 403,
            code: "INSUFFICIENT_SCOPE",
            when: "API key lacks read scope.",
          },
          {
            status: 404,
            code: "WALLET_NOT_FOUND",
            when: "No active primary wallet.",
          },
        ],
      },
      {
        method: "GET",
        path: "/api/v1/users/{userId}/wallet/transactions",
        title: "Transaction history",
        description:
          "Returns recent USDC/XLM activity for the user's wallet, read from the Stellar Horizon API, filtered to payment and create_account operations.",
        controllerFile: "apps/api/src/modules/wallet/wallet.controller.ts",
        controllerHandler: "getTransactions",
        dtoFile: "apps/api/src/modules/wallet/dto/wallet-response.dto.ts",
        security: [
          {
            scheme: "bearerAuth",
            scopes: ["read"],
          },
        ],
        pathParams: [
          {
            name: "userId",
            type: "string",
            required: true,
            description: "Internal OFFER-HUB user ID (prefix usr_).",
          },
        ],
        queryParams: [
          {
            name: "limit",
            type: "number",
            required: false,
            description:
              "Number of transactions to return, capped at 100, default 20.",
          },
        ],
        responses: [
          {
            status: 200,
            label: "OK",
            body: '{\n  "data": [\n    {\n      "id": "3574536253440001",\n      "type": "payment",\n      "from": "GSENDER...",\n      "to": "GABCDEF...",\n      "amount": "50.0000000",\n      "asset": "USDC:GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",\n      "createdAt": "2026-09-24T09:58:00Z",\n      "hash": "a1b2c3d4e5f6",\n      "successful": true\n    }\n  ]\n}',
            schema: {
              name: "WalletTransactionsResponse",
              type: "object",
              properties: {
                data: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: {
                        type: "string",
                      },
                      type: {
                        type: "string",
                        enum: ["payment", "create_account", "change_trust"],
                      },
                      from: {
                        type: "string",
                      },
                      to: {
                        type: "string",
                      },
                      amount: {
                        type: "string",
                      },
                      asset: {
                        type: "string",
                      },
                      createdAt: {
                        type: "string",
                      },
                      hash: {
                        type: "string",
                      },
                      successful: {
                        type: "boolean",
                      },
                    },
                  },
                },
              },
            },
          },
        ],
        errors: [
          {
            status: 401,
            code: "UNAUTHORIZED",
            when: "Missing or invalid API key.",
          },
          {
            status: 403,
            code: "INSUFFICIENT_SCOPE",
            when: "API key lacks read scope.",
          },
          {
            status: 404,
            code: "WALLET_NOT_FOUND",
            when: "No active primary wallet.",
          },
        ],
      },
      {
        method: "POST",
        path: "/api/v1/topups",
        title: "Create top-up",
        description:
          "Creates an AirTM pay-in for the authenticated user and returns a confirmationUri to redirect the user to. User is resolved from the auth context, not the body.",
        controllerFile: "apps/api/src/modules/topups/topups.controller.ts",
        controllerHandler: "createTopUp",
        dtoFile: "apps/api/src/modules/topups/dto/create-topup.dto.ts",
        security: [
          {
            scheme: "bearerAuth",
            scopes: ["write"],
          },
        ],
        requestBody: {
          contentType: "application/json",
          example:
            '{\n  "amount": "100.00",\n  "currency": "USD",\n  "description": "Wallet top-up"\n}',
          schema: {
            name: "CreateTopUpRequest",
            type: "object",
            required: ["amount"],
            properties: {
              amount: {
                type: "string",
                description:
                  "Decimal string with exactly 2 decimals, regex ^\\d+\\.\\d{2}$.",
              },
              currency: {
                type: "string",
                default: "USD",
              },
              description: {
                type: "string",
                nullable: true,
              },
            },
          },
        },
        responses: [
          {
            status: 201,
            label: "Created",
            body: '{\n  "data": {\n    "id": "topup_jKL3mN0PqR4sT5uV6wX7yZ",\n    "amount": "100.00",\n    "currency": "USD",\n    "status": "TOPUP_AWAITING_USER_CONFIRMATION",\n    "confirmationUri": "https://app.airtm.com/payin/abc123...",\n    "expiresAt": "2026-09-25T10:00:00.000Z",\n    "createdAt": "2026-09-24T10:00:00.000Z"\n  },\n  "meta": {\n    "timestamp": "2026-09-24T10:00:00.000Z"\n  }\n}',
            schema: {
              name: "CreateTopUpResponse",
              type: "object",
              properties: {
                data: {
                  type: "object",
                  properties: {
                    id: {
                      type: "string",
                    },
                    amount: {
                      type: "string",
                    },
                    currency: {
                      type: "string",
                    },
                    status: {
                      type: "string",
                      enum: [
                        "TOPUP_CREATED",
                        "TOPUP_AWAITING_USER_CONFIRMATION",
                        "TOPUP_PROCESSING",
                        "TOPUP_SUCCEEDED",
                        "TOPUP_FAILED",
                        "TOPUP_CANCELED",
                      ],
                    },
                    confirmationUri: {
                      type: "string",
                    },
                    expiresAt: {
                      type: "string",
                      nullable: true,
                    },
                    createdAt: {
                      type: "string",
                    },
                  },
                },
                meta: {
                  type: "object",
                },
              },
            },
          },
        ],
        errors: [
          {
            status: 400,
            code: "VALIDATION_ERROR",
            when: "amount does not match the decimal format.",
          },
          {
            status: 401,
            code: "UNAUTHORIZED",
            when: "Missing or invalid API key.",
          },
          {
            status: 403,
            code: "INSUFFICIENT_SCOPE",
            when: "API key lacks write scope.",
          },
          {
            status: 404,
            code: "USER_NOT_FOUND",
            when: "Authenticated user does not exist.",
          },
          {
            status: 422,
            code: "AIRTM_USER_NOT_LINKED",
            when: "User has no linked AirTM account.",
          },
          {
            status: 422,
            code: "AIRTM_USER_INVALID",
            when: "AirTM eligibility check failed.",
          },
          {
            status: 409,
            code: "IDEMPOTENCY_KEY_REUSED",
            when: "Same key used with a different body.",
          },
          {
            status: 502,
            code: "PROVIDER_ERROR",
            when: "AirTM pay-in creation failed.",
          },
          {
            status: 504,
            code: "PROVIDER_TIMEOUT",
            when: "AirTM timed out.",
          },
        ],
      },
      {
        method: "GET",
        path: "/api/v1/topups",
        title: "List top-ups",
        description:
          "Lists the authenticated user's top-ups, newest first, with cursor pagination.",
        controllerFile: "apps/api/src/modules/topups/topups.controller.ts",
        controllerHandler: "listTopUps",
        security: [
          {
            scheme: "bearerAuth",
            scopes: ["read"],
          },
        ],
        queryParams: [
          {
            name: "limit",
            type: "number",
            required: false,
            description: "Items per page, capped at 100, default 20.",
          },
          {
            name: "cursor",
            type: "string",
            required: false,
            description: "ID of the last top-up from the previous page.",
          },
        ],
        responses: [
          {
            status: 200,
            label: "OK",
            body: '{\n  "data": {\n    "data": [\n      {\n        "id": "topup_jKL3mN0PqR4sT5uV6wX7yZ",\n        "userId": "usr_abc123def456",\n        "amount": "100.00",\n        "currency": "USD",\n        "status": "TOPUP_SUCCEEDED",\n        "airtmPayinId": "payin_2026-01-01x123",\n        "createdAt": "2026-09-24T10:00:00.000Z",\n        "updatedAt": "2026-09-24T10:05:00.000Z"\n      }\n    ],\n    "hasMore": true,\n    "nextCursor": "topup_jKL3mN0PqR4sT5uV6wX7yZ"\n  },\n  "meta": {\n    "timestamp": "2026-09-24T10:05:00.000Z"\n  }\n}',
            schema: {
              name: "ListTopUpsResponse",
              type: "object",
              properties: {
                data: {
                  type: "object",
                  properties: {
                    data: {
                      type: "array",
                      items: {
                        type: "object",
                      },
                    },
                    hasMore: {
                      type: "boolean",
                    },
                    nextCursor: {
                      type: "string",
                      nullable: true,
                    },
                  },
                },
                meta: {
                  type: "object",
                },
              },
            },
          },
        ],
        errors: [
          {
            status: 401,
            code: "UNAUTHORIZED",
            when: "Missing or invalid API key.",
          },
          {
            status: 403,
            code: "INSUFFICIENT_SCOPE",
            when: "API key lacks read scope.",
          },
        ],
      },
      {
        method: "GET",
        path: "/api/v1/topups/{id}",
        title: "Get top-up",
        description: "Returns a single top-up owned by the authenticated user.",
        controllerFile: "apps/api/src/modules/topups/topups.controller.ts",
        controllerHandler: "getTopUp",
        security: [
          {
            scheme: "bearerAuth",
            scopes: ["read"],
          },
        ],
        pathParams: [
          {
            name: "id",
            type: "string",
            required: true,
            description: "Top-up ID (prefix topup_).",
          },
        ],
        responses: [
          {
            status: 200,
            label: "OK",
            body: '{\n  "data": {\n    "id": "topup_jKL3mN0PqR4sT5uV6wX7yZ",\n    "userId": "usr_abc123def456",\n    "amount": "100.00",\n    "currency": "USD",\n    "status": "TOPUP_PROCESSING",\n    "airtmPayinId": "payin_2026-01-01x123",\n    "confirmationUri": "https://app.airtm.com/payin/abc123...",\n    "createdAt": "2026-09-24T10:00:00.000Z",\n    "updatedAt": "2026-09-24T10:03:00.000Z"\n  },\n  "meta": {\n    "timestamp": "2026-09-24T10:03:00.000Z"\n  }\n}',
            schema: {
              name: "TopUpResponse",
              type: "object",
              properties: {
                data: {
                  type: "object",
                  properties: {
                    id: {
                      type: "string",
                    },
                    userId: {
                      type: "string",
                    },
                    amount: {
                      type: "string",
                    },
                    currency: {
                      type: "string",
                    },
                    status: {
                      type: "string",
                      enum: [
                        "TOPUP_CREATED",
                        "TOPUP_AWAITING_USER_CONFIRMATION",
                        "TOPUP_PROCESSING",
                        "TOPUP_SUCCEEDED",
                        "TOPUP_FAILED",
                        "TOPUP_CANCELED",
                      ],
                    },
                    airtmPayinId: {
                      type: "string",
                      nullable: true,
                    },
                    confirmationUri: {
                      type: "string",
                      nullable: true,
                    },
                    failureReason: {
                      type: "string",
                      nullable: true,
                    },
                    createdAt: {
                      type: "string",
                    },
                    updatedAt: {
                      type: "string",
                    },
                  },
                },
                meta: {
                  type: "object",
                },
              },
            },
          },
        ],
        errors: [
          {
            status: 401,
            code: "UNAUTHORIZED",
            when: "Missing or invalid API key.",
          },
          {
            status: 403,
            code: "INSUFFICIENT_SCOPE",
            when: "API key lacks read scope.",
          },
          {
            status: 404,
            code: "TOPUP_NOT_FOUND",
            when: "Top-up does not exist or belongs to another user.",
          },
        ],
      },
      {
        method: "POST",
        path: "/api/v1/topups/{id}/refresh",
        title: "Refresh status from AirTM",
        description:
          "Re-checks the top-up status with AirTM. No-op if already terminal. On transition to TOPUP_SUCCEEDED the user's available balance is credited automatically.",
        controllerFile: "apps/api/src/modules/topups/topups.controller.ts",
        controllerHandler: "refreshTopUp",
        security: [
          {
            scheme: "bearerAuth",
            scopes: ["read"],
          },
        ],
        pathParams: [
          {
            name: "id",
            type: "string",
            required: true,
            description: "Top-up ID (prefix topup_).",
          },
        ],
        responses: [
          {
            status: 200,
            label: "OK",
            body: '{\n  "data": {\n    "id": "topup_jKL3mN0PqR4sT5uV6wX7yZ",\n    "status": "TOPUP_SUCCEEDED",\n    "updatedAt": "2026-09-24T10:07:00.000Z"\n  },\n  "meta": {\n    "timestamp": "2026-09-24T10:07:00.000Z"\n  }\n}',
            schema: {
              name: "RefreshTopUpResponse",
              type: "object",
              properties: {
                data: {
                  type: "object",
                  properties: {
                    id: {
                      type: "string",
                    },
                    status: {
                      type: "string",
                      enum: [
                        "TOPUP_CREATED",
                        "TOPUP_AWAITING_USER_CONFIRMATION",
                        "TOPUP_PROCESSING",
                        "TOPUP_SUCCEEDED",
                        "TOPUP_FAILED",
                        "TOPUP_CANCELED",
                      ],
                    },
                  },
                },
                meta: {
                  type: "object",
                },
              },
            },
          },
        ],
        errors: [
          {
            status: 401,
            code: "UNAUTHORIZED",
            when: "Missing or invalid API key.",
          },
          {
            status: 403,
            code: "INSUFFICIENT_SCOPE",
            when: "API key lacks read scope.",
          },
          {
            status: 404,
            code: "TOPUP_NOT_FOUND",
            when: "Top-up does not exist or belongs to another user.",
          },
          {
            status: 502,
            code: "PROVIDER_ERROR",
            when: "AirTM refresh call failed.",
          },
          {
            status: 504,
            code: "PROVIDER_TIMEOUT",
            when: "AirTM timed out.",
          },
        ],
      },
      {
        method: "POST",
        path: "/api/v1/topups/{id}/cancel",
        title: "Cancel top-up",
        description:
          "Cancels a top-up still awaiting user confirmation; any other state returns 409 INVALID_STATE.",
        controllerFile: "apps/api/src/modules/topups/topups.controller.ts",
        controllerHandler: "cancelTopUp",
        security: [
          {
            scheme: "bearerAuth",
            scopes: ["write"],
          },
        ],
        pathParams: [
          {
            name: "id",
            type: "string",
            required: true,
            description: "Top-up ID (prefix topup_).",
          },
        ],
        responses: [
          {
            status: 200,
            label: "OK",
            body: '{\n  "data": {\n    "id": "topup_jKL3mN0PqR4sT5uV6wX7yZ",\n    "status": "TOPUP_CANCELED",\n    "updatedAt": "2026-09-24T10:10:00.000Z"\n  },\n  "meta": {\n    "timestamp": "2026-09-24T10:10:00.000Z"\n  }\n}',
            schema: {
              name: "CancelTopUpResponse",
              type: "object",
              properties: {
                data: {
                  type: "object",
                  properties: {
                    id: {
                      type: "string",
                    },
                    status: {
                      type: "string",
                      enum: ["TOPUP_CANCELED"],
                    },
                  },
                },
                meta: {
                  type: "object",
                },
              },
            },
          },
        ],
        errors: [
          {
            status: 401,
            code: "UNAUTHORIZED",
            when: "Missing or invalid API key.",
          },
          {
            status: 403,
            code: "INSUFFICIENT_SCOPE",
            when: "API key lacks write scope.",
          },
          {
            status: 404,
            code: "TOPUP_NOT_FOUND",
            when: "Top-up does not exist or belongs to another user.",
          },
          {
            status: 409,
            code: "CANNOT_CANCEL_TOPUP",
            when: "Status is not TOPUP_AWAITING_USER_CONFIRMATION.",
          },
        ],
      },
      {
        method: "GET",
        path: "/api/v1/topups/{id}/callback",
        title: "AirTM callback (public)",
        description:
          "Public endpoint (@Public()), no authentication. The URL AirTM redirects the buyer's browser to after payment confirmation/cancellation. Refreshes status and issues a 302 redirect; never called directly by integrators.",
        controllerFile: "apps/api/src/modules/topups/topups.controller.ts",
        controllerHandler: "handleCallback",
        security: [],
        pathParams: [
          {
            name: "id",
            type: "string",
            required: true,
            description: "Top-up ID (prefix topup_).",
          },
        ],
        queryParams: [
          {
            name: "status",
            type: "string",
            required: false,
            description:
              "Optional status echoed by AirTM; ignored, final status re-read from AirTM.",
          },
          {
            name: "code",
            type: "string",
            required: false,
            description: "Optional code echoed by AirTM; ignored.",
          },
        ],
        responses: [
          {
            status: 302,
            label: "Found",
            body: "",
            description:
              "Redirects to the configured success or cancel return URL.",
          },
        ],
      },
    ],
  },
  {
    name: "Balance",
    description:
      "Atomic ledger balance operations scoped to a user, backed by Prisma transactions and audit logging.",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/users/{userId}/balance",
        title: "Get user balance",
        description:
          "Returns the user's current available and reserved ledger balance. Returns a zero balance object if no balance record exists yet for the user.",
        controllerFile: "apps/api/src/modules/balance/balance.controller.ts",
        controllerHandler: "getBalance",
        security: [
          {
            scheme: "bearerAuth",
            scopes: ["read"],
          },
        ],
        pathParams: [
          {
            name: "userId",
            type: "string",
            required: true,
            description: "Internal user ID.",
          },
        ],
        responses: [
          {
            status: 200,
            label: "Success",
            body: '{\n  "data": {\n    "user_id": "usr_abc123",\n    "available": "1250.00",\n    "reserved": "200.00",\n    "currency": "USD",\n    "total": "1450.00",\n    "updated_at": "2026-02-25T12:00:00.000Z"\n  },\n  "meta": {\n    "requestId": "3f2b8c1e-9d4a-4c7e-8a51-0b6e2d9f7a13",\n    "timestamp": "2026-02-25T12:00:00.412Z"\n  }\n}',
            schema: {
              name: "BalanceResponse",
              type: "object",
              properties: {
                data: {
                  type: "object",
                  required: [
                    "user_id",
                    "available",
                    "reserved",
                    "currency",
                    "total",
                    "updated_at",
                  ],
                  properties: {
                    user_id: {
                      type: "string",
                    },
                    available: {
                      type: "string",
                      format: "decimal",
                      description: "Spendable balance.",
                    },
                    reserved: {
                      type: "string",
                      format: "decimal",
                      description:
                        "Locked for orders reserved but not yet funded into escrow.",
                    },
                    currency: {
                      type: "string",
                    },
                    total: {
                      type: "string",
                      format: "decimal",
                      description: "available + reserved.",
                    },
                    updated_at: {
                      type: "string",
                      format: "date-time",
                    },
                  },
                },
                meta: {
                  type: "object",
                },
              },
            },
          },
        ],
      },
      {
        method: "POST",
        path: "/api/v1/users/{userId}/balance/credit",
        title: "Credit available balance",
        description:
          "Credits funds to the user's available balance (e.g. top-up success, escrow refund). Validated and executed atomically via BalanceService.creditAvailable.",
        controllerFile: "apps/api/src/modules/balance/balance.controller.ts",
        controllerHandler: "creditAvailable",
        dtoFile:
          "apps/api/src/modules/balance/dto/balance-operation.dto.ts (CreditAvailableDto)",
        security: [
          {
            scheme: "bearerAuth",
            scopes: ["write"],
          },
        ],
        pathParams: [
          {
            name: "userId",
            type: "string",
            required: true,
            description: "Internal user ID.",
          },
        ],
        requestBody: {
          contentType: "application/json",
          example:
            '{\n  "amount": "100.00",\n  "currency": "USD",\n  "reference": "topup_01HZY",\n  "description": "Top-up credit"\n}',
          schema: {
            name: "CreditAvailableRequest",
            type: "object",
            required: ["amount"],
            properties: {
              amount: {
                type: "string",
                format: "decimal",
                description:
                  "Decimal string with exactly 2 decimal places (validated by AMOUNT_REGEX).",
              },
              currency: {
                type: "string",
                description: 'Defaults to "USD".',
              },
              reference: {
                type: "string",
                description: "Optional external reference (e.g. top-up ID).",
              },
              description: {
                type: "string",
              },
            },
          },
        },
        responses: [
          {
            status: 200,
            label: "Success",
            body: '{\n  "data": {\n    "success": true,\n    "balance": {\n      "user_id": "usr_abc123",\n      "available": "1350.00",\n      "reserved": "200.00",\n      "currency": "USD",\n      "total": "1550.00",\n      "updated_at": "2026-02-25T12:00:00.000Z"\n    },\n    "operation": "CREDIT_AVAILABLE",\n    "amount": "100.00",\n    "previousBalance": {\n      "available": "1250.00",\n      "reserved": "200.00"\n    },\n    "newBalance": {\n      "available": "1350.00",\n      "reserved": "200.00"\n    },\n    "auditLogId": "aud_01HZY"\n  },\n  "meta": {\n    "requestId": "3f2b8c1e-9d4a-4c7e-8a51-0b6e2d9f7a13",\n    "timestamp": "2026-02-25T12:00:00.412Z"\n  }\n}',
            schema: {
              name: "BalanceOperationResponse",
              type: "object",
              properties: {
                success: {
                  type: "boolean",
                },
                balance: {
                  type: "object",
                  description: "Ref: BalanceResponse",
                },
                operation: {
                  type: "string",
                  enum: [
                    "CREDIT_AVAILABLE",
                    "DEBIT_AVAILABLE",
                    "RESERVE",
                    "RELEASE",
                    "CANCEL_RESERVATION",
                    "DEDUCT_RESERVED",
                  ],
                },
                amount: {
                  type: "string",
                  format: "decimal",
                },
                previousBalance: {
                  type: "object",
                  properties: {
                    available: {
                      type: "string",
                    },
                    reserved: {
                      type: "string",
                    },
                  },
                },
                newBalance: {
                  type: "object",
                  properties: {
                    available: {
                      type: "string",
                    },
                    reserved: {
                      type: "string",
                    },
                  },
                },
                auditLogId: {
                  type: "string",
                },
              },
            },
          },
        ],
        errors: [
          {
            status: 400,
            code: "VALIDATION_ERROR",
            when: "amount is not a decimal string with exactly 2 decimal places (InvalidAmountException).",
          },
          {
            status: 409,
            code: "BALANCE_CONCURRENCY_CONFLICT",
            when: "Concurrent modification of the same user's balance (optimistic locking conflict).",
          },
        ],
      },
      {
        method: "POST",
        path: "/api/v1/users/{userId}/balance/debit",
        title: "Debit available balance",
        description:
          "Debits funds from the user's available balance (e.g. manual deduction, fee collection). Fails if available balance is less than the requested amount.",
        controllerFile: "apps/api/src/modules/balance/balance.controller.ts",
        controllerHandler: "debitAvailable",
        dtoFile:
          "apps/api/src/modules/balance/dto/balance-operation.dto.ts (DebitAvailableDto)",
        security: [
          {
            scheme: "bearerAuth",
            scopes: ["write"],
          },
        ],
        pathParams: [
          {
            name: "userId",
            type: "string",
            required: true,
            description: "Internal user ID.",
          },
        ],
        requestBody: {
          contentType: "application/json",
          example:
            '{\n  "amount": "50.00",\n  "currency": "USD",\n  "reference": "fee_01HZY",\n  "description": "Platform fee"\n}',
          schema: {
            name: "DebitAvailableRequest",
            type: "object",
            required: ["amount"],
            properties: {
              amount: {
                type: "string",
                format: "decimal",
              },
              currency: {
                type: "string",
              },
              reference: {
                type: "string",
              },
              description: {
                type: "string",
              },
            },
          },
        },
        responses: [
          {
            status: 200,
            label: "Success",
            body: '{\n  "data": {\n    "success": true,\n    "balance": {\n      "user_id": "usr_abc123",\n      "available": "1200.00",\n      "reserved": "200.00",\n      "currency": "USD",\n      "total": "1400.00",\n      "updated_at": "2026-02-25T12:00:00.000Z"\n    },\n    "operation": "DEBIT_AVAILABLE",\n    "amount": "50.00",\n    "previousBalance": {\n      "available": "1250.00",\n      "reserved": "200.00"\n    },\n    "newBalance": {\n      "available": "1200.00",\n      "reserved": "200.00"\n    },\n    "auditLogId": "aud_01HZZ"\n  },\n  "meta": {\n    "requestId": "3f2b8c1e-9d4a-4c7e-8a51-0b6e2d9f7a13",\n    "timestamp": "2026-02-25T12:00:00.412Z"\n  }\n}',
            schema: {
              name: "BalanceOperationResponse",
              type: "object",
              properties: {
                note: {
                  type: "string",
                  description:
                    "Same shape as CreditAvailableRequest's response.",
                },
              },
            },
          },
        ],
        errors: [
          {
            status: 400,
            code: "VALIDATION_ERROR",
            when: "Invalid amount format (InvalidAmountException).",
          },
          {
            status: 422,
            code: "INSUFFICIENT_FUNDS",
            when: "available balance < requested amount (InsufficientFundsException).",
          },
          {
            status: 409,
            code: "BALANCE_CONCURRENCY_CONFLICT",
            when: "Concurrent modification conflict (BalanceConcurrencyException).",
          },
        ],
      },
      {
        method: "POST",
        path: "/api/v1/users/{userId}/balance/reserve",
        title: "Reserve funds",
        description:
          "Moves funds from available to reserved balance for a specific order, locking them ahead of escrow funding.",
        controllerFile: "apps/api/src/modules/balance/balance.controller.ts",
        controllerHandler: "reserve",
        dtoFile:
          "apps/api/src/modules/balance/dto/balance-operation.dto.ts (ReserveDto)",
        security: [
          {
            scheme: "bearerAuth",
            scopes: ["write"],
          },
        ],
        pathParams: [
          {
            name: "userId",
            type: "string",
            required: true,
            description: "Internal user ID (buyer).",
          },
        ],
        requestBody: {
          contentType: "application/json",
          example:
            '{\n  "amount": "500.00",\n  "currency": "USD",\n  "orderId": "ord_abc123",\n  "description": "Reserve for order"\n}',
          schema: {
            name: "ReserveRequest",
            type: "object",
            required: ["amount", "orderId"],
            properties: {
              amount: {
                type: "string",
                format: "decimal",
              },
              currency: {
                type: "string",
              },
              orderId: {
                type: "string",
              },
              description: {
                type: "string",
              },
            },
          },
        },
        responses: [
          {
            status: 200,
            label: "Success",
            body: '{\n  "data": {\n    "success": true,\n    "balance": {\n      "user_id": "usr_abc123",\n      "available": "750.00",\n      "reserved": "700.00",\n      "currency": "USD",\n      "total": "1450.00",\n      "updated_at": "2026-02-25T12:00:00.000Z"\n    },\n    "operation": "RESERVE",\n    "amount": "500.00",\n    "previousBalance": {\n      "available": "1250.00",\n      "reserved": "200.00"\n    },\n    "newBalance": {\n      "available": "750.00",\n      "reserved": "700.00"\n    },\n    "auditLogId": "aud_01HZ1"\n  },\n  "meta": {\n    "requestId": "3f2b8c1e-9d4a-4c7e-8a51-0b6e2d9f7a13",\n    "timestamp": "2026-02-25T12:00:00.412Z"\n  }\n}',
            schema: {
              name: "BalanceOperationResponse",
              type: "object",
              properties: {
                note: {
                  type: "string",
                  description:
                    "Same shape as CreditAvailableRequest's response.",
                },
              },
            },
          },
        ],
        errors: [
          {
            status: 400,
            code: "VALIDATION_ERROR",
            when: "Invalid amount format, or orderId missing.",
          },
          {
            status: 422,
            code: "INSUFFICIENT_FUNDS",
            when: "available balance < requested reserve amount.",
          },
          {
            status: 409,
            code: "BALANCE_CONCURRENCY_CONFLICT",
            when: "Concurrent modification conflict.",
          },
        ],
      },
      {
        method: "POST",
        path: "/api/v1/users/{userId}/balance/release",
        title: "Release reserved funds to seller",
        description:
          "Two-party operation: deducts from the buyer's reserved balance and credits the seller's available balance in a single serializable transaction. Writes an audit log entry for both parties.",
        controllerFile: "apps/api/src/modules/balance/balance.controller.ts",
        controllerHandler: "release",
        dtoFile:
          "apps/api/src/modules/balance/dto/balance-operation.dto.ts (ReleaseDto)",
        security: [
          {
            scheme: "bearerAuth",
            scopes: ["write"],
          },
        ],
        pathParams: [
          {
            name: "userId",
            type: "string",
            required: true,
            description:
              "Internal user ID of the buyer whose reserved funds are released.",
          },
        ],
        requestBody: {
          contentType: "application/json",
          example:
            '{\n  "amount": "500.00",\n  "currency": "USD",\n  "orderId": "ord_abc123",\n  "sellerId": "usr_seller456",\n  "description": "Release to seller"\n}',
          schema: {
            name: "ReleaseRequest",
            type: "object",
            required: ["amount", "orderId", "sellerId"],
            properties: {
              amount: {
                type: "string",
                format: "decimal",
              },
              currency: {
                type: "string",
              },
              orderId: {
                type: "string",
              },
              sellerId: {
                type: "string",
                description: "User ID receiving the released funds.",
              },
              description: {
                type: "string",
              },
            },
          },
        },
        responses: [
          {
            status: 200,
            label: "Success",
            body: '{\n  "data": {\n    "success": true,\n    "balance": {\n      "user_id": "usr_seller456",\n      "available": "500.00",\n      "reserved": "0.00",\n      "currency": "USD",\n      "total": "500.00",\n      "updated_at": "2026-02-25T12:00:00.000Z"\n    },\n    "operation": "RELEASE",\n    "amount": "500.00",\n    "previousBalance": {\n      "available": "0.00",\n      "reserved": "0.00"\n    },\n    "newBalance": {\n      "available": "500.00",\n      "reserved": "0.00"\n    },\n    "auditLogId": "aud_01HZ2"\n  },\n  "meta": {\n    "requestId": "3f2b8c1e-9d4a-4c7e-8a51-0b6e2d9f7a13",\n    "timestamp": "2026-02-25T12:00:00.412Z"\n  }\n}',
            schema: {
              name: "BalanceOperationResponse",
              type: "object",
              properties: {
                note: {
                  type: "string",
                  description:
                    "Response balance/operation fields reflect the SELLER's updated balance, not the buyer's.",
                },
              },
            },
          },
        ],
        errors: [
          {
            status: 422,
            code: "INSUFFICIENT_FUNDS",
            when: "buyer's reserved balance < requested amount (InsufficientReservedFundsException, maps to RESERVE_NOT_FOUND code per the orchestrator's error-code constant reuse).",
          },
          {
            status: 400,
            code: "VALIDATION_ERROR",
            when: "Invalid amount format, or sellerId/orderId missing.",
          },
        ],
      },
      {
        method: "POST",
        path: "/api/v1/users/{userId}/balance/cancel-reservation",
        title: "Cancel reservation",
        description:
          "Returns previously reserved funds back to the user's available balance (e.g. order cancelled before escrow funding).",
        controllerFile: "apps/api/src/modules/balance/balance.controller.ts",
        controllerHandler: "cancelReservation",
        dtoFile:
          "apps/api/src/modules/balance/dto/balance-operation.dto.ts (CancelReservationDto)",
        security: [
          {
            scheme: "bearerAuth",
            scopes: ["write"],
          },
        ],
        pathParams: [
          {
            name: "userId",
            type: "string",
            required: true,
            description: "Internal user ID.",
          },
        ],
        requestBody: {
          contentType: "application/json",
          example:
            '{\n  "amount": "500.00",\n  "currency": "USD",\n  "orderId": "ord_abc123",\n  "description": "Order cancelled"\n}',
          schema: {
            name: "CancelReservationRequest",
            type: "object",
            required: ["amount", "orderId"],
            properties: {
              amount: {
                type: "string",
                format: "decimal",
              },
              currency: {
                type: "string",
              },
              orderId: {
                type: "string",
              },
              description: {
                type: "string",
              },
            },
          },
        },
        responses: [
          {
            status: 200,
            label: "Success",
            body: '{\n  "data": {\n    "success": true,\n    "balance": {\n      "user_id": "usr_abc123",\n      "available": "1250.00",\n      "reserved": "200.00",\n      "currency": "USD",\n      "total": "1450.00",\n      "updated_at": "2026-02-25T12:00:00.000Z"\n    },\n    "operation": "CANCEL_RESERVATION",\n    "amount": "500.00",\n    "previousBalance": {\n      "available": "750.00",\n      "reserved": "700.00"\n    },\n    "newBalance": {\n      "available": "1250.00",\n      "reserved": "200.00"\n    },\n    "auditLogId": "aud_01HZ3"\n  },\n  "meta": {\n    "requestId": "3f2b8c1e-9d4a-4c7e-8a51-0b6e2d9f7a13",\n    "timestamp": "2026-02-25T12:00:00.412Z"\n  }\n}',
            schema: {
              name: "BalanceOperationResponse",
              type: "object",
              properties: {
                note: {
                  type: "string",
                  description:
                    "Same shape as CreditAvailableRequest's response.",
                },
              },
            },
          },
        ],
        errors: [
          {
            status: 422,
            code: "INSUFFICIENT_FUNDS",
            when: "reserved balance < requested amount (InsufficientReservedFundsException).",
          },
          {
            status: 400,
            code: "VALIDATION_ERROR",
            when: "Invalid amount format, or orderId missing.",
          },
        ],
      },
      {
        method: "POST",
        path: "/api/v1/users/{userId}/balance/deduct-reserved",
        title: "Deduct from reserved balance",
        description:
          "Removes funds directly from the user's reserved balance without crediting another party (e.g. platform penalty on a disputed reservation).",
        controllerFile: "apps/api/src/modules/balance/balance.controller.ts",
        controllerHandler: "deductReserved",
        dtoFile:
          "apps/api/src/modules/balance/dto/balance-operation.dto.ts (DeductReservedDto)",
        security: [
          {
            scheme: "bearerAuth",
            scopes: ["write"],
          },
        ],
        pathParams: [
          {
            name: "userId",
            type: "string",
            required: true,
            description: "Internal user ID.",
          },
        ],
        requestBody: {
          contentType: "application/json",
          example:
            '{\n  "amount": "100.00",\n  "currency": "USD",\n  "orderId": "ord_abc123",\n  "description": "Dispute penalty"\n}',
          schema: {
            name: "DeductReservedRequest",
            type: "object",
            required: ["amount", "orderId"],
            properties: {
              amount: {
                type: "string",
                format: "decimal",
              },
              currency: {
                type: "string",
              },
              orderId: {
                type: "string",
              },
              description: {
                type: "string",
              },
            },
          },
        },
        responses: [
          {
            status: 200,
            label: "Success",
            body: '{\n  "data": {\n    "success": true,\n    "balance": {\n      "user_id": "usr_abc123",\n      "available": "1250.00",\n      "reserved": "100.00",\n      "currency": "USD",\n      "total": "1350.00",\n      "updated_at": "2026-02-25T12:00:00.000Z"\n    },\n    "operation": "DEDUCT_RESERVED",\n    "amount": "100.00",\n    "previousBalance": {\n      "available": "1250.00",\n      "reserved": "200.00"\n    },\n    "newBalance": {\n      "available": "1250.00",\n      "reserved": "100.00"\n    },\n    "auditLogId": "aud_01HZ4"\n  },\n  "meta": {\n    "requestId": "3f2b8c1e-9d4a-4c7e-8a51-0b6e2d9f7a13",\n    "timestamp": "2026-02-25T12:00:00.412Z"\n  }\n}',
            schema: {
              name: "BalanceOperationResponse",
              type: "object",
              properties: {
                note: {
                  type: "string",
                  description:
                    "Same shape as CreditAvailableRequest's response.",
                },
              },
            },
          },
        ],
        errors: [
          {
            status: 422,
            code: "INSUFFICIENT_FUNDS",
            when: "reserved balance < requested amount (InsufficientReservedFundsException).",
          },
          {
            status: 400,
            code: "VALIDATION_ERROR",
            when: "Invalid amount format, or orderId missing.",
          },
        ],
      },
      {
        method: "POST",
        path: "/api/v1/users/{userId}/balance/sync",
        title: "Sync balance with provider",
        description:
          "Compares the local ledger balance against the active payment provider (Stellar Horizon for crypto, AirTM otherwise) and flags any discrepancy found. Writes a BALANCE_SYNC audit log entry.",
        controllerFile: "apps/api/src/modules/balance/balance.controller.ts",
        controllerHandler: "syncBalance",
        security: [
          {
            scheme: "bearerAuth",
            scopes: ["write"],
          },
        ],
        pathParams: [
          {
            name: "userId",
            type: "string",
            required: true,
            description: "Internal user ID.",
          },
        ],
        responses: [
          {
            status: 200,
            label: "Success",
            body: '{\n  "data": {\n    "synced": true,\n    "localBalance": "1250.00",\n    "providerBalance": "1250.00",\n    "discrepancy": "0.00",\n    "action": "none"\n  },\n  "meta": {\n    "requestId": "3f2b8c1e-9d4a-4c7e-8a51-0b6e2d9f7a13",\n    "timestamp": "2026-02-25T12:00:00.412Z"\n  }\n}',
            schema: {
              name: "SyncResult",
              type: "object",
              properties: {
                synced: {
                  type: "boolean",
                },
                localBalance: {
                  type: "string",
                  format: "decimal",
                },
                providerBalance: {
                  type: "string",
                },
                discrepancy: {
                  type: "string",
                },
                action: {
                  type: "string",
                  enum: ["none", "adjusted", "flagged"],
                },
              },
            },
          },
        ],
        errors: [
          {
            status: 404,
            code: "USER_NOT_FOUND",
            when: "User does not exist.",
          },
        ],
      },
      {
        method: "GET",
        path: "/api/v1/users/{userId}/balance/verify",
        title: "Verify balance with provider",
        description:
          "Returns the local balance plus a providerVerified flag, after running the same provider-sync check as the sync endpoint. Throws if a significant (> $1.00) discrepancy is detected against the payment provider.",
        controllerFile: "apps/api/src/modules/balance/balance.controller.ts",
        controllerHandler: "verifyBalance",
        security: [
          {
            scheme: "bearerAuth",
            scopes: ["read"],
          },
        ],
        pathParams: [
          {
            name: "userId",
            type: "string",
            required: true,
            description: "Internal user ID.",
          },
        ],
        responses: [
          {
            status: 200,
            label: "Success",
            body: '{\n  "data": {\n    "user_id": "usr_abc123",\n    "available": "1250.00",\n    "reserved": "200.00",\n    "currency": "USD",\n    "total": "1450.00",\n    "updated_at": "2026-02-25T12:00:00.000Z",\n    "providerVerified": true\n  },\n  "meta": {\n    "requestId": "3f2b8c1e-9d4a-4c7e-8a51-0b6e2d9f7a13",\n    "timestamp": "2026-02-25T12:00:00.412Z"\n  }\n}',
            schema: {
              name: "BalanceVerifiedResponse",
              type: "object",
              properties: {
                user_id: {
                  type: "string",
                },
                available: {
                  type: "string",
                },
                reserved: {
                  type: "string",
                },
                currency: {
                  type: "string",
                },
                total: {
                  type: "string",
                },
                updated_at: {
                  type: "string",
                  format: "date-time",
                },
                providerVerified: {
                  type: "boolean",
                  description:
                    "true only when synced and no discrepancy action was needed.",
                },
              },
            },
          },
        ],
        errors: [
          {
            status: 404,
            code: "USER_NOT_FOUND",
            when: "User does not exist.",
          },
          {
            status: 409,
            code: "BALANCE_DISCREPANCY",
            when: "Local vs. provider balance differ by more than $1.00 (BalanceDiscrepancyException — not in the global 40+ catalog in errors.mdx, confirmed directly in apps/api/src/modules/balance/exceptions/balance.exceptions.ts).",
          },
        ],
      },
    ],
  },
  {
    name: "Withdrawals",
    description:
      "Payout operations from a user's ledger balance to a bank account, crypto address, or AirTM balance, via AirTM payouts or direct Stellar transfers.",
    endpoints: [
      {
        method: "POST",
        path: "/api/v1/withdrawals",
        title: "Create withdrawal",
        description:
          'Creates a withdrawal. For destinationType "crypto" it executes a synchronous Stellar USDC transfer and completes immediately; for "bank"/"airtm_balance" it reserves funds and creates an asynchronous AirTM payout (two-step unless commit=true). userId is a required body field, not a path parameter — this is a server-to-server API where the caller\'s API key does not identify the acting user.',
        controllerFile:
          "apps/api/src/modules/withdrawals/withdrawals.controller.ts",
        controllerHandler: "createWithdrawal",
        dtoFile:
          "apps/api/src/modules/withdrawals/dto/create-withdrawal.dto.ts",
        security: [
          {
            scheme: "bearerAuth",
            scopes: ["write"],
          },
        ],
        requestBody: {
          contentType: "application/json",
          example:
            '{\n  "userId": "usr_abc123",\n  "amount": "100.00",\n  "currency": "USD",\n  "destinationType": "crypto",\n  "destinationRef": "GBCG42WTVWPO4Q6N...",\n  "commit": false,\n  "description": "Monthly payout"\n}',
          schema: {
            name: "CreateWithdrawalRequest",
            type: "object",
            required: ["userId", "amount", "destinationType", "destinationRef"],
            properties: {
              userId: {
                type: "string",
                description: "Internal user ID performing the withdrawal.",
              },
              amount: {
                type: "string",
                format: "decimal",
                description: "Decimal string with exactly 2 decimal places.",
              },
              currency: {
                type: "string",
                description:
                  'Defaults to "USD"; currently the only supported value.',
              },
              destinationType: {
                type: "string",
                enum: ["bank", "crypto", "airtm_balance"],
              },
              destinationRef: {
                type: "string",
                description:
                  "Bank account ID, Stellar address, or AirTM balance ref depending on destinationType.",
              },
              commit: {
                type: "boolean",
                description:
                  "If true, create and commit in one step. Defaults to false (two-step).",
              },
              description: {
                type: "string",
              },
            },
          },
        },
        responses: [
          {
            status: 201,
            label: "Created",
            body: '{\n  "data": {\n    "id": "wd_01HZY",\n    "amount": "100.00",\n    "currency": "USD",\n    "status": "WITHDRAWAL_CREATED",\n    "destinationType": "crypto",\n    "committed": true,\n    "createdAt": "2026-02-25T12:00:00.000Z"\n  },\n  "meta": {\n    "requestId": "3f2b8c1e-9d4a-4c7e-8a51-0b6e2d9f7a13",\n    "timestamp": "2026-02-25T12:00:00.412Z"\n  }\n}',
            schema: {
              name: "CreateWithdrawalResponse",
              type: "object",
              properties: {
                data: {
                  type: "object",
                  required: [
                    "id",
                    "amount",
                    "currency",
                    "status",
                    "destinationType",
                    "committed",
                    "createdAt",
                  ],
                  properties: {
                    id: {
                      type: "string",
                    },
                    amount: {
                      type: "string",
                      format: "decimal",
                    },
                    fee: {
                      type: "string",
                      nullable: true,
                    },
                    currency: {
                      type: "string",
                    },
                    status: {
                      type: "string",
                      enum: [
                        "WITHDRAWAL_CREATED",
                        "WITHDRAWAL_PENDING",
                        "WITHDRAWAL_COMMITTED",
                        "WITHDRAWAL_COMPLETED",
                        "WITHDRAWAL_FAILED",
                      ],
                    },
                    destinationType: {
                      type: "string",
                      enum: ["bank", "crypto", "airtm_balance"],
                    },
                    committed: {
                      type: "boolean",
                    },
                    createdAt: {
                      type: "string",
                      format: "date-time",
                    },
                  },
                },
                meta: {
                  type: "object",
                },
              },
            },
          },
        ],
        errors: [
          {
            status: 400,
            code: "VALIDATION_ERROR",
            when: "destinationType not one of bank/crypto/airtm_balance, amount not 2-decimal string, or a required field is missing.",
          },
          {
            status: 404,
            code: "USER_NOT_FOUND",
            when: "userId does not exist.",
          },
          {
            status: 422,
            code: "INSUFFICIENT_FUNDS",
            when: "available balance < requested amount.",
          },
          {
            status: 422,
            code: "AIRTM_USER_NOT_LINKED",
            when: "destinationType is bank/airtm_balance and the user has no linked Airtm account.",
          },
          {
            status: 422,
            code: "AIRTM_USER_INVALID",
            when: "The linked Airtm account fails the eligibility check (KYC/active status).",
          },
          {
            status: 502,
            code: "WITHDRAWAL_FAILED",
            when: "The Stellar transfer (crypto path) or Airtm payout creation throws; the reservation/debit is rolled back and the withdrawal is marked WITHDRAWAL_FAILED.",
          },
        ],
      },
      {
        method: "GET",
        path: "/api/v1/withdrawals",
        title: "List withdrawals",
        description:
          "Lists withdrawals for a user, newest first, with cursor pagination.",
        controllerFile:
          "apps/api/src/modules/withdrawals/withdrawals.controller.ts",
        controllerHandler: "listWithdrawals",
        security: [
          {
            scheme: "bearerAuth",
            scopes: ["read"],
          },
        ],
        queryParams: [
          {
            name: "userId",
            type: "string",
            required: true,
            description: "User whose withdrawals to list.",
          },
          {
            name: "limit",
            type: "number",
            required: false,
            description: "Items per page. Default 20, capped at 100.",
          },
          {
            name: "cursor",
            type: "string",
            required: false,
            description:
              "The nextCursor value from the previous page; omit for the first page.",
          },
        ],
        responses: [
          {
            status: 200,
            label: "Success",
            body: '{\n  "data": {\n    "data": [\n      {\n        "id": "wd_01HZY",\n        "userId": "usr_abc123",\n        "amount": "100.00",\n        "currency": "USD",\n        "status": "WITHDRAWAL_COMPLETED",\n        "destinationType": "crypto",\n        "destinationRef": "GBCG42WTVWPO4Q6N...",\n        "createdAt": "2026-02-25T12:00:00.000Z",\n        "updatedAt": "2026-02-25T12:05:00.000Z"\n      }\n    ],\n    "hasMore": false\n  },\n  "meta": {\n    "requestId": "3f2b8c1e-9d4a-4c7e-8a51-0b6e2d9f7a13",\n    "timestamp": "2026-02-25T12:00:00.412Z"\n  }\n}',
            schema: {
              name: "WithdrawalListResponse",
              type: "object",
              properties: {
                data: {
                  type: "object",
                  properties: {
                    data: {
                      type: "array",
                      items: {
                        type: "object",
                        description: "Ref: WithdrawalResponse",
                      },
                    },
                    hasMore: {
                      type: "boolean",
                    },
                    nextCursor: {
                      type: "string",
                      nullable: true,
                    },
                  },
                },
                meta: {
                  type: "object",
                },
              },
            },
          },
        ],
        errors: [
          {
            status: 400,
            code: "VALIDATION_ERROR",
            when: "userId query param missing.",
          },
        ],
      },
      {
        method: "GET",
        path: "/api/v1/withdrawals/{id}",
        title: "Get withdrawal",
        description:
          "Returns a single withdrawal's status and details, scoped to the owning user.",
        controllerFile:
          "apps/api/src/modules/withdrawals/withdrawals.controller.ts",
        controllerHandler: "getWithdrawal",
        security: [
          {
            scheme: "bearerAuth",
            scopes: ["read"],
          },
        ],
        pathParams: [
          {
            name: "id",
            type: "string",
            required: true,
            description: "Withdrawal ID.",
          },
        ],
        queryParams: [
          {
            name: "userId",
            type: "string",
            required: true,
            description:
              "Owning user ID — the lookup is scoped to (id, userId) together.",
          },
        ],
        responses: [
          {
            status: 200,
            label: "Success",
            body: '{\n  "data": {\n    "id": "wd_01HZY",\n    "userId": "usr_abc123",\n    "amount": "100.00",\n    "currency": "USD",\n    "status": "WITHDRAWAL_COMPLETED",\n    "destinationType": "crypto",\n    "destinationRef": "GBCG42WTVWPO4Q6N...",\n    "createdAt": "2026-02-25T12:00:00.000Z",\n    "updatedAt": "2026-02-25T12:05:00.000Z"\n  },\n  "meta": {\n    "requestId": "3f2b8c1e-9d4a-4c7e-8a51-0b6e2d9f7a13",\n    "timestamp": "2026-02-25T12:00:00.412Z"\n  }\n}',
            schema: {
              name: "WithdrawalResponse",
              type: "object",
              required: [
                "id",
                "userId",
                "amount",
                "currency",
                "status",
                "destinationType",
                "destinationRef",
                "createdAt",
                "updatedAt",
              ],
              properties: {
                id: {
                  type: "string",
                },
                userId: {
                  type: "string",
                },
                amount: {
                  type: "string",
                  format: "decimal",
                },
                fee: {
                  type: "string",
                  nullable: true,
                  description:
                    "Not currently persisted in the schema; always omitted today.",
                },
                currency: {
                  type: "string",
                },
                status: {
                  type: "string",
                  enum: [
                    "WITHDRAWAL_CREATED",
                    "WITHDRAWAL_PENDING",
                    "WITHDRAWAL_COMMITTED",
                    "WITHDRAWAL_COMPLETED",
                    "WITHDRAWAL_FAILED",
                  ],
                },
                destinationType: {
                  type: "string",
                  enum: ["bank", "crypto", "airtm_balance"],
                },
                destinationRef: {
                  type: "string",
                },
                airtmPayoutId: {
                  type: "string",
                  nullable: true,
                },
                failureReason: {
                  type: "string",
                  nullable: true,
                  description:
                    "Not currently persisted in the schema; always omitted today.",
                },
                createdAt: {
                  type: "string",
                  format: "date-time",
                },
                updatedAt: {
                  type: "string",
                  format: "date-time",
                },
              },
            },
          },
        ],
        errors: [
          {
            status: 404,
            code: "WITHDRAWAL_NOT_FOUND",
            when: "No withdrawal matches that id for that userId.",
          },
        ],
      },
      {
        method: "POST",
        path: "/api/v1/withdrawals/{id}/commit",
        title: "Commit withdrawal",
        description:
          "Commits a withdrawal that was created in two-step mode (commit=false). Only valid while the withdrawal is still in a committable status; commits the associated Airtm payout and returns the refreshed withdrawal.",
        controllerFile:
          "apps/api/src/modules/withdrawals/withdrawals.controller.ts",
        controllerHandler: "commitWithdrawal",
        security: [
          {
            scheme: "bearerAuth",
            scopes: ["write"],
          },
        ],
        pathParams: [
          {
            name: "id",
            type: "string",
            required: true,
            description: "Withdrawal ID.",
          },
        ],
        queryParams: [
          {
            name: "userId",
            type: "string",
            required: true,
            description: "Owning user ID.",
          },
        ],
        responses: [
          {
            status: 200,
            label: "Success",
            body: '{\n  "data": {\n    "id": "wd_01HZY",\n    "userId": "usr_abc123",\n    "amount": "100.00",\n    "currency": "USD",\n    "status": "WITHDRAWAL_COMMITTED",\n    "destinationType": "bank",\n    "destinationRef": "bank_acct_01",\n    "createdAt": "2026-02-25T12:00:00.000Z",\n    "updatedAt": "2026-02-25T12:06:00.000Z"\n  },\n  "meta": {\n    "requestId": "3f2b8c1e-9d4a-4c7e-8a51-0b6e2d9f7a13",\n    "timestamp": "2026-02-25T12:00:00.412Z"\n  }\n}',
            schema: {
              name: "WithdrawalResponse",
              type: "object",
              properties: {
                note: {
                  type: "string",
                  description: "Same shape as Get Withdrawal's response.",
                },
              },
            },
          },
        ],
        errors: [
          {
            status: 404,
            code: "WITHDRAWAL_NOT_FOUND",
            when: "No withdrawal matches that id for that userId.",
          },
          {
            status: 409,
            code: "WITHDRAWAL_NOT_COMMITTABLE",
            when: "Withdrawal is not in a status that allows commit (canCommitPayout returns false).",
          },
          {
            status: 422,
            code: "PROVIDER_ERROR",
            when: "Withdrawal has no associated Airtm payout to commit.",
          },
        ],
      },
      {
        method: "POST",
        path: "/api/v1/withdrawals/{id}/refresh",
        title: "Refresh withdrawal status from Airtm",
        description:
          "Re-fetches the withdrawal's payout status from Airtm and applies the state transition locally if the orchestrator's WithdrawalStateMachine allows it. Use when a status-change webhook may have been missed. If the withdrawal has no Airtm payout yet, returns its current state unchanged.",
        controllerFile:
          "apps/api/src/modules/withdrawals/withdrawals.controller.ts",
        controllerHandler: "refreshWithdrawal",
        security: [
          {
            scheme: "bearerAuth",
            scopes: ["read"],
          },
        ],
        pathParams: [
          {
            name: "id",
            type: "string",
            required: true,
            description: "Withdrawal ID.",
          },
        ],
        queryParams: [
          {
            name: "userId",
            type: "string",
            required: true,
            description: "Owning user ID.",
          },
        ],
        responses: [
          {
            status: 200,
            label: "Success",
            body: '{\n  "data": {\n    "id": "wd_01HZY",\n    "userId": "usr_abc123",\n    "amount": "100.00",\n    "currency": "USD",\n    "status": "WITHDRAWAL_COMPLETED",\n    "destinationType": "bank",\n    "destinationRef": "bank_acct_01",\n    "airtmPayoutId": "pay_01HZY",\n    "createdAt": "2026-02-25T12:00:00.000Z",\n    "updatedAt": "2026-02-25T12:07:00.000Z"\n  },\n  "meta": {\n    "requestId": "3f2b8c1e-9d4a-4c7e-8a51-0b6e2d9f7a13",\n    "timestamp": "2026-02-25T12:00:00.412Z"\n  }\n}',
            schema: {
              name: "WithdrawalResponse",
              type: "object",
              properties: {
                note: {
                  type: "string",
                  description: "Same shape as Get Withdrawal's response.",
                },
              },
            },
          },
        ],
        errors: [
          {
            status: 404,
            code: "WITHDRAWAL_NOT_FOUND",
            when: "No withdrawal matches that id for that userId.",
          },
        ],
      },
    ],
  },
  {
    name: "Audit Logs",
    description:
      "Query the marketplace audit trail with filters and cursor pagination. Requires the support scope.",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/audit/logs",
        title: "List audit logs",
        description:
          "Returns audit entries for the caller's marketplace, ordered by occurredAt descending then id descending. Cursor-paginated; the controller fetches limit+1 rows to compute hasMore. payloadBefore/payloadAfter are redacted (sensitive keys replaced with ***REDACTED***) by RedactionService before storage.",
        controllerFile: "apps/api/src/modules/audit-logs/audit.controller.ts",
        controllerHandler: "getLogs",
        dtoFile: "apps/api/src/modules/audit-logs/dto/query-audit-logs.dto.ts",
        security: [
          {
            scheme: "bearerAuth",
            scopes: ["support"],
          },
        ],
        queryParams: [
          {
            name: "resourceType",
            type: "string",
            required: false,
            description:
              "Filter by resource type, e.g. dispute, order, withdrawal",
          },
          {
            name: "resourceId",
            type: "string",
            required: false,
            description: "Filter to one resource instance",
          },
          {
            name: "action",
            type: "select",
            required: false,
            description: "Action performed on the resource",
            options: ["CREATE", "UPDATE", "DELETE"],
          },
          {
            name: "userId",
            type: "string",
            required: false,
            description: "Filter by the acting user",
          },
          {
            name: "from",
            type: "string",
            required: false,
            description:
              "ISO date string; include entries at/after this time (occurredAt >= from); ignored if unparseable",
          },
          {
            name: "to",
            type: "string",
            required: false,
            description:
              "ISO date string; include entries at/before this time (occurredAt <= to); ignored if unparseable",
          },
          {
            name: "limit",
            type: "number",
            required: false,
            description:
              "Page size; default 20, capped at 100 (@IsInt @Min(1) @Max(100) — over 100 returns 400, unlike other list endpoints which just clamp)",
          },
          {
            name: "cursor",
            type: "string",
            required: false,
            description:
              "Audit log id from pagination.nextCursor of the previous page",
          },
        ],
        responses: [
          {
            status: 200,
            label: "Success",
            body: '{\n  "data": {\n    "data": [\n      {\n        "id": "aud_01JABCDEF",\n        "occurredAt": "2026-02-04T12:00:00.000Z",\n        "action": "DISPUTE_RESOLVED",\n        "resourceType": "dispute",\n        "resourceId": "dsp_01JABCDEF",\n        "payloadBefore": {\n          "status": "UNDER_REVIEW"\n        },\n        "payloadAfter": {\n          "status": "RESOLVED",\n          "decision": "SPLIT",\n          "releaseAmount": "60.00",\n          "refundAmount": "40.00",\n          "note": "Partial work completed"\n        },\n        "actorType": "SYSTEM",\n        "actorId": null,\n        "result": "SUCCESS",\n        "correlationId": "550e8400-e29b-41d4-a716-446655440002"\n      }\n    ],\n    "pagination": {\n      "hasMore": true,\n      "nextCursor": "aud_01JABCDEF"\n    }\n  },\n  "meta": {\n    "requestId": "3f2b8c1e-9d4a-4c7e-8a51-0b6e2d9f7a13",\n    "timestamp": "2026-02-25T12:00:00.412Z"\n  }\n}',
            schema: {
              name: "ListAuditLogsResponse",
              type: "object",
              properties: {
                data: {
                  type: "object",
                  properties: {
                    data: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: {
                            type: "string",
                          },
                          occurredAt: {
                            type: "string",
                            format: "date-time",
                          },
                          action: {
                            type: "string",
                          },
                          resourceType: {
                            type: "string",
                          },
                          resourceId: {
                            type: "string",
                          },
                          payloadBefore: {
                            type: "object",
                            nullable: true,
                          },
                          payloadAfter: {
                            type: "object",
                            nullable: true,
                          },
                          actorType: {
                            type: "string",
                            nullable: true,
                            enum: ["USER", "SYSTEM", "WEBHOOK"],
                          },
                          actorId: {
                            type: "string",
                            nullable: true,
                          },
                          result: {
                            type: "string",
                            nullable: true,
                            enum: ["SUCCESS", "FAILURE"],
                          },
                          correlationId: {
                            type: "string",
                            nullable: true,
                          },
                        },
                      },
                    },
                    pagination: {
                      type: "object",
                      properties: {
                        hasMore: {
                          type: "boolean",
                        },
                        nextCursor: {
                          type: "string",
                        },
                      },
                    },
                  },
                },
                meta: {
                  type: "object",
                  properties: {
                    requestId: {
                      type: "string",
                    },
                    timestamp: {
                      type: "string",
                      format: "date-time",
                    },
                  },
                },
              },
            },
          },
        ],
        errors: [
          {
            status: 400,
            code: "VALIDATION_ERROR",
            when: "Query fails DTO validation, e.g. limit=0, limit=101, action=PATCH",
          },
          {
            status: 401,
            code: "UNAUTHORIZED",
            when: "Missing or invalid API key",
          },
          {
            status: 403,
            code: "INSUFFICIENT_SCOPE",
            when: "API key lacks the support scope",
          },
        ],
      },
    ],
  },
  {
    name: "Events",
    description: "Real-time domain event stream over Server-Sent Events (SSE).",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/events",
        title: "Subscribe to the event stream",
        description:
          "Server-Sent Events stream of domain events (DomainEvent envelope: eventId, eventType, occurredAt, aggregateId, aggregateType, payload, metadata), scoped to the marketplace bound to the caller's API key. Sends a 'ping' heartbeat every 30 seconds. Supports reconnection via the Last-Event-ID header (exclusive replay from Redis, capped at the last 1000 events) or the since query param. This is NOT a JSON response — it is a text/event-stream, unlike every other endpoint in this API.",
        controllerFile: "apps/api/src/modules/events/events.controller.ts",
        controllerHandler: "streamEvents",
        security: [
          {
            scheme: "bearerAuth",
          },
        ],
        queryParams: [
          {
            name: "types",
            type: "string",
            required: false,
            description:
              "Repeatable. Exact event type(s) to include (e.g. order.created). Exact match only — wildcards like order.* are not valid on this public stream.",
          },
          {
            name: "resources",
            type: "string",
            required: false,
            description:
              "Repeatable. Exact aggregate type(s) to include (e.g. Order, Balance).",
          },
          {
            name: "since",
            type: "string",
            required: false,
            description:
              "ISO 8601 timestamp. Replays buffered events after this time when no Last-Event-ID header is supplied; the header takes precedence over this param.",
          },
        ],
        responses: [
          {
            status: 200,
            label: "SSE stream (text/event-stream)",
            body: 'id: 2026-02-18T17:37:12.000Z\nevent: order.escrow_funded\ndata: {"eventId":"evt_abc123","eventType":"order.escrow_funded","occurredAt":"2026-02-18T17:37:12.000Z","aggregateId":"ord_abc123","aggregateType":"Order","payload":{"orderId":"ord_abc123","escrowId":"esc_abc123","trustlessContractId":"CTW...","amount":"100.00","fundedAt":"2026-02-18T17:37:12.000Z"},"metadata":{}}',
            contentType: "text/event-stream",
            schema: {
              name: "DomainEventStreamMessage",
              type: "string",
              description:
                "Not JSON — a raw SSE wire message. Each message's 'data' line is JSON matching the DomainEvent<T> shape: {eventId, eventType, occurredAt, aggregateId, aggregateType, payload, metadata}. A heartbeat 'ping' event (no eventId) is sent every 30s and should be ignored as a domain event.",
            },
          },
        ],
        errors: [
          {
            status: 401,
            code: "UNAUTHORIZED",
            when: "Missing or invalid API key",
          },
        ],
      },
    ],
  },
  {
    name: "Webhooks",
    description:
      "Inbound webhook receivers that external providers (AirTM, Trustless Work) call to notify the Orchestrator. Not an outbound subscription API — integrators use the SSE event stream instead.",
    endpoints: [
      {
        method: "POST",
        path: "/api/v1/webhooks/airtm",
        title: "Receive AirTM webhook",
        description:
          "Receives pay-in (topup.*) and pay-out (withdrawal.*) status updates from AirTM. Signature verification runs first (Svix headers + AIRTM_WEBHOOK_SECRET); an invalid signature is rejected with 401 before any processing. Duplicate deliveries (same provider+eventId) are acknowledged and skipped. Responses are always 200 after a valid signature, even for business-logic failures, to avoid provider retry storms.",
        controllerFile: "apps/api/src/modules/webhooks/webhooks.controller.ts",
        controllerHandler: "handleAirtmWebhook",
        dtoFile: "apps/api/src/providers/airtm/types/airtm.types.ts",
        security: [
          {
            scheme: "none",
          },
        ],
        requestBody: {
          contentType: "application/json",
          example:
            '{\n  "eventId": "evt_8yumeOFwqPnSbhvemqJ",\n  "eventType": "payin.succeeded",\n  "occurredAt": "2026-02-20T14:30:00.000Z",\n  "data": {\n    "id": "payin_789",\n    "code": "PX-1001",\n    "amount": 50,\n    "currency": "USD",\n    "status": "SUCCEEDED",\n    "reasonCode": null,\n    "reasonDescription": null\n  }\n}',
          schema: {
            name: "AirtmWebhookPayload",
            type: "object",
            required: ["eventId", "eventType", "occurredAt", "data"],
            properties: {
              eventId: {
                type: "string",
                description: "Unique event ID from AirTM",
              },
              eventType: {
                type: "string",
                enum: [
                  "payin.created",
                  "payin.awaiting_user_confirmation",
                  "payin.processing",
                  "payin.succeeded",
                  "payin.failed",
                  "payin.canceled",
                  "payout.created",
                  "payout.committed",
                  "payout.pending",
                  "payout.pending_user_action",
                  "payout.completed",
                  "payout.failed",
                  "payout.canceled",
                ],
              },
              occurredAt: {
                type: "string",
                format: "date-time",
              },
              data: {
                type: "object",
                description:
                  "The affected pay-in/pay-out; data.id maps the event to a topup/withdrawal",
                properties: {
                  id: {
                    type: "string",
                  },
                  code: {
                    type: "string",
                  },
                  amount: {
                    type: "number",
                  },
                  currency: {
                    type: "string",
                  },
                  status: {
                    type: "string",
                  },
                  reasonCode: {
                    type: "string",
                    nullable: true,
                  },
                  reasonDescription: {
                    type: "string",
                    nullable: true,
                  },
                },
              },
            },
          },
        },
        responses: [
          {
            status: 200,
            label: "Processed for the first time",
            body: '{\n  "data": {\n    "status": "ok",\n    "processed": true\n  },\n  "meta": {\n    "requestId": "3f2b8c1e-9d4a-4c7e-8a51-0b6e2d9f7a13",\n    "timestamp": "2026-02-25T12:00:00.412Z"\n  }\n}',
            schema: {
              name: "AirtmWebhookResponse",
              type: "object",
              properties: {
                data: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                    },
                    processed: {
                      type: "boolean",
                    },
                    duplicate: {
                      type: "boolean",
                    },
                  },
                },
                meta: {
                  type: "object",
                },
              },
            },
          },
          {
            status: 200,
            label: "Duplicate delivery",
            body: '{\n  "data": {\n    "status": "ok",\n    "duplicate": true\n  },\n  "meta": {\n    "requestId": "3f2b8c1e-9d4a-4c7e-8a51-0b6e2d9f7a13",\n    "timestamp": "2026-02-25T12:00:00.412Z"\n  }\n}',
          },
          {
            status: 200,
            label:
              "Valid signature, business failure (e.g. related top-up not found)",
            body: '{\n  "data": {\n    "status": "ok",\n    "processed": false\n  },\n  "meta": {\n    "requestId": "3f2b8c1e-9d4a-4c7e-8a51-0b6e2d9f7a13",\n    "timestamp": "2026-02-25T12:00:00.412Z"\n  }\n}',
          },
        ],
        errors: [
          {
            status: 401,
            code: "WEBHOOK_SIGNATURE_INVALID",
            when: "Invalid or missing Svix signature headers (the AirTM page's own response table just says 'standard error envelope' without naming a code; this is the matching global catalog code per errors.mdx, which explicitly covers 'inbound Svix or HMAC signature failed cryptographic verification')",
          },
        ],
      },
      {
        method: "POST",
        path: "/api/v1/webhooks/trustless-work",
        title: "Receive Trustless Work webhook",
        description:
          "Receives escrow lifecycle events from Trustless Work (escrow.created, escrow.funding_started, escrow.funded, escrow.milestone_completed, escrow.released, escrow.refunded, escrow.disputed) and flips the escrow/order state machines, re-emitting the corresponding domain events on the SSE stream. Events carrying a transaction_hash are verified against the Stellar network before the state change is applied.",
        controllerFile: "apps/api/src/modules/webhooks/webhooks.controller.ts",
        controllerHandler: "handleTrustlessWorkWebhook",
        dtoFile: "apps/api/src/providers/trustless-work/dto/webhook.dto.ts",
        security: [
          {
            scheme: "none",
          },
        ],
        requestBody: {
          contentType: "application/json",
          example:
            '{\n  "type": "escrow.funded",\n  "event_id": "evt_trustless_123",\n  "data": {\n    "contract_id": "CTW4Q6N...",\n    "order_id": "ord_abc123",\n    "status": "FUNDED",\n    "amount": "500000000",\n    "currency": "USDC",\n    "buyer_address": "GBCG42WTVWPO4Q6N...",\n    "seller_address": "GBRTW2CXBA7ZQBCN...",\n    "transaction_hash": "abcdef0123...",\n    "milestone_ref": "M1",\n    "created_at": "2026-02-20T12:00:00.000Z",\n    "updated_at": "2026-02-20T12:05:00.000Z"\n  }\n}',
          schema: {
            name: "TrustlessWebhookEvent",
            type: "object",
            required: ["type", "event_id", "data"],
            properties: {
              type: {
                type: "string",
                enum: [
                  "escrow.created",
                  "escrow.funding_started",
                  "escrow.funded",
                  "escrow.milestone_completed",
                  "escrow.released",
                  "escrow.refunded",
                  "escrow.disputed",
                ],
              },
              event_id: {
                type: "string",
              },
              data: {
                type: "object",
                description:
                  "amount is expressed in stroops; contract_id is the Stellar escrow contract address matched to trustlessContractId",
                properties: {
                  contract_id: {
                    type: "string",
                  },
                  order_id: {
                    type: "string",
                  },
                  status: {
                    type: "string",
                  },
                  amount: {
                    type: "string",
                  },
                  currency: {
                    type: "string",
                  },
                  buyer_address: {
                    type: "string",
                  },
                  seller_address: {
                    type: "string",
                  },
                  transaction_hash: {
                    type: "string",
                  },
                  milestone_ref: {
                    type: "string",
                  },
                  created_at: {
                    type: "string",
                    format: "date-time",
                  },
                  updated_at: {
                    type: "string",
                    format: "date-time",
                  },
                },
              },
            },
          },
        },
        responses: [
          {
            status: 200,
            label: "Processed for the first time",
            body: '{\n  "data": {\n    "status": "ok",\n    "processed": true\n  },\n  "meta": {\n    "requestId": "3f2b8c1e-9d4a-4c7e-8a51-0b6e2d9f7a13",\n    "timestamp": "2026-02-25T12:00:00.412Z"\n  }\n}',
            schema: {
              name: "TrustlessWorkWebhookResponse",
              type: "object",
              properties: {
                data: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                    },
                    processed: {
                      type: "boolean",
                    },
                  },
                },
                meta: {
                  type: "object",
                },
              },
            },
          },
          {
            status: 200,
            label:
              "Duplicate delivery (not re-applied; still reports processed: true)",
            body: '{\n  "data": {\n    "status": "ok",\n    "processed": true\n  },\n  "meta": {\n    "requestId": "3f2b8c1e-9d4a-4c7e-8a51-0b6e2d9f7a13",\n    "timestamp": "2026-02-25T12:00:00.412Z"\n  }\n}',
          },
        ],
        errors: [
          {
            status: 401,
            code: "WEBHOOK_SIGNATURE_INVALID",
            when: "x-tw-signature header present but does not match HMAC-SHA256(rawBody, TRUSTLESS_WEBHOOK_SECRET)",
          },
        ],
      },
    ],
  },
];
