// -----------------------------------------------------------------------------
// API Schema: real endpoint definitions for the OFFER-HUB Orchestrator API
// -----------------------------------------------------------------------------
//
// Source of truth: apps/api/src/modules/*/*.controller.ts and their DTOs in the
// orchestrator repo (https://github.com/OFFER-HUB/OFFER-HUB).
//
// This file, plus scripts/generate-openapi.ts, is the sole source for the
// generated public/openapi.json: see scripts/README.md.
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

export interface SchemaProperty {
  type: "string" | "number" | "boolean" | "object" | "array";
  description?: string;
  format?: string;
  enum?: string[];
  nullable?: boolean;
  default?: unknown;
  items?: SchemaProperty;
  properties?: Record<string, SchemaProperty>;
  required?: string[];
}

export interface JsonSchema {
  name: string;
  type: "object" | "string" | "array";
  description?: string;
  required?: string[];
  properties?: Record<string, SchemaProperty>;
  items?: SchemaProperty;
}

export interface RequestBody {
  contentType: string;
  example: string;
  schema?: JsonSchema;
}

export interface MockResponse {
  status: number;
  label: string;
  body: string;
  contentType?: string;
  schema?: JsonSchema;
  description?: string;
}

export interface SecurityRequirement {
  scheme: "apiKeyAuth" | "userSessionAuth" | "none";
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
  headerParams?: Parameter[];
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

export const API_SCHEMA: EndpointCategory[] = [
  {
    name: "Auth",
    description: "API keys, user registration, wallet challenges, sessions, and OAuth authentication.",
    endpoints: [
      {
        method: "POST",
        path: "/api/v1/auth/api-keys",
        title: "Create API key",
        description: "Generates a new long-lived API key scoped to specific operations. Requires support scope.",
        controllerFile: "apps/api/src/modules/auth/auth.controller.ts",
        controllerHandler: "createApiKey",
        security: [
          {
            scheme: "apiKeyAuth",
            scopes: [
              "support"
            ]
          }
        ],
        requestBody: {
          contentType: "application/json",
          example: "{\n  \"name\": \"Marketplace backend\",\n  \"scopes\": [\n    \"read\",\n    \"write\"\n  ]\n}",
          schema: {
            name: "CreateApiKeyRequest",
            type: "object",
            required: [
              "name",
              "scopes"
            ],
            properties: {
              name: {
                type: "string",
                description: "Human-readable label for the key"
              },
              scopes: {
                type: "array",
                items: {
                  type: "string",
                  enum: [
                    "read",
                    "write",
                    "support"
                  ]
                },
                description: "Array of permission scopes"
              }
            }
          }
        },
        responses: [
          {
            status: 201,
            label: "API key created",
            body: "{\n  \"data\": {\n    \"id\": \"key_0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d\",\n    \"key\": \"ohk_live_key_0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d_9f2c1a7e5b3d8f6041c2a9e7b5d3f1a0\",\n    \"name\": \"Marketplace backend\",\n    \"scopes\": [\n      \"read\",\n      \"write\"\n    ],\n    \"createdAt\": \"2026-02-18T10:00:00.000Z\"\n  },\n  \"meta\": {\n    \"requestId\": \"req_9f2c1a7e5b3d8f6041c2a9e7b5d3f1a0\",\n    \"timestamp\": \"2026-02-18T10:00:00.000Z\"\n  }\n}",
            schema: {
              name: "CreateApiKeyResponse",
              type: "object",
              required: [
                "data",
                "meta"
              ],
              properties: {
                data: {
                  type: "object",
                  required: [
                    "id",
                    "key",
                    "name",
                    "scopes",
                    "createdAt"
                  ],
                  properties: {
                    id: {
                      type: "string"
                    },
                    key: {
                      type: "string"
                    },
                    name: {
                      type: "string"
                    },
                    scopes: {
                      type: "array",
                      items: {
                        type: "string"
                      }
                    },
                    createdAt: {
                      type: "string",
                      format: "date-time"
                    }
                  }
                },
                meta: {
                  type: "object",
                  required: [
                    "timestamp"
                  ],
                  properties: {
                    requestId: {
                      type: "string"
                    },
                    timestamp: {
                      type: "string"
                    }
                  }
                }
              }
            }
          }
        ],
        errors: [
          {
            status: 401,
            code: "UNAUTHORIZED",
            when: "Missing or invalid authorization header"
          },
          {
            status: 403,
            code: "INSUFFICIENT_SCOPE",
            when: "API key lacks support scope"
          },
          {
            status: 429,
            code: "RATE_LIMITED",
            when: "Rate limit exceeded"
          }
        ]
      },
      {
        method: "GET",
        path: "/api/v1/auth/api-keys",
        title: "List API keys",
        description: "Lists all active API keys. Secret values are masked. Requires support scope.",
        controllerFile: "apps/api/src/modules/auth/auth.controller.ts",
        controllerHandler: "listApiKeys",
        security: [
          {
            scheme: "apiKeyAuth",
            scopes: [
              "support"
            ]
          }
        ],
        queryParams: [
          {
            name: "limit",
            type: "number",
            required: false,
            description: "Maximum number of keys to return (1-100)"
          },
          {
            name: "cursor",
            type: "string",
            required: false,
            description: "Pagination cursor"
          }
        ],
        responses: [
          {
            status: 200,
            label: "API keys listed",
            body: "{\n  \"data\": {\n    \"data\": [\n      {\n        \"id\": \"key_0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d\",\n        \"name\": \"Marketplace backend\",\n        \"scopes\": [\n          \"read\",\n          \"write\"\n        ],\n        \"createdAt\": \"2026-02-18T10:00:00.000Z\"\n      }\n    ],\n    \"pagination\": {\n      \"hasMore\": false,\n      \"nextCursor\": null\n    }\n  },\n  \"meta\": {\n    \"requestId\": \"req_9f2c1a7e5b3d8f6041c2a9e7b5d3f1a0\",\n    \"timestamp\": \"2026-02-18T10:00:00.000Z\"\n  }\n}",
            schema: {
              name: "ListApiKeysResponse",
              type: "object",
              required: [
                "data"
              ],
              properties: {
                data: {
                  type: "object",
                  required: [
                    "data",
                    "pagination"
                  ],
                  properties: {
                    data: {
                      type: "array",
                      items: {
                        type: "object",
                        required: [
                          "id",
                          "name",
                          "scopes",
                          "createdAt"
                        ],
                        properties: {
                          id: {
                            type: "string"
                          },
                          name: {
                            type: "string"
                          },
                          scopes: {
                            type: "array",
                            items: {
                              type: "string"
                            }
                          },
                          createdAt: {
                            type: "string",
                            format: "date-time"
                          }
                        }
                      }
                    },
                    pagination: {
                      type: "object",
                      required: [
                        "hasMore"
                      ],
                      properties: {
                        hasMore: {
                          type: "boolean"
                        },
                        nextCursor: {
                          type: "string",
                          nullable: true
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        ],
        errors: [
          {
            status: 401,
            code: "UNAUTHORIZED",
            when: "Missing or invalid authorization header"
          },
          {
            status: 403,
            code: "INSUFFICIENT_SCOPE",
            when: "API key lacks support scope"
          }
        ]
      },
      {
        method: "POST",
        path: "/api/v1/auth/api-keys/{id}/token",
        title: "Generate short-lived token",
        description: "Exchanges a long-lived API key (ohk_live_...) for a 1-hour token (ohk_tok_...). Requires write scope.",
        controllerFile: "apps/api/src/modules/auth/auth.controller.ts",
        controllerHandler: "generateToken",
        security: [
          {
            scheme: "apiKeyAuth",
            scopes: [
              "write"
            ]
          }
        ],
        pathParams: [
          {
            name: "id",
            type: "string",
            required: true,
            description: "API key ID (key_...)"
          }
        ],
        responses: [
          {
            status: 201,
            label: "Token generated",
            body: "{\n  \"data\": {\n    \"token\": \"ohk_tok_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJrZXlfMGE...\",\n    \"expiresIn\": 3600,\n    \"tokenType\": \"Bearer\"\n  },\n  \"meta\": {\n    \"requestId\": \"req_9f2c1a7e5b3d8f6041c2a9e7b5d3f1a0\",\n    \"timestamp\": \"2026-02-18T10:00:00.000Z\"\n  }\n}",
            schema: {
              name: "GenerateTokenResponse",
              type: "object",
              required: [
                "data"
              ],
              properties: {
                data: {
                  type: "object",
                  required: [
                    "token",
                    "expiresIn",
                    "tokenType"
                  ],
                  properties: {
                    token: {
                      type: "string"
                    },
                    expiresIn: {
                      type: "number"
                    },
                    tokenType: {
                      type: "string"
                    }
                  }
                }
              }
            }
          }
        ],
        errors: [
          {
            status: 401,
            code: "UNAUTHORIZED",
            when: "Missing or invalid authorization header"
          },
          {
            status: 403,
            code: "INSUFFICIENT_SCOPE",
            when: "API key lacks write scope"
          },
          {
            status: 404,
            code: "NOT_FOUND",
            when: "API key not found"
          }
        ]
      },
      {
        method: "GET",
        path: "/api/v1/auth/me",
        title: "Current auth context",
        description: "Inspects the authenticated API key or token context.",
        controllerFile: "apps/api/src/modules/auth/auth.controller.ts",
        controllerHandler: "getMe",
        security: [
          {
            scheme: "apiKeyAuth",
            scopes: []
          }
        ],
        responses: [
          {
            status: 200,
            label: "Auth context returned",
            body: "{\n  \"data\": {\n    \"id\": \"key_0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d\",\n    \"name\": \"Marketplace backend\",\n    \"scopes\": [\n      \"read\",\n      \"write\"\n    ],\n    \"marketplaceId\": \"mkt_1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d\"\n  }\n}",
            schema: {
              name: "AuthMeResponse",
              type: "object",
              required: [
                "data"
              ],
              properties: {
                data: {
                  type: "object",
                  required: [
                    "id",
                    "name",
                    "scopes"
                  ],
                  properties: {
                    id: {
                      type: "string"
                    },
                    name: {
                      type: "string"
                    },
                    scopes: {
                      type: "array",
                      items: {
                        type: "string"
                      }
                    },
                    marketplaceId: {
                      type: "string"
                    }
                  }
                }
              }
            }
          }
        ],
        errors: [
          {
            status: 401,
            code: "UNAUTHORIZED",
            when: "Missing or invalid credential"
          }
        ]
      },
      {
        method: "POST",
        path: "/api/v1/auth/register",
        title: "Register user",
        description: "Public registration endpoint for end-users using email and password. Returns a 7-day session JWT.",
        controllerFile: "apps/api/src/modules/auth/auth.controller.ts",
        controllerHandler: "register",
        security: [
          {
            scheme: "none"
          }
        ],
        requestBody: {
          contentType: "application/json",
          example: "{\n  \"email\": \"user@example.com\",\n  \"password\": \"StrongPassword123!\",\n  \"type\": \"BUYER\"\n}",
          schema: {
            name: "RegisterUserRequest",
            type: "object",
            required: [
              "email",
              "password"
            ],
            properties: {
              email: {
                type: "string",
                format: "email"
              },
              password: {
                type: "string"
              },
              type: {
                type: "string",
                enum: [
                  "BUYER",
                  "SELLER",
                  "BOTH"
                ]
              }
            }
          }
        },
        responses: [
          {
            status: 201,
            label: "User registered",
            body: "{\n  \"data\": {\n    \"user\": {\n      \"id\": \"usr_9f2c1a7e5b3d8f6041c2a9e7b5d3f1a0\",\n      \"email\": \"user@example.com\",\n      \"type\": \"BUYER\",\n      \"status\": \"ACTIVE\"\n    },\n    \"token\": \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3Jf...\",\n    \"expiresIn\": 604800\n  }\n}",
            schema: {
              name: "RegisterUserResponse",
              type: "object",
              required: [
                "data"
              ],
              properties: {
                data: {
                  type: "object",
                  required: [
                    "user",
                    "token",
                    "expiresIn"
                  ],
                  properties: {
                    user: {
                      type: "object",
                      required: [
                        "id",
                        "email",
                        "type",
                        "status"
                      ],
                      properties: {
                        id: {
                          type: "string"
                        },
                        email: {
                          type: "string"
                        },
                        type: {
                          type: "string"
                        },
                        status: {
                          type: "string"
                        }
                      }
                    },
                    token: {
                      type: "string"
                    },
                    expiresIn: {
                      type: "number"
                    }
                  }
                }
              }
            }
          }
        ],
        errors: [
          {
            status: 400,
            code: "VALIDATION_ERROR",
            when: "Invalid email or password format"
          },
          {
            status: 409,
            code: "USER_ALREADY_EXISTS",
            when: "User with email already registered"
          }
        ]
      },
      {
        method: "POST",
        path: "/api/v1/auth/login",
        title: "Login user",
        description: "Public login endpoint for end-users using email and password. Returns a 7-day session JWT.",
        controllerFile: "apps/api/src/modules/auth/auth.controller.ts",
        controllerHandler: "login",
        security: [
          {
            scheme: "none"
          }
        ],
        requestBody: {
          contentType: "application/json",
          example: "{\n  \"email\": \"user@example.com\",\n  \"password\": \"StrongPassword123!\"\n}",
          schema: {
            name: "LoginRequest",
            type: "object",
            required: [
              "email",
              "password"
            ],
            properties: {
              email: {
                type: "string",
                format: "email"
              },
              password: {
                type: "string"
              }
            }
          }
        },
        responses: [
          {
            status: 200,
            label: "Login successful",
            body: "{\n  \"data\": {\n    \"user\": {\n      \"id\": \"usr_9f2c1a7e5b3d8f6041c2a9e7b5d3f1a0\",\n      \"email\": \"user@example.com\",\n      \"type\": \"BUYER\"\n    },\n    \"token\": \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3Jf...\",\n    \"expiresIn\": 604800\n  }\n}",
            schema: {
              name: "LoginResponse",
              type: "object",
              required: [
                "data"
              ],
              properties: {
                data: {
                  type: "object",
                  required: [
                    "user",
                    "token",
                    "expiresIn"
                  ],
                  properties: {
                    user: {
                      type: "object",
                      required: [
                        "id",
                        "email",
                        "type"
                      ],
                      properties: {
                        id: {
                          type: "string"
                        },
                        email: {
                          type: "string"
                        },
                        type: {
                          type: "string"
                        }
                      }
                    },
                    token: {
                      type: "string"
                    },
                    expiresIn: {
                      type: "number"
                    }
                  }
                }
              }
            }
          }
        ],
        errors: [
          {
            status: 400,
            code: "VALIDATION_ERROR",
            when: "Invalid email or password payload"
          },
          {
            status: 401,
            code: "UNAUTHORIZED",
            when: "Invalid email or password credentials"
          },
          {
            status: 403,
            code: "USER_INACTIVE",
            when: "User account is suspended or inactive"
          }
        ]
      },
      {
        method: "POST",
        path: "/api/v1/auth/forgot-password",
        title: "Forgot password",
        description: "Public endpoint to request password reset instructions by email.",
        controllerFile: "apps/api/src/modules/auth/auth.controller.ts",
        controllerHandler: "forgotPassword",
        security: [
          {
            scheme: "none"
          }
        ],
        requestBody: {
          contentType: "application/json",
          example: "{\n  \"email\": \"user@example.com\"\n}",
          schema: {
            name: "ForgotPasswordRequest",
            type: "object",
            required: [
              "email"
            ],
            properties: {
              email: {
                type: "string",
                format: "email"
              }
            }
          }
        },
        responses: [
          {
            status: 200,
            label: "Instructions dispatched",
            body: "{\n  \"data\": {\n    \"success\": true,\n    \"message\": \"Password reset instructions sent if email exists\"\n  }\n}"
          }
        ],
        errors: [
          {
            status: 400,
            code: "VALIDATION_ERROR",
            when: "Invalid email address"
          },
          {
            status: 429,
            code: "RATE_LIMITED",
            when: "Too many reset attempts"
          }
        ]
      },
      {
        method: "POST",
        path: "/api/v1/auth/reset-password",
        title: "Reset password",
        description: "Public endpoint to complete a password reset using a reset token.",
        controllerFile: "apps/api/src/modules/auth/auth.controller.ts",
        controllerHandler: "resetPassword",
        security: [
          {
            scheme: "none"
          }
        ],
        requestBody: {
          contentType: "application/json",
          example: "{\n  \"token\": \"tok_reset_1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d\",\n  \"newPassword\": \"NewStrongPassword123!\"\n}",
          schema: {
            name: "ResetPasswordRequest",
            type: "object",
            required: [
              "token",
              "newPassword"
            ],
            properties: {
              token: {
                type: "string"
              },
              newPassword: {
                type: "string"
              }
            }
          }
        },
        responses: [
          {
            status: 200,
            label: "Password reset",
            body: "{\n  \"data\": {\n    \"success\": true,\n    \"message\": \"Password has been successfully reset\"\n  }\n}"
          }
        ],
        errors: [
          {
            status: 400,
            code: "VALIDATION_ERROR",
            when: "Invalid token or password requirements not met"
          },
          {
            status: 401,
            code: "TOKEN_EXPIRED",
            when: "Reset token has expired or is invalid"
          }
        ]
      },
      {
        method: "GET",
        path: "/api/v1/auth/verify-email",
        title: "Verify email",
        description: "Public endpoint to verify email address using token sent in confirmation link.",
        controllerFile: "apps/api/src/modules/auth/auth.controller.ts",
        controllerHandler: "verifyEmail",
        security: [
          {
            scheme: "none"
          }
        ],
        queryParams: [
          {
            name: "token",
            type: "string",
            required: true,
            description: "Email verification token"
          }
        ],
        responses: [
          {
            status: 200,
            label: "Email verified",
            body: "{\n  \"data\": {\n    \"success\": true,\n    \"message\": \"Email verified successfully\"\n  }\n}"
          }
        ],
        errors: [
          {
            status: 400,
            code: "VALIDATION_ERROR",
            when: "Missing or malformed token"
          },
          {
            status: 401,
            code: "TOKEN_EXPIRED",
            when: "Verification token expired or invalid"
          }
        ]
      },
      {
        method: "POST",
        path: "/api/v1/auth/wallet/challenge",
        title: "Request wallet auth challenge",
        description: "Public endpoint to generate an authentication challenge for a Stellar public key.",
        controllerFile: "apps/api/src/modules/auth/auth.controller.ts",
        controllerHandler: "walletChallenge",
        security: [
          {
            scheme: "none"
          }
        ],
        requestBody: {
          contentType: "application/json",
          example: "{\n  \"publicKey\": \"GABCMX76J6XFMH67QJ5J4K2VXZ4QW6A6Y...\"\n}",
          schema: {
            name: "WalletChallengeRequest",
            type: "object",
            required: [
              "publicKey"
            ],
            properties: {
              publicKey: {
                type: "string",
                description: "Stellar public address (G...)"
              }
            }
          }
        },
        responses: [
          {
            status: 200,
            label: "Challenge issued",
            body: "{\n  \"data\": {\n    \"nonce\": \"ch_1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d\",\n    \"message\": \"Sign this message to authenticate with OFFER-HUB: nonce=ch_1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d\"\n  }\n}",
            schema: {
              name: "WalletChallengeResponse",
              type: "object",
              required: [
                "data"
              ],
              properties: {
                data: {
                  type: "object",
                  required: [
                    "nonce",
                    "message"
                  ],
                  properties: {
                    nonce: {
                      type: "string"
                    },
                    message: {
                      type: "string"
                    }
                  }
                }
              }
            }
          }
        ],
        errors: [
          {
            status: 400,
            code: "VALIDATION_ERROR",
            when: "Invalid Stellar public key format"
          }
        ]
      },
      {
        method: "POST",
        path: "/api/v1/auth/wallet/verify",
        title: "Verify wallet challenge",
        description: "Public endpoint to verify signed challenge and issue a 7-day user session JWT.",
        controllerFile: "apps/api/src/modules/auth/auth.controller.ts",
        controllerHandler: "walletVerify",
        security: [
          {
            scheme: "none"
          }
        ],
        requestBody: {
          contentType: "application/json",
          example: "{\n  \"publicKey\": \"GABCMX76J6XFMH67QJ5J4K2VXZ4QW6A6Y...\",\n  \"signedChallenge\": \"AAAA...\"\n}",
          schema: {
            name: "WalletVerifyRequest",
            type: "object",
            required: [
              "publicKey",
              "signedChallenge"
            ],
            properties: {
              publicKey: {
                type: "string"
              },
              signedChallenge: {
                type: "string"
              }
            }
          }
        },
        responses: [
          {
            status: 200,
            label: "Wallet verified",
            body: "{\n  \"data\": {\n    \"user\": {\n      \"id\": \"usr_9f2c1a7e5b3d8f6041c2a9e7b5d3f1a0\",\n      \"stellarAddress\": \"GABCMX76J6XFMH67QJ5J4K2VXZ4QW6A6Y...\",\n      \"type\": \"BUYER\"\n    },\n    \"token\": \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3Jf...\",\n    \"expiresIn\": 604800\n  }\n}",
            schema: {
              name: "WalletVerifyResponse",
              type: "object",
              required: [
                "data"
              ],
              properties: {
                data: {
                  type: "object",
                  required: [
                    "user",
                    "token",
                    "expiresIn"
                  ],
                  properties: {
                    user: {
                      type: "object"
                    },
                    token: {
                      type: "string"
                    },
                    expiresIn: {
                      type: "number"
                    }
                  }
                }
              }
            }
          }
        ],
        errors: [
          {
            status: 400,
            code: "VALIDATION_ERROR",
            when: "Invalid signature or address"
          },
          {
            status: 401,
            code: "UNAUTHORIZED",
            when: "Cryptographic signature verification failed"
          }
        ]
      },
      {
        method: "POST",
        path: "/api/v1/auth/oauth/callback",
        title: "OAuth callback",
        description: "Public OAuth exchange endpoint. Converts authorization code into a 7-day user session JWT.",
        controllerFile: "apps/api/src/modules/auth/auth.controller.ts",
        controllerHandler: "oauthCallback",
        security: [
          {
            scheme: "none"
          }
        ],
        requestBody: {
          contentType: "application/json",
          example: "{\n  \"provider\": \"google\",\n  \"code\": \"4/0AX4XfWh...\",\n  \"state\": \"xyz123\"\n}",
          schema: {
            name: "OAuthCallbackRequest",
            type: "object",
            required: [
              "provider",
              "code"
            ],
            properties: {
              provider: {
                type: "string",
                enum: [
                  "google",
                  "github"
                ]
              },
              code: {
                type: "string"
              },
              state: {
                type: "string"
              }
            }
          }
        },
        responses: [
          {
            status: 200,
            label: "OAuth exchange successful",
            body: "{\n  \"data\": {\n    \"user\": {\n      \"id\": \"usr_9f2c1a7e5b3d8f6041c2a9e7b5d3f1a0\",\n      \"email\": \"user@example.com\"\n    },\n    \"token\": \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3Jf...\",\n    \"expiresIn\": 604800\n  }\n}"
          }
        ],
        errors: [
          {
            status: 400,
            code: "VALIDATION_ERROR",
            when: "Unsupported provider or missing code"
          },
          {
            status: 401,
            code: "UNAUTHORIZED",
            when: "OAuth provider rejected authorization code"
          }
        ]
      },
      {
        method: "GET",
        path: "/api/v1/auth/oauth/check-email",
        title: "Check OAuth email",
        description: "Checks whether an email address is already bound to an OAuth provider.",
        controllerFile: "apps/api/src/modules/auth/auth.controller.ts",
        controllerHandler: "checkOAuthEmail",
        security: [
          {
            scheme: "none"
          }
        ],
        queryParams: [
          {
            name: "email",
            type: "string",
            required: true,
            description: "Email address to check"
          }
        ],
        responses: [
          {
            status: 200,
            label: "Check completed",
            body: "{\n  \"data\": {\n    \"exists\": true,\n    \"provider\": \"google\"\n  }\n}"
          }
        ],
        errors: [
          {
            status: 400,
            code: "VALIDATION_ERROR",
            when: "Invalid email address format"
          }
        ]
      },
      {
        method: "POST",
        path: "/api/v1/auth/send-verification",
        title: "Send verification email",
        description: "Dispatches a new email verification link to the authenticated user.",
        controllerFile: "apps/api/src/modules/auth/auth.controller.ts",
        controllerHandler: "sendVerification",
        security: [
          {
            scheme: "userSessionAuth"
          }
        ],
        responses: [
          {
            status: 200,
            label: "Verification link sent",
            body: "{\n  \"data\": {\n    \"success\": true,\n    \"message\": \"Verification email sent\"\n  }\n}"
          }
        ],
        errors: [
          {
            status: 401,
            code: "UNAUTHORIZED",
            when: "Session JWT is missing or expired"
          },
          {
            status: 429,
            code: "RATE_LIMITED",
            when: "Too many verification requests"
          }
        ]
      },
      {
        method: "POST",
        path: "/api/v1/auth/change-password",
        title: "Change password",
        description: "Updates password for currently authenticated user session.",
        controllerFile: "apps/api/src/modules/auth/auth.controller.ts",
        controllerHandler: "changePassword",
        security: [
          {
            scheme: "userSessionAuth"
          }
        ],
        requestBody: {
          contentType: "application/json",
          example: "{\n  \"currentPassword\": \"OldPassword123!\",\n  \"newPassword\": \"NewStrongPassword123!\"\n}",
          schema: {
            name: "ChangePasswordRequest",
            type: "object",
            required: [
              "currentPassword",
              "newPassword"
            ],
            properties: {
              currentPassword: {
                type: "string"
              },
              newPassword: {
                type: "string"
              }
            }
          }
        },
        responses: [
          {
            status: 200,
            label: "Password changed",
            body: "{\n  \"data\": {\n    \"success\": true,\n    \"message\": \"Password changed successfully\"\n  }\n}"
          }
        ],
        errors: [
          {
            status: 400,
            code: "VALIDATION_ERROR",
            when: "New password requirements not met"
          },
          {
            status: 401,
            code: "UNAUTHORIZED",
            when: "Current password is incorrect"
          }
        ]
      },
      {
        method: "GET",
        path: "/api/v1/auth/sessions",
        title: "List active sessions",
        description: "Lists all active login sessions for authenticated user.",
        controllerFile: "apps/api/src/modules/auth/auth.controller.ts",
        controllerHandler: "listSessions",
        security: [
          {
            scheme: "userSessionAuth"
          }
        ],
        responses: [
          {
            status: 200,
            label: "Sessions listed",
            body: "{\n  \"data\": [\n    {\n      \"id\": \"sess_1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d\",\n      \"device\": \"Chrome on macOS\",\n      \"ip\": \"192.0.2.1\",\n      \"isCurrent\": true,\n      \"createdAt\": \"2026-02-18T12:00:00.000Z\",\n      \"expiresAt\": \"2026-02-25T12:00:00.000Z\"\n    }\n  ]\n}"
          }
        ],
        errors: [
          {
            status: 401,
            code: "UNAUTHORIZED",
            when: "Missing or expired user session JWT"
          }
        ]
      },
      {
        method: "DELETE",
        path: "/api/v1/auth/sessions/{id}",
        title: "Revoke session",
        description: "Revokes a specific active user session.",
        controllerFile: "apps/api/src/modules/auth/auth.controller.ts",
        controllerHandler: "revokeSession",
        security: [
          {
            scheme: "userSessionAuth"
          }
        ],
        pathParams: [
          {
            name: "id",
            type: "string",
            required: true,
            description: "Session ID to revoke"
          }
        ],
        responses: [
          {
            status: 200,
            label: "Session revoked",
            body: "{\n  \"data\": {\n    \"success\": true\n  }\n}"
          }
        ],
        errors: [
          {
            status: 401,
            code: "UNAUTHORIZED",
            when: "Missing or expired user session JWT"
          },
          {
            status: 404,
            code: "NOT_FOUND",
            when: "Session not found"
          }
        ]
      },
      {
        method: "DELETE",
        path: "/api/v1/auth/sessions",
        title: "Revoke all other sessions",
        description: "Revokes all sessions except the current one for authenticated user.",
        controllerFile: "apps/api/src/modules/auth/auth.controller.ts",
        controllerHandler: "revokeAllSessions",
        security: [
          {
            scheme: "userSessionAuth"
          }
        ],
        responses: [
          {
            status: 200,
            label: "All other sessions revoked",
            body: "{\n  \"data\": {\n    \"success\": true,\n    \"revokedCount\": 2\n  }\n}"
          }
        ],
        errors: [
          {
            status: 401,
            code: "UNAUTHORIZED",
            when: "Missing or expired user session JWT"
          }
        ]
      },
      {
        method: "POST",
        path: "/api/v1/auth/oauth/link",
        title: "Link OAuth account",
        description: "Connects an OAuth provider to authenticated user account.",
        controllerFile: "apps/api/src/modules/auth/auth.controller.ts",
        controllerHandler: "linkOAuth",
        security: [
          {
            scheme: "userSessionAuth"
          }
        ],
        requestBody: {
          contentType: "application/json",
          example: "{\n  \"provider\": \"google\",\n  \"code\": \"4/0AX4XfWh...\"\n}",
          schema: {
            name: "LinkOAuthRequest",
            type: "object",
            required: [
              "provider",
              "code"
            ],
            properties: {
              provider: {
                type: "string",
                enum: [
                  "google",
                  "github"
                ]
              },
              code: {
                type: "string"
              }
            }
          }
        },
        responses: [
          {
            status: 200,
            label: "Provider linked",
            body: "{\n  \"data\": {\n    \"success\": true,\n    \"provider\": \"google\"\n  }\n}"
          }
        ],
        errors: [
          {
            status: 400,
            code: "VALIDATION_ERROR",
            when: "Invalid OAuth authorization code"
          },
          {
            status: 401,
            code: "UNAUTHORIZED",
            when: "Missing or expired user session JWT"
          },
          {
            status: 409,
            code: "ACCOUNT_ALREADY_LINKED",
            when: "Provider account already connected to another user"
          }
        ]
      },
      {
        method: "DELETE",
        path: "/api/v1/auth/oauth/link/{provider}",
        title: "Unlink OAuth provider",
        description: "Disconnects an OAuth provider from authenticated user account.",
        controllerFile: "apps/api/src/modules/auth/auth.controller.ts",
        controllerHandler: "unlinkOAuth",
        security: [
          {
            scheme: "userSessionAuth"
          }
        ],
        pathParams: [
          {
            name: "provider",
            type: "string",
            required: true,
            description: "OAuth provider identifier (google, github)"
          }
        ],
        responses: [
          {
            status: 200,
            label: "Provider unlinked",
            body: "{\n  \"data\": {\n    \"success\": true,\n    \"provider\": \"google\"\n  }\n}"
          }
        ],
        errors: [
          {
            status: 401,
            code: "UNAUTHORIZED",
            when: "Missing or expired user session JWT"
          },
          {
            status: 404,
            code: "PROVIDER_NOT_LINKED",
            when: "Specified provider is not linked"
          }
        ]
      },
      {
        method: "GET",
        path: "/api/v1/auth/oauth/linked-accounts",
        title: "List linked OAuth accounts",
        description: "Lists all connected OAuth providers for authenticated user.",
        controllerFile: "apps/api/src/modules/auth/auth.controller.ts",
        controllerHandler: "listLinkedOAuth",
        security: [
          {
            scheme: "userSessionAuth"
          }
        ],
        responses: [
          {
            status: 200,
            label: "Linked accounts listed",
            body: "{\n  \"data\": [\n    {\n      \"provider\": \"google\",\n      \"email\": \"user@example.com\",\n      \"linkedAt\": \"2026-02-18T10:00:00.000Z\"\n    }\n  ]\n}"
          }
        ],
        errors: [
          {
            status: 401,
            code: "UNAUTHORIZED",
            when: "Missing or expired user session JWT"
          }
        ]
      }
    ]
  },
  {
    name: "Users",
    description: "Marketplace user provisioning and profile management.",
    endpoints: [
      {
        method: "POST",
        path: "/api/v1/users",
        title: "Create user",
        description: "Creates a marketplace user and their ledger balance record. Requires write scope.",
        controllerFile: "apps/api/src/modules/users/users.controller.ts",
        controllerHandler: "createUser",
        security: [
          {
            scheme: "apiKeyAuth",
            scopes: [
              "write"
            ]
          }
        ],
        requestBody: {
          contentType: "application/json",
          example: "{\n  \"externalUserId\": \"ext_buyer_9f2c1a7e5b3d8f6041c2a9e7\",\n  \"email\": \"buyer@marketplace.com\",\n  \"type\": \"BUYER\"\n}",
          schema: {
            name: "CreateUserRequest",
            type: "object",
            required: [
              "externalUserId"
            ],
            properties: {
              externalUserId: {
                type: "string",
                description: "Marketplace external user identifier"
              },
              email: {
                type: "string",
                format: "email",
                description: "User email address"
              },
              type: {
                type: "string",
                enum: [
                  "BUYER",
                  "SELLER",
                  "BOTH"
                ],
                default: "BOTH"
              }
            }
          }
        },
        responses: [
          {
            status: 201,
            label: "User created",
            body: "{\n  \"data\": {\n    \"id\": \"usr_9f2c1a7e5b3d8f6041c2a9e7b5d3f1a0\",\n    \"externalUserId\": \"ext_buyer_9f2c1a7e5b3d8f6041c2a9e7\",\n    \"email\": \"buyer@marketplace.com\",\n    \"type\": \"BUYER\",\n    \"status\": \"ACTIVE\",\n    \"createdAt\": \"2026-02-18T10:00:00.000Z\",\n    \"updatedAt\": \"2026-02-18T10:00:00.000Z\"\n  }\n}",
            schema: {
              name: "CreateUserResponse",
              type: "object",
              required: [
                "data"
              ],
              properties: {
                data: {
                  type: "object",
                  required: [
                    "id",
                    "externalUserId",
                    "type",
                    "status",
                    "createdAt",
                    "updatedAt"
                  ],
                  properties: {
                    id: {
                      type: "string"
                    },
                    externalUserId: {
                      type: "string"
                    },
                    email: {
                      type: "string",
                      nullable: true
                    },
                    type: {
                      type: "string"
                    },
                    status: {
                      type: "string"
                    },
                    createdAt: {
                      type: "string",
                      format: "date-time"
                    },
                    updatedAt: {
                      type: "string",
                      format: "date-time"
                    }
                  }
                }
              }
            }
          }
        ],
        errors: [
          {
            status: 400,
            code: "VALIDATION_ERROR",
            when: "Invalid externalUserId format or role"
          },
          {
            status: 401,
            code: "UNAUTHORIZED",
            when: "Missing or invalid API key credential"
          },
          {
            status: 403,
            code: "INSUFFICIENT_SCOPE",
            when: "API key lacks write scope"
          }
        ]
      }
    ]
  },
  {
    name: "Wallet",
    description: "Stellar non-custodial wallet connections via Stellar Wallets Kit, transaction tracking, and sandbox claiming.",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/wallet",
        title: "Get primary wallet",
        description: "Returns primary Stellar wallet details and USDC trustline status for authenticated user.",
        controllerFile: "apps/api/src/modules/wallet/wallet.controller.ts",
        controllerHandler: "getPrimaryWallet",
        security: [
          {
            scheme: "userSessionAuth"
          }
        ],
        responses: [
          {
            status: 200,
            label: "Wallet details returned",
            body: "{\n  \"data\": {\n    \"id\": \"wal_4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e\",\n    \"address\": \"GABCMX76J6XFMH67QJ5J4K2VXZ4QW6A6Y53GHEKRO42N...\",\n    \"walletType\": \"EXTERNAL\",\n    \"isPrimary\": true,\n    \"provider\": \"freighter\",\n    \"status\": \"ACTIVE\"\n  }\n}",
            schema: {
              name: "WalletInfoResponse",
              type: "object",
              required: [
                "data"
              ],
              properties: {
                data: {
                  type: "object",
                  required: [
                    "id",
                    "address",
                    "walletType",
                    "isPrimary",
                    "provider",
                    "status"
                  ],
                  properties: {
                    id: {
                      type: "string"
                    },
                    address: {
                      type: "string"
                    },
                    walletType: {
                      type: "string",
                      enum: [
                        "EXTERNAL",
                        "INVISIBLE"
                      ]
                    },
                    isPrimary: {
                      type: "boolean"
                    },
                    provider: {
                      type: "string",
                      enum: [
                        "freighter",
                        "lobstr",
                        "xbull"
                      ]
                    },
                    status: {
                      type: "string"
                    }
                  }
                }
              }
            }
          }
        ],
        errors: [
          {
            status: 401,
            code: "UNAUTHORIZED",
            when: "Missing or expired user session JWT"
          },
          {
            status: 404,
            code: "WALLET_NOT_FOUND",
            when: "No primary wallet linked to user"
          }
        ]
      },
      {
        method: "GET",
        path: "/api/v1/wallet/readiness",
        title: "Get wallet readiness",
        description: "Checks whether the user's primary wallet is ready to transact on Stellar (funded with XLM and USDC trustline established).",
        controllerFile: "apps/api/src/modules/wallet/wallet.controller.ts",
        controllerHandler: "getWalletReadiness",
        security: [
          {
            scheme: "userSessionAuth"
          }
        ],
        responses: [
          {
            status: 200,
            label: "Readiness status returned",
            body: "{\n  \"data\": {\n    \"isReady\": true,\n    \"trustlineSet\": true,\n    \"xlmFunded\": true,\n    \"balance\": \"500.00\",\n    \"currency\": \"USDC\",\n    \"address\": \"GABCMX76J6XFMH67QJ5J4K2VXZ4QW6A6Y53GHEKRO42N...\"\n  }\n}",
            schema: {
              name: "WalletReadinessResponse",
              type: "object",
              required: [
                "data"
              ],
              properties: {
                data: {
                  type: "object",
                  required: [
                    "isReady",
                    "trustlineSet",
                    "xlmFunded",
                    "balance",
                    "currency",
                    "address"
                  ],
                  properties: {
                    isReady: {
                      type: "boolean"
                    },
                    trustlineSet: {
                      type: "boolean"
                    },
                    xlmFunded: {
                      type: "boolean"
                    },
                    balance: {
                      type: "string"
                    },
                    currency: {
                      type: "string"
                    },
                    address: {
                      type: "string"
                    }
                  }
                }
              }
            }
          }
        ],
        errors: [
          {
            status: 401,
            code: "UNAUTHORIZED",
            when: "Missing or expired user session JWT"
          },
          {
            status: 404,
            code: "WALLET_NOT_FOUND",
            when: "No wallet linked to user"
          }
        ]
      },
      {
        method: "GET",
        path: "/api/v1/wallet/wallets",
        title: "List connected wallets",
        description: "Lists all Stellar wallets connected by authenticated user through Stellar Wallets Kit.",
        controllerFile: "apps/api/src/modules/wallet/wallet.controller.ts",
        controllerHandler: "listWallets",
        security: [
          {
            scheme: "userSessionAuth"
          }
        ],
        responses: [
          {
            status: 200,
            label: "Connected wallets listed",
            body: "{\n  \"data\": [\n    {\n      \"id\": \"wal_4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e\",\n      \"address\": \"GABCMX76J6XFMH67QJ5J4K2VXZ4QW6A6Y53GHEKRO42N...\",\n      \"walletType\": \"EXTERNAL\",\n      \"isPrimary\": true,\n      \"provider\": \"freighter\",\n      \"connectedAt\": \"2026-02-18T10:00:00.000Z\"\n    }\n  ]\n}",
            schema: {
              name: "ConnectedWalletsResponse",
              type: "object",
              required: [
                "data"
              ],
              properties: {
                data: {
                  type: "array",
                  items: {
                    type: "object",
                    required: [
                      "id",
                      "address",
                      "walletType",
                      "isPrimary",
                      "provider"
                    ],
                    properties: {
                      id: {
                        type: "string"
                      },
                      address: {
                        type: "string"
                      },
                      walletType: {
                        type: "string"
                      },
                      isPrimary: {
                        type: "boolean"
                      },
                      provider: {
                        type: "string"
                      },
                      connectedAt: {
                        type: "string",
                        format: "date-time"
                      }
                    }
                  }
                }
              }
            }
          }
        ],
        errors: [
          {
            status: 401,
            code: "UNAUTHORIZED",
            when: "Missing or expired user session JWT"
          }
        ]
      },
      {
        method: "GET",
        path: "/api/v1/wallet/dashboard",
        title: "Get wallet dashboard",
        description: "Aggregates wallet metrics, total USDC balance, and recent activity for user dashboard.",
        controllerFile: "apps/api/src/modules/wallet/wallet.controller.ts",
        controllerHandler: "getWalletDashboard",
        security: [
          {
            scheme: "userSessionAuth"
          }
        ],
        responses: [
          {
            status: 200,
            label: "Dashboard metrics returned",
            body: "{\n  \"data\": {\n    \"totalBalance\": \"1500.00\",\n    \"currency\": \"USDC\",\n    \"activeWallets\": 1,\n    \"pendingTransactions\": 0\n  }\n}"
          }
        ],
        errors: [
          {
            status: 401,
            code: "UNAUTHORIZED",
            when: "Missing or expired user session JWT"
          }
        ]
      },
      {
        method: "GET",
        path: "/api/v1/wallet/transactions",
        title: "List wallet transactions",
        description: "Fetches on-chain Stellar transaction history for user's connected wallets via Stellar RPC.",
        controllerFile: "apps/api/src/modules/wallet/wallet.controller.ts",
        controllerHandler: "listWalletTransactions",
        security: [
          {
            scheme: "userSessionAuth"
          }
        ],
        queryParams: [
          {
            name: "limit",
            type: "number",
            required: false,
            description: "Max items to return (1-100)"
          },
          {
            name: "cursor",
            type: "string",
            required: false,
            description: "Pagination cursor"
          }
        ],
        responses: [
          {
            status: 200,
            label: "Transactions listed",
            body: "{\n  \"data\": [\n    {\n      \"id\": \"tx_1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d\",\n      \"type\": \"PAYMENT\",\n      \"amount\": \"100.00\",\n      \"currency\": \"USDC\",\n      \"status\": \"SUCCESS\",\n      \"hash\": \"3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e\",\n      \"timestamp\": \"2026-02-18T10:30:00.000Z\"\n    }\n  ]\n}"
          }
        ],
        errors: [
          {
            status: 401,
            code: "UNAUTHORIZED",
            when: "Missing or expired user session JWT"
          }
        ]
      },
      {
        method: "POST",
        path: "/api/v1/wallet/connect",
        title: "Connect wallet",
        description: "Registers a user-owned Stellar wallet connected client-side through Stellar Wallets Kit (Freighter/Varial, Lobstr, xBull).",
        controllerFile: "apps/api/src/modules/wallet/wallet.controller.ts",
        controllerHandler: "connectWallet",
        security: [
          {
            scheme: "userSessionAuth"
          }
        ],
        requestBody: {
          contentType: "application/json",
          example: "{\n  \"address\": \"GABCMX76J6XFMH67QJ5J4K2VXZ4QW6A6Y53GHEKRO42N...\",\n  \"provider\": \"freighter\",\n  \"signedMessage\": \"AAAA...\"\n}",
          schema: {
            name: "ConnectWalletRequest",
            type: "object",
            required: [
              "address",
              "provider"
            ],
            properties: {
              address: {
                type: "string",
                description: "Stellar public address (G...)"
              },
              provider: {
                type: "string",
                enum: [
                  "freighter",
                  "lobstr",
                  "xbull"
                ]
              },
              signedMessage: {
                type: "string",
                description: "Client-signed verification message"
              }
            }
          }
        },
        responses: [
          {
            status: 201,
            label: "Wallet connected",
            body: "{\n  \"data\": {\n    \"id\": \"wal_4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e\",\n    \"address\": \"GABCMX76J6XFMH67QJ5J4K2VXZ4QW6A6Y53GHEKRO42N...\",\n    \"walletType\": \"EXTERNAL\",\n    \"isPrimary\": true,\n    \"provider\": \"freighter\"\n  }\n}"
          }
        ],
        errors: [
          {
            status: 400,
            code: "VALIDATION_ERROR",
            when: "Invalid Stellar address or unsupported provider"
          },
          {
            status: 401,
            code: "UNAUTHORIZED",
            when: "Missing or expired user session JWT"
          },
          {
            status: 409,
            code: "WALLET_ALREADY_CONNECTED",
            when: "Address already registered to this account"
          }
        ]
      },
      {
        method: "POST",
        path: "/api/v1/wallet/disconnect",
        title: "Disconnect wallet",
        description: "Disconnects a Stellar wallet from authenticated user account.",
        controllerFile: "apps/api/src/modules/wallet/wallet.controller.ts",
        controllerHandler: "disconnectWallet",
        security: [
          {
            scheme: "userSessionAuth"
          }
        ],
        requestBody: {
          contentType: "application/json",
          example: "{\n  \"address\": \"GABCMX76J6XFMH67QJ5J4K2VXZ4QW6A6Y53GHEKRO42N...\"\n}",
          schema: {
            name: "DisconnectWalletRequest",
            type: "object",
            required: [
              "address"
            ],
            properties: {
              address: {
                type: "string"
              }
            }
          }
        },
        responses: [
          {
            status: 200,
            label: "Wallet disconnected",
            body: "{\n  \"data\": {\n    \"success\": true\n  }\n}"
          }
        ],
        errors: [
          {
            status: 400,
            code: "VALIDATION_ERROR",
            when: "Invalid address format"
          },
          {
            status: 401,
            code: "UNAUTHORIZED",
            when: "Missing or expired user session JWT"
          },
          {
            status: 404,
            code: "WALLET_NOT_FOUND",
            when: "Wallet not associated with user"
          }
        ]
      },
      {
        method: "POST",
        path: "/api/v1/wallet/reconnect",
        title: "Reconnect wallet",
        description: "Re-validates connection and trustlines for a previously connected Stellar wallet.",
        controllerFile: "apps/api/src/modules/wallet/wallet.controller.ts",
        controllerHandler: "reconnectWallet",
        security: [
          {
            scheme: "userSessionAuth"
          }
        ],
        requestBody: {
          contentType: "application/json",
          example: "{\n  \"address\": \"GABCMX76J6XFMH67QJ5J4K2VXZ4QW6A6Y53GHEKRO42N...\"\n}",
          schema: {
            name: "ReconnectWalletRequest",
            type: "object",
            required: [
              "address"
            ],
            properties: {
              address: {
                type: "string"
              }
            }
          }
        },
        responses: [
          {
            status: 200,
            label: "Wallet reconnected",
            body: "{\n  \"data\": {\n    \"success\": true\n  }\n}"
          }
        ],
        errors: [
          {
            status: 401,
            code: "UNAUTHORIZED",
            when: "Missing or expired user session JWT"
          },
          {
            status: 404,
            code: "WALLET_NOT_FOUND",
            when: "Wallet not found"
          }
        ]
      },
      {
        method: "POST",
        path: "/api/v1/wallet/set-primary",
        title: "Set primary wallet",
        description: "Sets the designated wallet as primary for order escrow transactions and payouts.",
        controllerFile: "apps/api/src/modules/wallet/wallet.controller.ts",
        controllerHandler: "setPrimaryWallet",
        security: [
          {
            scheme: "userSessionAuth"
          }
        ],
        requestBody: {
          contentType: "application/json",
          example: "{\n  \"address\": \"GABCMX76J6XFMH67QJ5J4K2VXZ4QW6A6Y53GHEKRO42N...\"\n}",
          schema: {
            name: "SetPrimaryWalletRequest",
            type: "object",
            required: [
              "address"
            ],
            properties: {
              address: {
                type: "string"
              }
            }
          }
        },
        responses: [
          {
            status: 200,
            label: "Primary wallet updated",
            body: "{\n  \"data\": {\n    \"success\": true,\n    \"primaryAddress\": \"GABCMX76J6XFMH67QJ5J4K2VXZ4QW6A6Y53GHEKRO42N...\"\n  }\n}"
          }
        ],
        errors: [
          {
            status: 401,
            code: "UNAUTHORIZED",
            when: "Missing or expired user session JWT"
          },
          {
            status: 404,
            code: "WALLET_NOT_FOUND",
            when: "Wallet address not found on account"
          }
        ]
      },
      {
        method: "POST",
        path: "/api/v1/wallet/claim",
        title: "Claim invisible wallet",
        description: "Sandbox only: claims custodial invisible wallet created on testnet sandbox within the 90-day window.",
        controllerFile: "apps/api/src/modules/wallet/wallet.controller.ts",
        controllerHandler: "claimWallet",
        security: [
          {
            scheme: "userSessionAuth"
          }
        ],
        requestBody: {
          contentType: "application/json",
          example: "{\n  \"targetAddress\": \"GABCMX76J6XFMH67QJ5J4K2VXZ4QW6A6Y53GHEKRO42N...\",\n  \"signedClaim\": \"AAAA...\"\n}",
          schema: {
            name: "ClaimWalletRequest",
            type: "object",
            required: [
              "targetAddress",
              "signedClaim"
            ],
            properties: {
              targetAddress: {
                type: "string",
                description: "Target user-owned Stellar address"
              },
              signedClaim: {
                type: "string",
                description: "Signed cryptographic claim payload"
              }
            }
          }
        },
        responses: [
          {
            status: 200,
            label: "Wallet claimed",
            body: "{\n  \"data\": {\n    \"success\": true,\n    \"claimedAddress\": \"GABCMX76J6XFMH67QJ5J4K2VXZ4QW6A6Y53GHEKRO42N...\",\n    \"transferredBalance\": \"50.00\",\n    \"currency\": \"USDC\"\n  }\n}"
          }
        ],
        errors: [
          {
            status: 400,
            code: "VALIDATION_ERROR",
            when: "Invalid target address or claim signature"
          },
          {
            status: 401,
            code: "UNAUTHORIZED",
            when: "Missing or expired user session JWT"
          },
          {
            status: 403,
            code: "WALLET_CLAIM_EXPIRED",
            when: "90-day sandbox claim window has expired"
          },
          {
            status: 404,
            code: "WALLET_NOT_FOUND",
            when: "No claimable invisible wallet found"
          }
        ]
      }
    ]
  },
  {
    name: "Orders",
    description: "Order creation, reservation, cancellation, milestones, attachments, and notes.",
    endpoints: [
      {
        method: "POST",
        path: "/api/v1/orders",
        title: "Create order",
        description: "Creates a new order in ORDER_CREATED state. Requires Idempotency-Key header.",
        controllerFile: "apps/api/src/modules/orders/orders.controller.ts",
        controllerHandler: "createOrder",
        security: [
          {
            scheme: "userSessionAuth"
          }
        ],
        headerParams: [
          {
            name: "Idempotency-Key",
            type: "string",
            required: true,
            description: "Unique key (e.g. UUID v4 or random token) to prevent duplicate order creation.",
            placeholder: "idem_1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d"
          }
        ],
        requestBody: {
          contentType: "application/json",
          example: "{\n  \"buyerId\": \"usr_9f2c1a7e5b3d8f6041c2a9e7b5d3f1a0\",\n  \"sellerId\": \"usr_7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e\",\n  \"amount\": \"2500.00\",\n  \"currency\": \"USDC\",\n  \"title\": \"Smart contract security audit\",\n  \"description\": \"Full formal audit of soroban contracts\",\n  \"milestones\": [\n    {\n      \"ref\": \"ms_1\",\n      \"title\": \"Initial report\",\n      \"amount\": \"1000.00\"\n    },\n    {\n      \"ref\": \"ms_2\",\n      \"title\": \"Final verification\",\n      \"amount\": \"1500.00\"\n    }\n  ]\n}",
          schema: {
            name: "CreateOrderRequest",
            type: "object",
            required: [
              "buyerId",
              "sellerId",
              "amount",
              "currency"
            ],
            properties: {
              buyerId: {
                type: "string"
              },
              sellerId: {
                type: "string"
              },
              amount: {
                type: "string"
              },
              currency: {
                type: "string",
                enum: [
                  "USDC",
                  "USD"
                ]
              },
              title: {
                type: "string"
              },
              description: {
                type: "string"
              },
              milestones: {
                type: "array",
                items: {
                  type: "object",
                  required: [
                    "ref",
                    "title",
                    "amount"
                  ],
                  properties: {
                    ref: {
                      type: "string"
                    },
                    title: {
                      type: "string"
                    },
                    amount: {
                      type: "string"
                    }
                  }
                }
              }
            }
          }
        },
        responses: [
          {
            status: 201,
            label: "Order created",
            body: "{\n  \"data\": {\n    \"success\": true,\n    \"data\": {\n      \"id\": \"ord_1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d\",\n      \"status\": \"ORDER_CREATED\",\n      \"buyerId\": \"usr_9f2c1a7e5b3d8f6041c2a9e7b5d3f1a0\",\n      \"sellerId\": \"usr_7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e\",\n      \"amount\": \"2500.00\",\n      \"currency\": \"USDC\",\n      \"createdAt\": \"2026-02-18T10:00:00.000Z\"\n    }\n  },\n  \"meta\": {\n    \"requestId\": \"req_9f2c1a7e5b3d8f6041c2a9e7b5d3f1a0\",\n    \"timestamp\": \"2026-02-18T10:00:00.000Z\"\n  }\n}"
          }
        ],
        errors: [
          {
            status: 400,
            code: "VALIDATION_ERROR",
            when: "Invalid amount format or missing required fields"
          },
          {
            status: 400,
            code: "SAME_USER_ERROR",
            when: "Buyer and seller must be different users"
          },
          {
            status: 401,
            code: "UNAUTHORIZED",
            when: "Missing or expired user session JWT"
          },
          {
            status: 409,
            code: "IDEMPOTENCY_CONFLICT",
            when: "Idempotency key reused with different payload"
          }
        ]
      },
      {
        method: "GET",
        path: "/api/v1/orders",
        title: "List orders",
        description: "Lists marketplace orders with optional filtering by role or status.",
        controllerFile: "apps/api/src/modules/orders/orders.controller.ts",
        controllerHandler: "listOrders",
        security: [
          {
            scheme: "userSessionAuth"
          }
        ],
        queryParams: [
          {
            name: "buyer_id",
            type: "string",
            required: false,
            description: "Filter by buyer user ID"
          },
          {
            name: "seller_id",
            type: "string",
            required: false,
            description: "Filter by seller user ID"
          },
          {
            name: "status",
            type: "select",
            required: false,
            description: "Filter by order status",
            options: [
              "ORDER_CREATED",
              "FUNDS_RESERVED",
              "ESCROW_CREATING",
              "ESCROW_FUNDING",
              "ESCROW_FUNDED",
              "IN_PROGRESS",
              "DELIVERED",
              "RELEASE_REQUESTED",
              "RELEASED",
              "REFUND_REQUESTED",
              "REFUNDED",
              "DISPUTED",
              "CLOSED"
            ]
          },
          {
            name: "limit",
            type: "number",
            required: false,
            description: "Maximum items to return (1-100)"
          },
          {
            name: "cursor",
            type: "string",
            required: false,
            description: "Cursor for cursor-based pagination"
          }
        ],
        responses: [
          {
            status: 200,
            label: "Orders listed",
            body: "{\n  \"data\": {\n    \"success\": true,\n    \"data\": [\n      {\n        \"id\": \"ord_1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d\",\n        \"status\": \"ORDER_CREATED\",\n        \"buyerId\": \"usr_9f2c1a7e5b3d8f6041c2a9e7b5d3f1a0\",\n        \"sellerId\": \"usr_7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e\",\n        \"amount\": \"2500.00\",\n        \"currency\": \"USDC\"\n      }\n    ],\n    \"hasMore\": false,\n    \"nextCursor\": null\n  },\n  \"meta\": {\n    \"requestId\": \"req_9f2c1a7e5b3d8f6041c2a9e7b5d3f1a0\",\n    \"timestamp\": \"2026-02-18T10:00:00.000Z\"\n  }\n}"
          }
        ],
        errors: [
          {
            status: 400,
            code: "INVALID_PAGINATION",
            when: "Invalid limit or cursor value"
          },
          {
            status: 401,
            code: "UNAUTHORIZED",
            when: "Missing or expired user session JWT"
          }
        ]
      },
      {
        method: "GET",
        path: "/api/v1/orders/my-purchases",
        title: "List my purchases",
        description: "Lists orders where the authenticated user is the buyer.",
        controllerFile: "apps/api/src/modules/orders/orders.controller.ts",
        controllerHandler: "listMyPurchases",
        security: [
          {
            scheme: "userSessionAuth"
          }
        ],
        queryParams: [
          {
            name: "status",
            type: "string",
            required: false,
            description: "Filter by order status"
          },
          {
            name: "limit",
            type: "number",
            required: false,
            description: "Max items to return"
          },
          {
            name: "cursor",
            type: "string",
            required: false,
            description: "Pagination cursor"
          }
        ],
        responses: [
          {
            status: 200,
            label: "Purchases listed",
            body: "{\n  \"data\": {\n    \"success\": true,\n    \"data\": [\n      {\n        \"id\": \"ord_1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d\",\n        \"status\": \"ORDER_CREATED\",\n        \"amount\": \"2500.00\",\n        \"currency\": \"USDC\"\n      }\n    ],\n    \"hasMore\": false,\n    \"nextCursor\": null\n  }\n}"
          }
        ],
        errors: [
          {
            status: 401,
            code: "UNAUTHORIZED",
            when: "Missing or expired user session JWT"
          }
        ]
      },
      {
        method: "GET",
        path: "/api/v1/orders/{id}",
        title: "Get order",
        description: "Retrieves complete details for a specific order by ID.",
        controllerFile: "apps/api/src/modules/orders/orders.controller.ts",
        controllerHandler: "getOrder",
        security: [
          {
            scheme: "userSessionAuth"
          }
        ],
        pathParams: [
          {
            name: "id",
            type: "string",
            required: true,
            description: "Order ID (ord_...)"
          }
        ],
        responses: [
          {
            status: 200,
            label: "Order retrieved",
            body: "{\n  \"data\": {\n    \"success\": true,\n    \"data\": {\n      \"id\": \"ord_1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d\",\n      \"status\": \"ORDER_CREATED\",\n      \"buyerId\": \"usr_9f2c1a7e5b3d8f6041c2a9e7b5d3f1a0\",\n      \"sellerId\": \"usr_7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e\",\n      \"amount\": \"2500.00\",\n      \"currency\": \"USDC\",\n      \"title\": \"Smart contract security audit\",\n      \"createdAt\": \"2026-02-18T10:00:00.000Z\"\n    }\n  },\n  \"meta\": {\n    \"requestId\": \"req_9f2c1a7e5b3d8f6041c2a9e7b5d3f1a0\",\n    \"timestamp\": \"2026-02-18T10:00:00.000Z\"\n  }\n}"
          }
        ],
        errors: [
          {
            status: 401,
            code: "UNAUTHORIZED",
            when: "Missing or expired user session JWT"
          },
          {
            status: 404,
            code: "ORDER_NOT_FOUND",
            when: "Order does not exist"
          }
        ]
      },
      {
        method: "POST",
        path: "/api/v1/orders/{id}/reserve",
        title: "Reserve funds",
        description: "Reserves order amount from buyer's available ledger balance. Transitions state to FUNDS_RESERVED.",
        controllerFile: "apps/api/src/modules/orders/orders.controller.ts",
        controllerHandler: "reserveFunds",
        security: [
          {
            scheme: "userSessionAuth"
          }
        ],
        pathParams: [
          {
            name: "id",
            type: "string",
            required: true,
            description: "Order ID (ord_...)"
          }
        ],
        responses: [
          {
            status: 200,
            label: "Funds reserved",
            body: "{\n  \"data\": {\n    \"success\": true,\n    \"data\": {\n      \"id\": \"ord_1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d\",\n      \"status\": \"FUNDS_RESERVED\",\n      \"reservedAmount\": \"2500.00\"\n    }\n  },\n  \"meta\": {\n    \"requestId\": \"req_9f2c1a7e5b3d8f6041c2a9e7b5d3f1a0\",\n    \"timestamp\": \"2026-02-18T10:00:00.000Z\"\n  }\n}"
          }
        ],
        errors: [
          {
            status: 401,
            code: "UNAUTHORIZED",
            when: "Missing or expired user session JWT"
          },
          {
            status: 404,
            code: "ORDER_NOT_FOUND",
            when: "Order does not exist"
          },
          {
            status: 409,
            code: "INVALID_STATE",
            when: "Order is not in ORDER_CREATED status"
          },
          {
            status: 422,
            code: "INSUFFICIENT_FUNDS",
            when: "Buyer available balance is lower than order amount"
          }
        ]
      },
      {
        method: "POST",
        path: "/api/v1/orders/{id}/cancel",
        title: "Cancel order",
        description: "Cancels an order in ORDER_CREATED or FUNDS_RESERVED status, releasing reserved funds. Transitions order to CLOSED status. (Note: There is no CANCELLED status).",
        controllerFile: "apps/api/src/modules/orders/orders.controller.ts",
        controllerHandler: "cancelOrder",
        security: [
          {
            scheme: "userSessionAuth"
          }
        ],
        pathParams: [
          {
            name: "id",
            type: "string",
            required: true,
            description: "Order ID (ord_...)"
          }
        ],
        requestBody: {
          contentType: "application/json",
          example: "{\n  \"reason\": \"Buyer decided not to proceed\"\n}",
          schema: {
            name: "CancelOrderRequest",
            type: "object",
            required: [
              "reason"
            ],
            properties: {
              reason: {
                type: "string"
              }
            }
          }
        },
        responses: [
          {
            status: 200,
            label: "Order closed",
            body: "{\n  \"data\": {\n    \"success\": true,\n    \"data\": {\n      \"id\": \"ord_1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d\",\n      \"status\": \"CLOSED\",\n      \"cancelReason\": \"Buyer decided not to proceed\"\n    }\n  },\n  \"meta\": {\n    \"requestId\": \"req_9f2c1a7e5b3d8f6041c2a9e7b5d3f1a0\",\n    \"timestamp\": \"2026-02-18T10:00:00.000Z\"\n  }\n}"
          }
        ],
        errors: [
          {
            status: 400,
            code: "VALIDATION_ERROR",
            when: "Missing cancellation reason"
          },
          {
            status: 401,
            code: "UNAUTHORIZED",
            when: "Missing or expired user session JWT"
          },
          {
            status: 404,
            code: "ORDER_NOT_FOUND",
            when: "Order does not exist"
          },
          {
            status: 409,
            code: "INVALID_STATE",
            when: "Order is past FUNDS_RESERVED status (escrow already created)"
          }
        ]
      },
      {
        method: "GET",
        path: "/api/v1/orders/{id}/milestones",
        title: "Get milestones",
        description: "Lists all milestones defined for the specified order.",
        controllerFile: "apps/api/src/modules/orders/orders.controller.ts",
        controllerHandler: "listMilestones",
        security: [
          {
            scheme: "userSessionAuth"
          }
        ],
        pathParams: [
          {
            name: "id",
            type: "string",
            required: true,
            description: "Order ID (ord_...)"
          }
        ],
        responses: [
          {
            status: 200,
            label: "Milestones retrieved",
            body: "{\n  \"data\": {\n    \"success\": true,\n    \"data\": [\n      {\n        \"ref\": \"ms_1\",\n        \"title\": \"Initial report\",\n        \"amount\": \"1000.00\",\n        \"status\": \"PENDING\"\n      },\n      {\n        \"ref\": \"ms_2\",\n        \"title\": \"Final verification\",\n        \"amount\": \"1500.00\",\n        \"status\": \"PENDING\"\n      }\n    ]\n  },\n  \"meta\": {\n    \"requestId\": \"req_9f2c1a7e5b3d8f6041c2a9e7b5d3f1a0\",\n    \"timestamp\": \"2026-02-18T10:00:00.000Z\"\n  }\n}"
          }
        ],
        errors: [
          {
            status: 401,
            code: "UNAUTHORIZED",
            when: "Missing or expired user session JWT"
          },
          {
            status: 404,
            code: "ORDER_NOT_FOUND",
            when: "Order does not exist"
          }
        ]
      },
      {
        method: "POST",
        path: "/api/v1/orders/{id}/milestones/{milestoneRef}/complete",
        title: "Complete milestone",
        description: "Marks a milestone as completed by the seller, ready for buyer approval and release.",
        controllerFile: "apps/api/src/modules/orders/orders.controller.ts",
        controllerHandler: "completeMilestone",
        security: [
          {
            scheme: "userSessionAuth"
          }
        ],
        pathParams: [
          {
            name: "id",
            type: "string",
            required: true,
            description: "Order ID (ord_...)"
          },
          {
            name: "milestoneRef",
            type: "string",
            required: true,
            description: "Milestone reference (e.g. ms_1)"
          }
        ],
        responses: [
          {
            status: 200,
            label: "Milestone completed",
            body: "{\n  \"data\": {\n    \"success\": true,\n    \"data\": {\n      \"ref\": \"ms_1\",\n      \"status\": \"COMPLETED\"\n    }\n  },\n  \"meta\": {\n    \"requestId\": \"req_9f2c1a7e5b3d8f6041c2a9e7b5d3f1a0\",\n    \"timestamp\": \"2026-02-18T10:00:00.000Z\"\n  }\n}"
          }
        ],
        errors: [
          {
            status: 401,
            code: "UNAUTHORIZED",
            when: "Missing or expired user session JWT"
          },
          {
            status: 404,
            code: "ORDER_NOT_FOUND",
            when: "Order does not exist"
          },
          {
            status: 404,
            code: "MILESTONE_NOT_FOUND",
            when: "Milestone ref not found on order"
          },
          {
            status: 409,
            code: "INVALID_STATE",
            when: "Order is not in IN_PROGRESS state"
          }
        ]
      },
      {
        method: "POST",
        path: "/api/v1/orders/{id}/complete",
        title: "Complete order",
        description: "Seller marks order deliverables complete, moving status to DELIVERED.",
        controllerFile: "apps/api/src/modules/orders/orders.controller.ts",
        controllerHandler: "completeOrder",
        security: [
          {
            scheme: "userSessionAuth"
          }
        ],
        pathParams: [
          {
            name: "id",
            type: "string",
            required: true,
            description: "Order ID (ord_...)"
          }
        ],
        responses: [
          {
            status: 200,
            label: "Order delivered",
            body: "{\n  \"data\": {\n    \"success\": true,\n    \"data\": {\n      \"id\": \"ord_1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d\",\n      \"status\": \"DELIVERED\"\n    }\n  }\n}"
          }
        ],
        errors: [
          {
            status: 401,
            code: "UNAUTHORIZED",
            when: "Missing or expired user session JWT"
          },
          {
            status: 404,
            code: "ORDER_NOT_FOUND",
            when: "Order does not exist"
          },
          {
            status: 409,
            code: "INVALID_STATE",
            when: "Order is not in IN_PROGRESS status"
          }
        ]
      },
      {
        method: "POST",
        path: "/api/v1/orders/{id}/attachments",
        title: "Add attachment",
        description: "Attaches a deliverable or specification file link to the order.",
        controllerFile: "apps/api/src/modules/orders/orders.controller.ts",
        controllerHandler: "addAttachment",
        security: [
          {
            scheme: "userSessionAuth"
          }
        ],
        pathParams: [
          {
            name: "id",
            type: "string",
            required: true,
            description: "Order ID (ord_...)"
          }
        ],
        requestBody: {
          contentType: "application/json",
          example: "{\n  \"filename\": \"audit-report.pdf\",\n  \"url\": \"https://storage.example.com/reports/audit-report.pdf\",\n  \"mimeType\": \"application/pdf\",\n  \"sizeBytes\": 2048576\n}",
          schema: {
            name: "AddAttachmentRequest",
            type: "object",
            required: [
              "filename",
              "url"
            ],
            properties: {
              filename: {
                type: "string"
              },
              url: {
                type: "string",
                format: "uri"
              },
              mimeType: {
                type: "string"
              },
              sizeBytes: {
                type: "number"
              }
            }
          }
        },
        responses: [
          {
            status: 201,
            label: "Attachment added",
            body: "{\n  \"data\": {\n    \"success\": true,\n    \"data\": {\n      \"id\": \"att_1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d\",\n      \"filename\": \"audit-report.pdf\",\n      \"url\": \"https://storage.example.com/reports/audit-report.pdf\",\n      \"createdAt\": \"2026-02-18T10:00:00.000Z\"\n    }\n  }\n}"
          }
        ],
        errors: [
          {
            status: 400,
            code: "VALIDATION_ERROR",
            when: "Invalid URL or filename"
          },
          {
            status: 401,
            code: "UNAUTHORIZED",
            when: "Missing or expired user session JWT"
          },
          {
            status: 404,
            code: "ORDER_NOT_FOUND",
            when: "Order not found"
          }
        ]
      },
      {
        method: "DELETE",
        path: "/api/v1/orders/{id}/attachments/{attachmentId}",
        title: "Delete attachment",
        description: "Deletes an attachment from the order.",
        controllerFile: "apps/api/src/modules/orders/orders.controller.ts",
        controllerHandler: "deleteAttachment",
        security: [
          {
            scheme: "userSessionAuth"
          }
        ],
        pathParams: [
          {
            name: "id",
            type: "string",
            required: true,
            description: "Order ID (ord_...)"
          },
          {
            name: "attachmentId",
            type: "string",
            required: true,
            description: "Attachment ID"
          }
        ],
        responses: [
          {
            status: 200,
            label: "Attachment deleted",
            body: "{\n  \"data\": {\n    \"success\": true\n  }\n}"
          }
        ],
        errors: [
          {
            status: 401,
            code: "UNAUTHORIZED",
            when: "Missing or expired user session JWT"
          },
          {
            status: 404,
            code: "NOT_FOUND",
            when: "Attachment not found"
          }
        ]
      },
      {
        method: "POST",
        path: "/api/v1/orders/{id}/notes",
        title: "Add order note",
        description: "Adds an internal note or communication message to the order log.",
        controllerFile: "apps/api/src/modules/orders/orders.controller.ts",
        controllerHandler: "addNote",
        security: [
          {
            scheme: "userSessionAuth"
          }
        ],
        pathParams: [
          {
            name: "id",
            type: "string",
            required: true,
            description: "Order ID (ord_...)"
          }
        ],
        requestBody: {
          contentType: "application/json",
          example: "{\n  \"text\": \"Scope clarified during kickoff call\"\n}",
          schema: {
            name: "AddNoteRequest",
            type: "object",
            required: [
              "text"
            ],
            properties: {
              text: {
                type: "string"
              }
            }
          }
        },
        responses: [
          {
            status: 201,
            label: "Note added",
            body: "{\n  \"data\": {\n    \"success\": true,\n    \"data\": {\n      \"id\": \"note_1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d\",\n      \"text\": \"Scope clarified during kickoff call\",\n      \"createdAt\": \"2026-02-18T10:00:00.000Z\"\n    }\n  }\n}"
          }
        ],
        errors: [
          {
            status: 400,
            code: "VALIDATION_ERROR",
            when: "Missing note text"
          },
          {
            status: 401,
            code: "UNAUTHORIZED",
            when: "Missing or expired user session JWT"
          },
          {
            status: 404,
            code: "ORDER_NOT_FOUND",
            when: "Order not found"
          }
        ]
      }
    ]
  },
  {
    name: "Escrow",
    description: "Trustless Work Soroban escrow creation, funding, and client-side transaction submission.",
    endpoints: [
      {
        method: "POST",
        path: "/api/v1/orders/{id}/escrow/prepare",
        title: "Prepare escrow contract",
        description: "Prepares an unsigned transaction for Trustless Work Soroban escrow contract deployment. Signed client-side by user.",
        controllerFile: "apps/api/src/modules/orders/orders.controller.ts",
        controllerHandler: "prepareEscrow",
        security: [
          {
            scheme: "userSessionAuth"
          }
        ],
        pathParams: [
          {
            name: "id",
            type: "string",
            required: true,
            description: "Order ID (ord_...)"
          }
        ],
        responses: [
          {
            status: 200,
            label: "Escrow transaction prepared",
            body: "{\n  \"data\": {\n    \"success\": true,\n    \"data\": {\n      \"orderId\": \"ord_1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d\",\n      \"unsignedXdr\": \"AAAAAgAAAADe5t8k3m1...\",\n      \"contractAddress\": \"CA3D5KRYM6CB7OWQ6TWYRR3Z4T7GNZLKERYNZGGA5SOAOPIFY6YQGAXE\"\n    }\n  },\n  \"meta\": {\n    \"requestId\": \"req_9f2c1a7e5b3d8f6041c2a9e7b5d3f1a0\",\n    \"timestamp\": \"2026-02-18T10:00:00.000Z\"\n  }\n}"
          }
        ],
        errors: [
          {
            status: 401,
            code: "UNAUTHORIZED",
            when: "Missing or expired user session JWT"
          },
          {
            status: 404,
            code: "ORDER_NOT_FOUND",
            when: "Order does not exist"
          },
          {
            status: 409,
            code: "ESCROW_ALREADY_EXISTS",
            when: "Escrow contract already deployed for this order"
          }
        ]
      },
      {
        method: "POST",
        path: "/api/v1/orders/{id}/escrow/fund/prepare",
        title: "Prepare escrow funding",
        description: "Prepares an unsigned transaction for funding the Soroban escrow contract with USDC. Signed client-side by buyer.",
        controllerFile: "apps/api/src/modules/orders/orders.controller.ts",
        controllerHandler: "prepareEscrowFunding",
        security: [
          {
            scheme: "userSessionAuth"
          }
        ],
        pathParams: [
          {
            name: "id",
            type: "string",
            required: true,
            description: "Order ID (ord_...)"
          }
        ],
        responses: [
          {
            status: 200,
            label: "Funding transaction prepared",
            body: "{\n  \"data\": {\n    \"success\": true,\n    \"data\": {\n      \"orderId\": \"ord_1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d\",\n      \"unsignedXdr\": \"AAAAAgAAAADe5t8k3m1...\",\n      \"amount\": \"2500.00\",\n      \"tokenAddress\": \"CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZPUTHXSTZLEO7SJMI75\"\n    }\n  },\n  \"meta\": {\n    \"requestId\": \"req_9f2c1a7e5b3d8f6041c2a9e7b5d3f1a0\",\n    \"timestamp\": \"2026-02-18T10:00:00.000Z\"\n  }\n}"
          }
        ],
        errors: [
          {
            status: 401,
            code: "UNAUTHORIZED",
            when: "Missing or expired user session JWT"
          },
          {
            status: 404,
            code: "ORDER_NOT_FOUND",
            when: "Order does not exist"
          },
          {
            status: 409,
            code: "ESCROW_NOT_READY",
            when: "Escrow contract deployment is not yet verified on-chain"
          }
        ]
      },
      {
        method: "POST",
        path: "/api/v1/orders/{id}/escrow/submit",
        title: "Submit escrow transaction",
        description: "Submits a client-signed escrow deployment or funding transaction to Stellar RPC. Requires Idempotency-Key header.",
        controllerFile: "apps/api/src/modules/orders/orders.controller.ts",
        controllerHandler: "submitEscrowTransaction",
        security: [
          {
            scheme: "userSessionAuth"
          }
        ],
        headerParams: [
          {
            name: "Idempotency-Key",
            type: "string",
            required: true,
            description: "Unique key to ensure safe retry without duplicate submission.",
            placeholder: "idem_1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d"
          }
        ],
        pathParams: [
          {
            name: "id",
            type: "string",
            required: true,
            description: "Order ID (ord_...)"
          }
        ],
        requestBody: {
          contentType: "application/json",
          example: "{\n  \"signedXdr\": \"AAAAAgAAAADe5t8k3m1...\"\n}",
          schema: {
            name: "SubmitEscrowRequest",
            type: "object",
            required: [
              "signedXdr"
            ],
            properties: {
              signedXdr: {
                type: "string",
                description: "Base64-encoded signed Stellar transaction envelope XDR"
              }
            }
          }
        },
        responses: [
          {
            status: 200,
            label: "Transaction broadcasted and confirmed",
            body: "{\n  \"data\": {\n    \"success\": true,\n    \"data\": {\n      \"orderId\": \"ord_1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d\",\n      \"escrowId\": \"esc_8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d\",\n      \"transactionHash\": \"3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e\",\n      \"status\": \"ESCROW_FUNDED\"\n    }\n  },\n  \"meta\": {\n    \"requestId\": \"req_9f2c1a7e5b3d8f6041c2a9e7b5d3f1a0\",\n    \"timestamp\": \"2026-02-18T10:00:00.000Z\"\n  }\n}"
          }
        ],
        errors: [
          {
            status: 400,
            code: "VALIDATION_ERROR",
            when: "Invalid signedXdr format"
          },
          {
            status: 401,
            code: "UNAUTHORIZED",
            when: "Missing or expired user session JWT"
          },
          {
            status: 409,
            code: "IDEMPOTENCY_CONFLICT",
            when: "Concurrent or conflicting idempotency key reuse"
          },
          {
            status: 502,
            code: "PROVIDER_ERROR",
            when: "Stellar RPC node rejected transaction"
          }
        ]
      }
    ]
  },
  {
    name: "Resolution",
    description: "Client-side signed release, refund, and dispute preparation for escrow contracts.",
    endpoints: [
      {
        method: "POST",
        path: "/api/v1/orders/{orderId}/resolution/release/prepare",
        title: "Prepare release",
        description: "Prepares an unsigned transaction for releasing escrow funds to seller upon milestone or order completion. Signed client-side.",
        controllerFile: "apps/api/src/modules/resolution/resolution.controller.ts",
        controllerHandler: "prepareRelease",
        security: [
          {
            scheme: "userSessionAuth"
          }
        ],
        pathParams: [
          {
            name: "orderId",
            type: "string",
            required: true,
            description: "Order ID (ord_...)"
          }
        ],
        responses: [
          {
            status: 200,
            label: "Release transaction prepared",
            body: "{\n  \"data\": {\n    \"success\": true,\n    \"data\": {\n      \"orderId\": \"ord_1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d\",\n      \"unsignedXdr\": \"AAAAAgAAAADe5t8k3m1...\",\n      \"releaseAmount\": \"2500.00\"\n    }\n  },\n  \"meta\": {\n    \"requestId\": \"req_9f2c1a7e5b3d8f6041c2a9e7b5d3f1a0\",\n    \"timestamp\": \"2026-02-18T10:00:00.000Z\"\n  }\n}"
          }
        ],
        errors: [
          {
            status: 401,
            code: "UNAUTHORIZED",
            when: "Missing or expired user session JWT"
          },
          {
            status: 404,
            code: "ORDER_NOT_FOUND",
            when: "Order does not exist"
          },
          {
            status: 409,
            code: "ESCROW_NOT_FUNDED",
            when: "Escrow contract is not funded"
          }
        ]
      },
      {
        method: "POST",
        path: "/api/v1/orders/{orderId}/resolution/refund/prepare",
        title: "Prepare refund",
        description: "Prepares an unsigned transaction to return escrowed funds to buyer. Signed client-side.",
        controllerFile: "apps/api/src/modules/resolution/resolution.controller.ts",
        controllerHandler: "prepareRefund",
        security: [
          {
            scheme: "userSessionAuth"
          }
        ],
        pathParams: [
          {
            name: "orderId",
            type: "string",
            required: true,
            description: "Order ID (ord_...)"
          }
        ],
        responses: [
          {
            status: 200,
            label: "Refund transaction prepared",
            body: "{\n  \"data\": {\n    \"success\": true,\n    \"data\": {\n      \"orderId\": \"ord_1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d\",\n      \"unsignedXdr\": \"AAAAAgAAAADe5t8k3m1...\",\n      \"refundAmount\": \"2500.00\"\n    }\n  },\n  \"meta\": {\n    \"requestId\": \"req_9f2c1a7e5b3d8f6041c2a9e7b5d3f1a0\",\n    \"timestamp\": \"2026-02-18T10:00:00.000Z\"\n  }\n}"
          }
        ],
        errors: [
          {
            status: 401,
            code: "UNAUTHORIZED",
            when: "Missing or expired user session JWT"
          },
          {
            status: 404,
            code: "ORDER_NOT_FOUND",
            when: "Order does not exist"
          },
          {
            status: 409,
            code: "ESCROW_NOT_FUNDED",
            when: "Escrow contract is not funded"
          }
        ]
      },
      {
        method: "POST",
        path: "/api/v1/orders/{orderId}/resolution/dispute/prepare",
        title: "Prepare dispute",
        description: "Prepares an unsigned transaction to freeze Soroban escrow into disputed state. Signed client-side.",
        controllerFile: "apps/api/src/modules/resolution/resolution.controller.ts",
        controllerHandler: "prepareDispute",
        security: [
          {
            scheme: "userSessionAuth"
          }
        ],
        pathParams: [
          {
            name: "orderId",
            type: "string",
            required: true,
            description: "Order ID (ord_...)"
          }
        ],
        responses: [
          {
            status: 200,
            label: "Dispute transaction prepared",
            body: "{\n  \"data\": {\n    \"success\": true,\n    \"data\": {\n      \"orderId\": \"ord_1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d\",\n      \"unsignedXdr\": \"AAAAAgAAAADe5t8k3m1...\"\n    }\n  },\n  \"meta\": {\n    \"requestId\": \"req_9f2c1a7e5b3d8f6041c2a9e7b5d3f1a0\",\n    \"timestamp\": \"2026-02-18T10:00:00.000Z\"\n  }\n}"
          }
        ],
        errors: [
          {
            status: 401,
            code: "UNAUTHORIZED",
            when: "Missing or expired user session JWT"
          },
          {
            status: 404,
            code: "ORDER_NOT_FOUND",
            when: "Order does not exist"
          },
          {
            status: 409,
            code: "ESCROW_NOT_FUNDED",
            when: "Escrow contract is not funded"
          }
        ]
      },
      {
        method: "POST",
        path: "/api/v1/orders/{orderId}/resolution/dispute",
        title: "Open dispute",
        description: "Opens a dispute on an active order. Reasons: NOT_DELIVERED, QUALITY_ISSUE, OTHER. Can be opened by BUYER or SELLER.",
        controllerFile: "apps/api/src/modules/resolution/resolution.controller.ts",
        controllerHandler: "openDispute",
        security: [
          {
            scheme: "userSessionAuth"
          }
        ],
        pathParams: [
          {
            name: "orderId",
            type: "string",
            required: true,
            description: "Order ID (ord_...)"
          }
        ],
        requestBody: {
          contentType: "application/json",
          example: "{\n  \"reason\": \"NOT_DELIVERED\",\n  \"description\": \"Deliverables were not delivered by agreed milestone deadline\",\n  \"signedXdr\": \"AAAA...\"\n}",
          schema: {
            name: "OpenDisputeRequest",
            type: "object",
            required: [
              "reason",
              "description"
            ],
            properties: {
              reason: {
                type: "string",
                enum: [
                  "NOT_DELIVERED",
                  "QUALITY_ISSUE",
                  "OTHER"
                ]
              },
              description: {
                type: "string"
              },
              signedXdr: {
                type: "string"
              }
            }
          }
        },
        responses: [
          {
            status: 201,
            label: "Dispute opened",
            body: "{\n  \"data\": {\n    \"success\": true,\n    \"data\": {\n      \"disputeId\": \"dsp_1f2e3d4c5b6a708990a1b2c3d4e5f6a7\",\n      \"orderId\": \"ord_1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d\",\n      \"status\": \"OPEN\",\n      \"openedBy\": \"BUYER\",\n      \"reason\": \"NOT_DELIVERED\",\n      \"createdAt\": \"2026-02-18T10:00:00.000Z\"\n    }\n  },\n  \"meta\": {\n    \"requestId\": \"req_9f2c1a7e5b3d8f6041c2a9e7b5d3f1a0\",\n    \"timestamp\": \"2026-02-18T10:00:00.000Z\"\n  }\n}"
          }
        ],
        errors: [
          {
            status: 400,
            code: "VALIDATION_ERROR",
            when: "Invalid dispute reason"
          },
          {
            status: 401,
            code: "UNAUTHORIZED",
            when: "Missing or expired user session JWT"
          },
          {
            status: 403,
            code: "UNAUTHORIZED_DISPUTE",
            when: "Caller is not a party to this order"
          },
          {
            status: 409,
            code: "DISPUTE_ALREADY_OPEN",
            when: "Active dispute already exists for this order"
          }
        ]
      }
    ]
  },
  {
    name: "Disputes",
    description: "Participant dispute tracking and self-cancellation. Reasons: NOT_DELIVERED, QUALITY_ISSUE, OTHER.",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/disputes",
        title: "List disputes",
        description: "Lists disputes involving the authenticated user. Excludes internal admin queues.",
        controllerFile: "apps/api/src/modules/disputes/disputes.controller.ts",
        controllerHandler: "listDisputes",
        security: [
          {
            scheme: "userSessionAuth"
          }
        ],
        queryParams: [
          {
            name: "orderId",
            type: "string",
            required: false,
            description: "Filter disputes by order ID"
          },
          {
            name: "status",
            type: "select",
            required: false,
            description: "Filter by dispute status",
            options: [
              "OPEN",
              "UNDER_REVIEW",
              "RESOLVED"
            ]
          },
          {
            name: "openedBy",
            type: "select",
            required: false,
            description: "Filter by party who opened the dispute",
            options: [
              "BUYER",
              "SELLER"
            ]
          }
        ],
        responses: [
          {
            status: 200,
            label: "Disputes listed",
            body: "{\n  \"data\": {\n    \"success\": true,\n    \"data\": [\n      {\n        \"id\": \"dsp_1f2e3d4c5b6a708990a1b2c3d4e5f6a7\",\n        \"orderId\": \"ord_1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d\",\n        \"status\": \"OPEN\",\n        \"reason\": \"NOT_DELIVERED\",\n        \"openedBy\": \"BUYER\",\n        \"createdAt\": \"2026-02-18T10:00:00.000Z\"\n      }\n    ]\n  },\n  \"meta\": {\n    \"requestId\": \"req_9f2c1a7e5b3d8f6041c2a9e7b5d3f1a0\",\n    \"timestamp\": \"2026-02-18T10:00:00.000Z\"\n  }\n}"
          }
        ],
        errors: [
          {
            status: 401,
            code: "UNAUTHORIZED",
            when: "Missing or expired user session JWT"
          }
        ]
      },
      {
        method: "GET",
        path: "/api/v1/disputes/{id}",
        title: "Get dispute",
        description: "Retrieves dispute details and resolution timeline for a dispute the user participates in.",
        controllerFile: "apps/api/src/modules/disputes/disputes.controller.ts",
        controllerHandler: "getDispute",
        security: [
          {
            scheme: "userSessionAuth"
          }
        ],
        pathParams: [
          {
            name: "id",
            type: "string",
            required: true,
            description: "Dispute ID (dsp_...)"
          }
        ],
        responses: [
          {
            status: 200,
            label: "Dispute retrieved",
            body: "{\n  \"data\": {\n    \"success\": true,\n    \"data\": {\n      \"id\": \"dsp_1f2e3d4c5b6a708990a1b2c3d4e5f6a7\",\n      \"orderId\": \"ord_1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d\",\n      \"status\": \"OPEN\",\n      \"reason\": \"NOT_DELIVERED\",\n      \"openedBy\": \"BUYER\",\n      \"description\": \"Deliverables were not delivered by agreed milestone deadline\",\n      \"outcome\": null,\n      \"createdAt\": \"2026-02-18T10:00:00.000Z\"\n    }\n  },\n  \"meta\": {\n    \"requestId\": \"req_9f2c1a7e5b3d8f6041c2a9e7b5d3f1a0\",\n    \"timestamp\": \"2026-02-18T10:00:00.000Z\"\n  }\n}"
          }
        ],
        errors: [
          {
            status: 401,
            code: "UNAUTHORIZED",
            when: "Missing or expired user session JWT"
          },
          {
            status: 404,
            code: "DISPUTE_NOT_FOUND",
            when: "Dispute does not exist or caller is not authorized"
          }
        ]
      },
      {
        method: "POST",
        path: "/api/v1/disputes/{id}/cancel",
        title: "Cancel dispute",
        description: "Allows the opening party to withdraw and cancel an open dispute before platform resolution.",
        controllerFile: "apps/api/src/modules/disputes/disputes.controller.ts",
        controllerHandler: "cancelDispute",
        security: [
          {
            scheme: "userSessionAuth"
          }
        ],
        pathParams: [
          {
            name: "id",
            type: "string",
            required: true,
            description: "Dispute ID (dsp_...)"
          }
        ],
        responses: [
          {
            status: 200,
            label: "Dispute cancelled",
            body: "{\n  \"data\": {\n    \"success\": true,\n    \"data\": {\n      \"id\": \"dsp_1f2e3d4c5b6a708990a1b2c3d4e5f6a7\",\n      \"status\": \"RESOLVED\",\n      \"outcome\": \"CANCELLED_BY_OPENER\"\n    }\n  },\n  \"meta\": {\n    \"requestId\": \"req_9f2c1a7e5b3d8f6041c2a9e7b5d3f1a0\",\n    \"timestamp\": \"2026-02-18T10:00:00.000Z\"\n  }\n}"
          }
        ],
        errors: [
          {
            status: 401,
            code: "UNAUTHORIZED",
            when: "Missing or expired user session JWT"
          },
          {
            status: 403,
            code: "UNAUTHORIZED_DISPUTE",
            when: "Only the dispute opener can cancel the dispute"
          },
          {
            status: 404,
            code: "DISPUTE_NOT_FOUND",
            when: "Dispute not found"
          },
          {
            status: 409,
            code: "INVALID_STATE",
            when: "Dispute is already resolved"
          }
        ]
      }
    ]
  },
  {
    name: "KYC",
    description: "BlindPay KYC compliance and receiver onboarding for LATAM bank off-ramps.",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/users/me/kyc",
        title: "Get KYC status",
        description: "Retrieves BlindPay KYC compliance and receiver onboarding status for authenticated user.",
        controllerFile: "apps/api/src/modules/kyc/kyc.controller.ts",
        controllerHandler: "getKycStatus",
        security: [
          {
            scheme: "userSessionAuth"
          }
        ],
        responses: [
          {
            status: 200,
            label: "KYC status returned",
            body: "{\n  \"data\": {\n    \"id\": \"kyc_5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b\",\n    \"receiverId\": \"rec_1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d\",\n    \"status\": \"APPROVED\",\n    \"corridor\": \"BR\",\n    \"tosAccepted\": true,\n    \"createdAt\": \"2026-02-18T10:00:00.000Z\"\n  }\n}"
          }
        ],
        errors: [
          {
            status: 401,
            code: "UNAUTHORIZED",
            when: "Missing or expired user session JWT"
          },
          {
            status: 404,
            code: "KYC_NOT_FOUND",
            when: "No KYC verification record exists for user"
          }
        ]
      },
      {
        method: "POST",
        path: "/api/v1/users/me/kyc",
        title: "Submit KYC info",
        description: "Submits receiver onboarding details to BlindPay. Supported corridors: Brazil (BR), Mexico (MX), Argentina (AR), Colombia (CO).",
        controllerFile: "apps/api/src/modules/kyc/kyc.controller.ts",
        controllerHandler: "submitKyc",
        security: [
          {
            scheme: "userSessionAuth"
          }
        ],
        requestBody: {
          contentType: "application/json",
          example: "{\n  \"type\": \"INDIVIDUAL\",\n  \"country\": \"BR\",\n  \"taxId\": \"123.456.789-00\",\n  \"name\": \"Maria Silva\",\n  \"dateOfBirth\": \"1990-05-15\"\n}",
          schema: {
            name: "SubmitKycRequest",
            type: "object",
            required: [
              "type",
              "country",
              "taxId",
              "name"
            ],
            properties: {
              type: {
                type: "string",
                enum: [
                  "INDIVIDUAL",
                  "BUSINESS"
                ]
              },
              country: {
                type: "string",
                enum: [
                  "BR",
                  "MX",
                  "AR",
                  "CO"
                ],
                description: "Exactly 4 supported LATAM corridors"
              },
              taxId: {
                type: "string"
              },
              name: {
                type: "string"
              },
              dateOfBirth: {
                type: "string",
                format: "date"
              }
            }
          }
        },
        responses: [
          {
            status: 201,
            label: "KYC record created",
            body: "{\n  \"data\": {\n    \"id\": \"kyc_5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b\",\n    \"receiverId\": \"rec_1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d\",\n    \"status\": \"PENDING\",\n    \"tosUrl\": \"https://docs.blindpay.com/tos/terms-of-service\"\n  }\n}"
          }
        ],
        errors: [
          {
            status: 400,
            code: "VALIDATION_ERROR",
            when: "Invalid tax ID or format"
          },
          {
            status: 400,
            code: "UNSUPPORTED_CORRIDOR",
            when: "Country not in [BR, MX, AR, CO]"
          },
          {
            status: 401,
            code: "UNAUTHORIZED",
            when: "Missing or expired user session JWT"
          },
          {
            status: 409,
            code: "KYC_ALREADY_EXISTS",
            when: "KYC profile already created for user"
          }
        ]
      },
      {
        method: "POST",
        path: "/api/v1/users/me/kyc/tos-url",
        title: "Get ToS acceptance URL",
        description: "Generates a hosted BlindPay Terms of Service acceptance URL for the user.",
        controllerFile: "apps/api/src/modules/kyc/kyc.controller.ts",
        controllerHandler: "getTosUrl",
        security: [
          {
            scheme: "userSessionAuth"
          }
        ],
        responses: [
          {
            status: 200,
            label: "ToS URL generated",
            body: "{\n  \"data\": {\n    \"tosUrl\": \"https://docs.blindpay.com/tos/terms-of-service?token=xyz\"\n  }\n}"
          }
        ],
        errors: [
          {
            status: 401,
            code: "UNAUTHORIZED",
            when: "Missing or expired user session JWT"
          },
          {
            status: 404,
            code: "KYC_NOT_FOUND",
            when: "User has not submitted initial KYC"
          }
        ]
      },
      {
        method: "POST",
        path: "/api/v1/users/me/kyc/tos-accept",
        title: "Accept ToS",
        description: "Records user acceptance of BlindPay Terms of Service.",
        controllerFile: "apps/api/src/modules/kyc/kyc.controller.ts",
        controllerHandler: "acceptTos",
        security: [
          {
            scheme: "userSessionAuth"
          }
        ],
        requestBody: {
          contentType: "application/json",
          example: "{\n  \"ipAddress\": \"192.0.2.1\"\n}",
          schema: {
            name: "AcceptTosRequest",
            type: "object",
            required: [
              "ipAddress"
            ],
            properties: {
              ipAddress: {
                type: "string"
              }
            }
          }
        },
        responses: [
          {
            status: 200,
            label: "ToS accepted",
            body: "{\n  \"data\": {\n    \"success\": true,\n    \"tosAcceptedAt\": \"2026-02-18T10:30:00.000Z\"\n  }\n}"
          }
        ],
        errors: [
          {
            status: 400,
            code: "VALIDATION_ERROR",
            when: "Missing client IP address"
          },
          {
            status: 401,
            code: "UNAUTHORIZED",
            when: "Missing or expired user session JWT"
          },
          {
            status: 404,
            code: "KYC_NOT_FOUND",
            when: "KYC profile not found"
          }
        ]
      }
    ]
  },
  {
    name: "Bank Accounts",
    description: "Local bank account management for BlindPay fiat off-ramp payouts in Brazil, Mexico, Argentina, and Colombia.",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/users/me/bank-accounts",
        title: "List bank accounts",
        description: "Lists verified bank accounts configured for BlindPay payouts in the 4 supported corridors (Brazil, Mexico, Argentina, Colombia).",
        controllerFile: "apps/api/src/modules/bank-accounts/bank-accounts.controller.ts",
        controllerHandler: "listBankAccounts",
        security: [
          {
            scheme: "userSessionAuth"
          }
        ],
        responses: [
          {
            status: 200,
            label: "Bank accounts listed",
            body: "{\n  \"data\": [\n    {\n      \"id\": \"ba_7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f\",\n      \"country\": \"BR\",\n      \"currency\": \"BRL\",\n      \"bankName\": \"Banco do Brasil\",\n      \"accountNumber\": \"******1234\",\n      \"isDefault\": true,\n      \"createdAt\": \"2026-02-18T10:00:00.000Z\"\n    }\n  ]\n}"
          }
        ],
        errors: [
          {
            status: 401,
            code: "UNAUTHORIZED",
            when: "Missing or expired user session JWT"
          }
        ]
      },
      {
        method: "POST",
        path: "/api/v1/users/me/bank-accounts",
        title: "Add bank account",
        description: "Registers a local bank account for payouts. Supported countries: BR, MX, AR, CO.",
        controllerFile: "apps/api/src/modules/bank-accounts/bank-accounts.controller.ts",
        controllerHandler: "addBankAccount",
        security: [
          {
            scheme: "userSessionAuth"
          }
        ],
        requestBody: {
          contentType: "application/json",
          example: "{\n  \"country\": \"BR\",\n  \"currency\": \"BRL\",\n  \"accountType\": \"CHECKING\",\n  \"routingNumber\": \"001\",\n  \"accountNumber\": \"12345678\",\n  \"ownerName\": \"Maria Silva\",\n  \"taxId\": \"123.456.789-00\"\n}",
          schema: {
            name: "AddBankAccountRequest",
            type: "object",
            required: [
              "country",
              "currency",
              "accountType",
              "accountNumber",
              "ownerName",
              "taxId"
            ],
            properties: {
              country: {
                type: "string",
                enum: [
                  "BR",
                  "MX",
                  "AR",
                  "CO"
                ]
              },
              currency: {
                type: "string",
                enum: [
                  "BRL",
                  "MXN",
                  "ARS",
                  "COP"
                ]
              },
              accountType: {
                type: "string",
                enum: [
                  "CHECKING",
                  "SAVINGS"
                ]
              },
              routingNumber: {
                type: "string"
              },
              accountNumber: {
                type: "string"
              },
              ownerName: {
                type: "string"
              },
              taxId: {
                type: "string"
              }
            }
          }
        },
        responses: [
          {
            status: 201,
            label: "Bank account added",
            body: "{\n  \"data\": {\n    \"id\": \"ba_7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f\",\n    \"country\": \"BR\",\n    \"currency\": \"BRL\",\n    \"bankName\": \"Banco do Brasil\",\n    \"accountNumber\": \"******1234\",\n    \"isDefault\": false\n  }\n}"
          }
        ],
        errors: [
          {
            status: 400,
            code: "VALIDATION_ERROR",
            when: "Invalid bank account or routing details"
          },
          {
            status: 400,
            code: "UNSUPPORTED_CORRIDOR",
            when: "Country not in [BR, MX, AR, CO]"
          },
          {
            status: 401,
            code: "UNAUTHORIZED",
            when: "Missing or expired user session JWT"
          }
        ]
      },
      {
        method: "PATCH",
        path: "/api/v1/users/me/bank-accounts/{id}/default",
        title: "Set default bank account",
        description: "Sets the designated bank account as the primary payout destination for that corridor.",
        controllerFile: "apps/api/src/modules/bank-accounts/bank-accounts.controller.ts",
        controllerHandler: "setDefaultBankAccount",
        security: [
          {
            scheme: "userSessionAuth"
          }
        ],
        pathParams: [
          {
            name: "id",
            type: "string",
            required: true,
            description: "Bank account ID (ba_...)"
          }
        ],
        responses: [
          {
            status: 200,
            label: "Default bank account updated",
            body: "{\n  \"data\": {\n    \"id\": \"ba_7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f\",\n    \"isDefault\": true\n  }\n}"
          }
        ],
        errors: [
          {
            status: 401,
            code: "UNAUTHORIZED",
            when: "Missing or expired user session JWT"
          },
          {
            status: 404,
            code: "BANK_ACCOUNT_NOT_FOUND",
            when: "Bank account not found"
          }
        ]
      },
      {
        method: "DELETE",
        path: "/api/v1/users/me/bank-accounts/{id}",
        title: "Delete bank account",
        description: "Removes a bank account from authenticated user account.",
        controllerFile: "apps/api/src/modules/bank-accounts/bank-accounts.controller.ts",
        controllerHandler: "deleteBankAccount",
        security: [
          {
            scheme: "userSessionAuth"
          }
        ],
        pathParams: [
          {
            name: "id",
            type: "string",
            required: true,
            description: "Bank account ID (ba_...)"
          }
        ],
        responses: [
          {
            status: 200,
            label: "Bank account removed",
            body: "{\n  \"data\": {\n    \"success\": true\n  }\n}"
          }
        ],
        errors: [
          {
            status: 401,
            code: "UNAUTHORIZED",
            when: "Missing or expired user session JWT"
          },
          {
            status: 404,
            code: "BANK_ACCOUNT_NOT_FOUND",
            when: "Bank account not found"
          }
        ]
      }
    ]
  },
  {
    name: "Payouts",
    description: "BlindPay bank off-ramp payouts in Brazil, Mexico, Argentina, and Colombia.",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/orders/{id}/payout",
        title: "Get order payout",
        description: "Retrieves off-ramp bank payout status for a released order. Statuses: PENDING, PROCESSING, COMPLETED, FAILED, REFUNDED, ON_HOLD, AWAITING_SIGNATURE.",
        controllerFile: "apps/api/src/modules/payouts/payouts.controller.ts",
        controllerHandler: "getOrderPayout",
        security: [
          {
            scheme: "userSessionAuth"
          }
        ],
        pathParams: [
          {
            name: "id",
            type: "string",
            required: true,
            description: "Order ID (ord_...)"
          }
        ],
        responses: [
          {
            status: 200,
            label: "Payout details returned",
            body: "{\n  \"data\": {\n    \"id\": \"pay_3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a\",\n    \"orderId\": \"ord_1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d\",\n    \"amount\": \"2500.00\",\n    \"currency\": \"USDC\",\n    \"bankAccountId\": \"ba_7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f\",\n    \"corridor\": \"BR\",\n    \"status\": \"COMPLETED\",\n    \"fiatAmount\": \"12500.00\",\n    \"fiatCurrency\": \"BRL\",\n    \"completedAt\": \"2026-02-18T12:00:00.000Z\"\n  }\n}"
          }
        ],
        errors: [
          {
            status: 401,
            code: "UNAUTHORIZED",
            when: "Missing or expired user session JWT"
          },
          {
            status: 404,
            code: "PAYOUT_NOT_FOUND",
            when: "No payout record exists for this order"
          }
        ]
      },
      {
        method: "POST",
        path: "/api/v1/orders/{orderId}/payout/prepare",
        title: "Prepare bank payout",
        description: "Prepares an unsigned transaction for BlindPay off-ramp to seller's local bank account. Minimum quote amount: 5.00 USD.",
        controllerFile: "apps/api/src/modules/payouts/payouts.controller.ts",
        controllerHandler: "preparePayout",
        security: [
          {
            scheme: "userSessionAuth"
          }
        ],
        pathParams: [
          {
            name: "orderId",
            type: "string",
            required: true,
            description: "Order ID (ord_...)"
          }
        ],
        requestBody: {
          contentType: "application/json",
          example: "{\n  \"bankAccountId\": \"ba_7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f\"\n}",
          schema: {
            name: "PreparePayoutRequest",
            type: "object",
            required: [
              "bankAccountId"
            ],
            properties: {
              bankAccountId: {
                type: "string"
              }
            }
          }
        },
        responses: [
          {
            status: 200,
            label: "Payout quote and transaction prepared",
            body: "{\n  \"data\": {\n    \"payoutId\": \"pay_3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a\",\n    \"unsignedXdr\": \"AAAAAgAAAADe5t8k3m1...\",\n    \"quoteAmount\": \"12500.00\",\n    \"quoteCurrency\": \"BRL\",\n    \"sourceAmount\": \"2500.00\"\n  }\n}"
          }
        ],
        errors: [
          {
            status: 400,
            code: "VALIDATION_ERROR",
            when: "Missing bank account ID"
          },
          {
            status: 400,
            code: "PAYOUTS_AMOUNT_BELOW_MINIMUM",
            when: "Amount is below the minimum 5.00 USD (or rail-specific minimum)"
          },
          {
            status: 401,
            code: "UNAUTHORIZED",
            when: "Missing or expired user session JWT"
          },
          {
            status: 403,
            code: "LIMITS_VOLUME_EXCEEDED",
            when: "Receiver transaction volume limit exceeded"
          },
          {
            status: 404,
            code: "BANK_ACCOUNT_NOT_FOUND",
            when: "Bank account not found or unsupported for seller corridor"
          }
        ]
      },
      {
        method: "POST",
        path: "/api/v1/orders/{orderId}/payout/submit",
        title: "Submit bank payout",
        description: "Submits client-signed off-ramp payout transaction to BlindPay. Requires Idempotency-Key header.",
        controllerFile: "apps/api/src/modules/payouts/payouts.controller.ts",
        controllerHandler: "submitPayout",
        security: [
          {
            scheme: "userSessionAuth"
          }
        ],
        headerParams: [
          {
            name: "Idempotency-Key",
            type: "string",
            required: true,
            description: "Unique key to ensure idempotent payout execution.",
            placeholder: "idem_1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d"
          }
        ],
        pathParams: [
          {
            name: "orderId",
            type: "string",
            required: true,
            description: "Order ID (ord_...)"
          }
        ],
        requestBody: {
          contentType: "application/json",
          example: "{\n  \"payoutId\": \"pay_3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a\",\n  \"signedXdr\": \"AAAAAgAAAADe5t8k3m1...\"\n}",
          schema: {
            name: "SubmitPayoutRequest",
            type: "object",
            required: [
              "payoutId",
              "signedXdr"
            ],
            properties: {
              payoutId: {
                type: "string"
              },
              signedXdr: {
                type: "string"
              }
            }
          }
        },
        responses: [
          {
            status: 200,
            label: "Payout processing initiated",
            body: "{\n  \"data\": {\n    \"id\": \"pay_3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a\",\n    \"status\": \"PROCESSING\",\n    \"transactionHash\": \"3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e\"\n  }\n}"
          }
        ],
        errors: [
          {
            status: 400,
            code: "VALIDATION_ERROR",
            when: "Invalid signedXdr or payoutId format"
          },
          {
            status: 401,
            code: "UNAUTHORIZED",
            when: "Missing or expired user session JWT"
          },
          {
            status: 409,
            code: "IDEMPOTENCY_CONFLICT",
            when: "Idempotency key reused with different payload"
          },
          {
            status: 502,
            code: "PROVIDER_ERROR",
            when: "BlindPay off-ramp rails returned provider error"
          }
        ]
      },
      {
        method: "POST",
        path: "/api/v1/orders/{orderId}/payout/retry",
        title: "Retry bank payout",
        description: "Retries a failed payout, optionally specifying a replacement bank account for the same corridor.",
        controllerFile: "apps/api/src/modules/payouts/payouts.controller.ts",
        controllerHandler: "retryPayout",
        security: [
          {
            scheme: "userSessionAuth"
          }
        ],
        pathParams: [
          {
            name: "orderId",
            type: "string",
            required: true,
            description: "Order ID (ord_...)"
          }
        ],
        requestBody: {
          contentType: "application/json",
          example: "{\n  \"bankAccountId\": \"ba_7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f\"\n}",
          schema: {
            name: "RetryPayoutRequest",
            type: "object",
            properties: {
              bankAccountId: {
                type: "string"
              }
            }
          }
        },
        responses: [
          {
            status: 200,
            label: "Payout retry initiated",
            body: "{\n  \"data\": {\n    \"id\": \"pay_3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a\",\n    \"status\": \"PROCESSING\"\n  }\n}"
          }
        ],
        errors: [
          {
            status: 401,
            code: "UNAUTHORIZED",
            when: "Missing or expired user session JWT"
          },
          {
            status: 404,
            code: "PAYOUT_NOT_FOUND",
            when: "Payout not found"
          },
          {
            status: 409,
            code: "INVALID_STATE",
            when: "Payout is not in FAILED or REFUNDED state"
          }
        ]
      }
    ]
  },
  {
    name: "Withdrawals",
    description: "Historical withdrawal records and payout transaction auditing.",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/withdrawals",
        title: "List withdrawals",
        description: "Lists historical on-chain and fiat withdrawal records. Requires read scope.",
        controllerFile: "apps/api/src/modules/withdrawals/withdrawals.controller.ts",
        controllerHandler: "listWithdrawals",
        security: [
          {
            scheme: "apiKeyAuth",
            scopes: [
              "read"
            ]
          }
        ],
        queryParams: [
          {
            name: "userId",
            type: "string",
            required: false,
            description: "Filter by user ID"
          },
          {
            name: "limit",
            type: "number",
            required: false,
            description: "Maximum records (1-100)"
          },
          {
            name: "cursor",
            type: "string",
            required: false,
            description: "Pagination cursor"
          }
        ],
        responses: [
          {
            status: 200,
            label: "Withdrawals listed",
            body: "{\n  \"data\": {\n    \"data\": [\n      {\n        \"id\": \"wd_2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e\",\n        \"userId\": \"usr_9f2c1a7e5b3d8f6041c2a9e7b5d3f1a0\",\n        \"amount\": \"80.00\",\n        \"currency\": \"USDC\",\n        \"status\": \"WITHDRAWAL_COMPLETED\",\n        \"createdAt\": \"2026-02-18T10:00:00.000Z\"\n      }\n    ],\n    \"hasMore\": false,\n    \"nextCursor\": null\n  },\n  \"meta\": {\n    \"requestId\": \"req_9f2c1a7e5b3d8f6041c2a9e7b5d3f1a0\",\n    \"timestamp\": \"2026-02-18T10:00:00.000Z\"\n  }\n}"
          }
        ],
        errors: [
          {
            status: 401,
            code: "UNAUTHORIZED",
            when: "Missing or invalid API key credential"
          },
          {
            status: 403,
            code: "INSUFFICIENT_SCOPE",
            when: "API key lacks read scope"
          }
        ]
      },
      {
        method: "GET",
        path: "/api/v1/withdrawals/{id}",
        title: "Get withdrawal",
        description: "Retrieves withdrawal details. Statuses: WITHDRAWAL_CREATED, WITHDRAWAL_COMMITTED, WITHDRAWAL_PENDING, WITHDRAWAL_PENDING_USER_ACTION, WITHDRAWAL_COMPLETED, WITHDRAWAL_FAILED, WITHDRAWAL_CANCELED.",
        controllerFile: "apps/api/src/modules/withdrawals/withdrawals.controller.ts",
        controllerHandler: "getWithdrawal",
        security: [
          {
            scheme: "apiKeyAuth",
            scopes: [
              "read"
            ]
          }
        ],
        pathParams: [
          {
            name: "id",
            type: "string",
            required: true,
            description: "Withdrawal ID (wd_...)"
          }
        ],
        responses: [
          {
            status: 200,
            label: "Withdrawal returned",
            body: "{\n  \"data\": {\n    \"id\": \"wd_2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e\",\n    \"userId\": \"usr_9f2c1a7e5b3d8f6041c2a9e7b5d3f1a0\",\n    \"amount\": \"80.00\",\n    \"currency\": \"USDC\",\n    \"status\": \"WITHDRAWAL_COMPLETED\",\n    \"destinationAddress\": \"GABCMX76J6XFMH67QJ5J4K2VXZ4QW6A6Y53GHEKRO42N...\",\n    \"createdAt\": \"2026-02-18T10:00:00.000Z\"\n  },\n  \"meta\": {\n    \"requestId\": \"req_9f2c1a7e5b3d8f6041c2a9e7b5d3f1a0\",\n    \"timestamp\": \"2026-02-18T10:00:00.000Z\"\n  }\n}"
          }
        ],
        errors: [
          {
            status: 401,
            code: "UNAUTHORIZED",
            when: "Missing or invalid API key credential"
          },
          {
            status: 403,
            code: "INSUFFICIENT_SCOPE",
            when: "API key lacks read scope"
          },
          {
            status: 404,
            code: "WITHDRAWAL_NOT_FOUND",
            when: "Withdrawal record not found"
          }
        ]
      }
    ]
  },
  {
    name: "Balance",
    description: "Internal marketplace ledger balances, reservations, reconciliation, and settlement operations.",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/users/{userId}/balance",
        title: "Get user balance",
        description: "Reads available and reserved ledger balance for user. Requires read scope.",
        controllerFile: "apps/api/src/modules/balance/balance.controller.ts",
        controllerHandler: "getBalance",
        security: [
          {
            scheme: "apiKeyAuth",
            scopes: [
              "read"
            ]
          }
        ],
        pathParams: [
          {
            name: "userId",
            type: "string",
            required: true,
            description: "User ID (usr_...)"
          }
        ],
        responses: [
          {
            status: 200,
            label: "Balance retrieved",
            body: "{\n  \"data\": {\n    \"user_id\": \"usr_9f2c1a7e5b3d8f6041c2a9e7b5d3f1a0\",\n    \"available\": \"1250.00\",\n    \"reserved\": \"200.00\",\n    \"total\": \"1450.00\",\n    \"currency\": \"USD\",\n    \"updated_at\": \"2026-02-18T10:00:00.000Z\"\n  },\n  \"meta\": {\n    \"requestId\": \"req_9f2c1a7e5b3d8f6041c2a9e7b5d3f1a0\",\n    \"timestamp\": \"2026-02-18T10:00:00.000Z\"\n  }\n}"
          }
        ],
        errors: [
          {
            status: 401,
            code: "UNAUTHORIZED",
            when: "Missing or invalid API key credential"
          },
          {
            status: 403,
            code: "INSUFFICIENT_SCOPE",
            when: "API key lacks read scope"
          },
          {
            status: 404,
            code: "USER_NOT_FOUND",
            when: "User balance not found"
          }
        ]
      },
      {
        method: "POST",
        path: "/api/v1/users/{userId}/balance/credit",
        title: "Credit available balance",
        description: "Credits funds directly to user available balance. Requires write scope.",
        controllerFile: "apps/api/src/modules/balance/balance.controller.ts",
        controllerHandler: "creditAvailable",
        security: [
          {
            scheme: "apiKeyAuth",
            scopes: [
              "write"
            ]
          }
        ],
        pathParams: [
          {
            name: "userId",
            type: "string",
            required: true,
            description: "User ID (usr_...)"
          }
        ],
        requestBody: {
          contentType: "application/json",
          example: "{\n  \"amount\": \"100.00\",\n  \"currency\": \"USD\",\n  \"reference\": \"promo_credit_1\",\n  \"reason\": \"Referral bonus\"\n}",
          schema: {
            name: "CreditAvailableRequest",
            type: "object",
            required: [
              "amount"
            ],
            properties: {
              amount: {
                type: "string"
              },
              currency: {
                type: "string",
                default: "USD"
              },
              reference: {
                type: "string"
              },
              reason: {
                type: "string"
              }
            }
          }
        },
        responses: [
          {
            status: 200,
            label: "Balance credited",
            body: "{\n  \"data\": {\n    \"user_id\": \"usr_9f2c1a7e5b3d8f6041c2a9e7b5d3f1a0\",\n    \"available\": \"1350.00\",\n    \"reserved\": \"200.00\",\n    \"total\": \"1550.00\",\n    \"currency\": \"USD\",\n    \"updated_at\": \"2026-02-18T10:00:00.000Z\"\n  },\n  \"meta\": {\n    \"requestId\": \"req_9f2c1a7e5b3d8f6041c2a9e7b5d3f1a0\",\n    \"timestamp\": \"2026-02-18T10:00:00.000Z\"\n  }\n}"
          }
        ],
        errors: [
          {
            status: 400,
            code: "VALIDATION_ERROR",
            when: "Invalid amount format"
          },
          {
            status: 401,
            code: "UNAUTHORIZED",
            when: "Missing or invalid API key credential"
          },
          {
            status: 403,
            code: "INSUFFICIENT_SCOPE",
            when: "API key lacks write scope"
          },
          {
            status: 404,
            code: "USER_NOT_FOUND",
            when: "User balance not found"
          },
          {
            status: 409,
            code: "BALANCE_CONCURRENCY_CONFLICT",
            when: "Optimistic concurrency version conflict during update"
          }
        ]
      },
      {
        method: "POST",
        path: "/api/v1/users/{userId}/balance/debit",
        title: "Debit available balance",
        description: "Debits funds from user available balance. Requires write scope.",
        controllerFile: "apps/api/src/modules/balance/balance.controller.ts",
        controllerHandler: "debitAvailable",
        security: [
          {
            scheme: "apiKeyAuth",
            scopes: [
              "write"
            ]
          }
        ],
        pathParams: [
          {
            name: "userId",
            type: "string",
            required: true,
            description: "User ID (usr_...)"
          }
        ],
        requestBody: {
          contentType: "application/json",
          example: "{\n  \"amount\": \"100.00\",\n  \"currency\": \"USD\",\n  \"reference\": \"platform_fee_1\",\n  \"reason\": \"Platform fee\"\n}",
          schema: {
            name: "DebitAvailableRequest",
            type: "object",
            required: [
              "amount"
            ],
            properties: {
              amount: {
                type: "string"
              },
              currency: {
                type: "string",
                default: "USD"
              },
              reference: {
                type: "string"
              },
              reason: {
                type: "string"
              }
            }
          }
        },
        responses: [
          {
            status: 200,
            label: "Balance debited",
            body: "{\n  \"data\": {\n    \"user_id\": \"usr_9f2c1a7e5b3d8f6041c2a9e7b5d3f1a0\",\n    \"available\": \"1150.00\",\n    \"reserved\": \"200.00\",\n    \"total\": \"1350.00\",\n    \"currency\": \"USD\",\n    \"updated_at\": \"2026-02-18T10:00:00.000Z\"\n  },\n  \"meta\": {\n    \"requestId\": \"req_9f2c1a7e5b3d8f6041c2a9e7b5d3f1a0\",\n    \"timestamp\": \"2026-02-18T10:00:00.000Z\"\n  }\n}"
          }
        ],
        errors: [
          {
            status: 400,
            code: "VALIDATION_ERROR",
            when: "Invalid amount format"
          },
          {
            status: 401,
            code: "UNAUTHORIZED",
            when: "Missing or invalid API key credential"
          },
          {
            status: 403,
            code: "INSUFFICIENT_SCOPE",
            when: "API key lacks write scope"
          },
          {
            status: 404,
            code: "USER_NOT_FOUND",
            when: "User balance not found"
          },
          {
            status: 409,
            code: "BALANCE_CONCURRENCY_CONFLICT",
            when: "Optimistic concurrency conflict"
          },
          {
            status: 422,
            code: "INSUFFICIENT_FUNDS",
            when: "Available balance is less than debit amount"
          }
        ]
      },
      {
        method: "POST",
        path: "/api/v1/users/{userId}/balance/reserve",
        title: "Reserve funds",
        description: "Moves funds from available to reserved balance for an order. Requires write scope.",
        controllerFile: "apps/api/src/modules/balance/balance.controller.ts",
        controllerHandler: "reserve",
        security: [
          {
            scheme: "apiKeyAuth",
            scopes: [
              "write"
            ]
          }
        ],
        pathParams: [
          {
            name: "userId",
            type: "string",
            required: true,
            description: "User ID (usr_...)"
          }
        ],
        requestBody: {
          contentType: "application/json",
          example: "{\n  \"amount\": \"200.00\",\n  \"orderId\": \"ord_1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d\",\n  \"currency\": \"USD\"\n}",
          schema: {
            name: "ReserveBalanceRequest",
            type: "object",
            required: [
              "amount",
              "orderId"
            ],
            properties: {
              amount: {
                type: "string"
              },
              orderId: {
                type: "string"
              },
              currency: {
                type: "string",
                default: "USD"
              }
            }
          }
        },
        responses: [
          {
            status: 200,
            label: "Funds reserved",
            body: "{\n  \"data\": {\n    \"user_id\": \"usr_9f2c1a7e5b3d8f6041c2a9e7b5d3f1a0\",\n    \"available\": \"1050.00\",\n    \"reserved\": \"400.00\",\n    \"total\": \"1450.00\",\n    \"currency\": \"USD\",\n    \"updated_at\": \"2026-02-18T10:00:00.000Z\"\n  },\n  \"meta\": {\n    \"requestId\": \"req_9f2c1a7e5b3d8f6041c2a9e7b5d3f1a0\",\n    \"timestamp\": \"2026-02-18T10:00:00.000Z\"\n  }\n}"
          }
        ],
        errors: [
          {
            status: 400,
            code: "VALIDATION_ERROR",
            when: "Invalid amount or order ID"
          },
          {
            status: 401,
            code: "UNAUTHORIZED",
            when: "Missing or invalid API key credential"
          },
          {
            status: 403,
            code: "INSUFFICIENT_SCOPE",
            when: "API key lacks write scope"
          },
          {
            status: 404,
            code: "USER_NOT_FOUND",
            when: "User balance not found"
          },
          {
            status: 409,
            code: "FUNDS_ALREADY_RESERVED",
            when: "Order reservation already exists"
          },
          {
            status: 422,
            code: "INSUFFICIENT_FUNDS",
            when: "Available balance is less than requested amount"
          }
        ]
      },
      {
        method: "POST",
        path: "/api/v1/users/{userId}/balance/release",
        title: "Release reserved funds",
        description: "Transfers reserved funds from buyer to seller available balance. Requires write scope.",
        controllerFile: "apps/api/src/modules/balance/balance.controller.ts",
        controllerHandler: "release",
        security: [
          {
            scheme: "apiKeyAuth",
            scopes: [
              "write"
            ]
          }
        ],
        pathParams: [
          {
            name: "userId",
            type: "string",
            required: true,
            description: "User ID (usr_...)"
          }
        ],
        requestBody: {
          contentType: "application/json",
          example: "{\n  \"amount\": \"200.00\",\n  \"orderId\": \"ord_1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d\",\n  \"sellerId\": \"usr_7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e\",\n  \"currency\": \"USD\"\n}",
          schema: {
            name: "ReleaseBalanceRequest",
            type: "object",
            required: [
              "amount",
              "orderId",
              "sellerId"
            ],
            properties: {
              amount: {
                type: "string"
              },
              orderId: {
                type: "string"
              },
              sellerId: {
                type: "string"
              },
              currency: {
                type: "string",
                default: "USD"
              }
            }
          }
        },
        responses: [
          {
            status: 200,
            label: "Funds released",
            body: "{\n  \"data\": {\n    \"user_id\": \"usr_9f2c1a7e5b3d8f6041c2a9e7b5d3f1a0\",\n    \"available\": \"1050.00\",\n    \"reserved\": \"200.00\",\n    \"total\": \"1250.00\",\n    \"currency\": \"USD\",\n    \"updated_at\": \"2026-02-18T10:00:00.000Z\"\n  },\n  \"meta\": {\n    \"requestId\": \"req_9f2c1a7e5b3d8f6041c2a9e7b5d3f1a0\",\n    \"timestamp\": \"2026-02-18T10:00:00.000Z\"\n  }\n}"
          }
        ],
        errors: [
          {
            status: 400,
            code: "VALIDATION_ERROR",
            when: "Missing required fields"
          },
          {
            status: 401,
            code: "UNAUTHORIZED",
            when: "Missing or invalid API key credential"
          },
          {
            status: 403,
            code: "INSUFFICIENT_SCOPE",
            when: "API key lacks write scope"
          },
          {
            status: 404,
            code: "RESERVE_NOT_FOUND",
            when: "No active reservation for order"
          }
        ]
      },
      {
        method: "POST",
        path: "/api/v1/users/{userId}/balance/cancel-reservation",
        title: "Cancel reservation",
        description: "Releases reserved funds back into user available balance. Requires write scope.",
        controllerFile: "apps/api/src/modules/balance/balance.controller.ts",
        controllerHandler: "cancelReservation",
        security: [
          {
            scheme: "apiKeyAuth",
            scopes: [
              "write"
            ]
          }
        ],
        pathParams: [
          {
            name: "userId",
            type: "string",
            required: true,
            description: "User ID (usr_...)"
          }
        ],
        requestBody: {
          contentType: "application/json",
          example: "{\n  \"orderId\": \"ord_1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d\",\n  \"amount\": \"200.00\"\n}",
          schema: {
            name: "CancelReservationRequest",
            type: "object",
            required: [
              "orderId",
              "amount"
            ],
            properties: {
              orderId: {
                type: "string"
              },
              amount: {
                type: "string"
              }
            }
          }
        },
        responses: [
          {
            status: 200,
            label: "Reservation cancelled",
            body: "{\n  \"data\": {\n    \"user_id\": \"usr_9f2c1a7e5b3d8f6041c2a9e7b5d3f1a0\",\n    \"available\": \"1250.00\",\n    \"reserved\": \"200.00\",\n    \"total\": \"1450.00\",\n    \"currency\": \"USD\",\n    \"updated_at\": \"2026-02-18T10:00:00.000Z\"\n  },\n  \"meta\": {\n    \"requestId\": \"req_9f2c1a7e5b3d8f6041c2a9e7b5d3f1a0\",\n    \"timestamp\": \"2026-02-18T10:00:00.000Z\"\n  }\n}"
          }
        ],
        errors: [
          {
            status: 401,
            code: "UNAUTHORIZED",
            when: "Missing or invalid API key credential"
          },
          {
            status: 403,
            code: "INSUFFICIENT_SCOPE",
            when: "API key lacks write scope"
          },
          {
            status: 404,
            code: "RESERVE_NOT_FOUND",
            when: "No matching reservation"
          }
        ]
      },
      {
        method: "POST",
        path: "/api/v1/users/{userId}/balance/deduct-reserved",
        title: "Deduct reserved balance",
        description: "Deducts reserved balance permanently when funding smart contract escrow. Requires write scope.",
        controllerFile: "apps/api/src/modules/balance/balance.controller.ts",
        controllerHandler: "deductReserved",
        security: [
          {
            scheme: "apiKeyAuth",
            scopes: [
              "write"
            ]
          }
        ],
        pathParams: [
          {
            name: "userId",
            type: "string",
            required: true,
            description: "User ID (usr_...)"
          }
        ],
        requestBody: {
          contentType: "application/json",
          example: "{\n  \"amount\": \"200.00\",\n  \"orderId\": \"ord_1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d\"\n}",
          schema: {
            name: "DeductReservedRequest",
            type: "object",
            required: [
              "amount",
              "orderId"
            ],
            properties: {
              amount: {
                type: "string"
              },
              orderId: {
                type: "string"
              }
            }
          }
        },
        responses: [
          {
            status: 200,
            label: "Reserved balance deducted",
            body: "{\n  \"data\": {\n    \"user_id\": \"usr_9f2c1a7e5b3d8f6041c2a9e7b5d3f1a0\",\n    \"available\": \"1250.00\",\n    \"reserved\": \"0.00\",\n    \"total\": \"1250.00\",\n    \"currency\": \"USD\",\n    \"updated_at\": \"2026-02-18T10:00:00.000Z\"\n  },\n  \"meta\": {\n    \"requestId\": \"req_9f2c1a7e5b3d8f6041c2a9e7b5d3f1a0\",\n    \"timestamp\": \"2026-02-18T10:00:00.000Z\"\n  }\n}"
          }
        ],
        errors: [
          {
            status: 401,
            code: "UNAUTHORIZED",
            when: "Missing or invalid API key credential"
          },
          {
            status: 403,
            code: "INSUFFICIENT_SCOPE",
            when: "API key lacks write scope"
          },
          {
            status: 404,
            code: "RESERVE_NOT_FOUND",
            when: "No matching reservation"
          }
        ]
      },
      {
        method: "POST",
        path: "/api/v1/users/{userId}/balance/sync",
        title: "Sync balance",
        description: "Synchronizes local ledger balance with payment provider. Requires write scope.",
        controllerFile: "apps/api/src/modules/balance/balance.controller.ts",
        controllerHandler: "sync",
        security: [
          {
            scheme: "apiKeyAuth",
            scopes: [
              "write"
            ]
          }
        ],
        pathParams: [
          {
            name: "userId",
            type: "string",
            required: true,
            description: "User ID (usr_...)"
          }
        ],
        responses: [
          {
            status: 200,
            label: "Balance synced",
            body: "{\n  \"data\": {\n    \"user_id\": \"usr_9f2c1a7e5b3d8f6041c2a9e7b5d3f1a0\",\n    \"synced\": true,\n    \"previous_balance\": \"1250.00\",\n    \"current_balance\": \"1250.00\",\n    \"currency\": \"USD\"\n  },\n  \"meta\": {\n    \"requestId\": \"req_9f2c1a7e5b3d8f6041c2a9e7b5d3f1a0\",\n    \"timestamp\": \"2026-02-18T10:00:00.000Z\"\n  }\n}"
          }
        ],
        errors: [
          {
            status: 401,
            code: "UNAUTHORIZED",
            when: "Missing or invalid API key credential"
          },
          {
            status: 403,
            code: "INSUFFICIENT_SCOPE",
            when: "API key lacks write scope"
          },
          {
            status: 404,
            code: "USER_NOT_FOUND",
            when: "User balance record not found"
          }
        ]
      },
      {
        method: "GET",
        path: "/api/v1/users/{userId}/balance/verify",
        title: "Verify balance",
        description: "Compares local ledger balance against provider balance. Flags discrepancies greater than 1.00 USD. Requires read scope.",
        controllerFile: "apps/api/src/modules/balance/balance.controller.ts",
        controllerHandler: "verify",
        security: [
          {
            scheme: "apiKeyAuth",
            scopes: [
              "read"
            ]
          }
        ],
        pathParams: [
          {
            name: "userId",
            type: "string",
            required: true,
            description: "User ID (usr_...)"
          }
        ],
        responses: [
          {
            status: 200,
            label: "Balance verified",
            body: "{\n  \"data\": {\n    \"user_id\": \"usr_9f2c1a7e5b3d8f6041c2a9e7b5d3f1a0\",\n    \"verified\": true,\n    \"local_balance\": \"1250.00\",\n    \"provider_balance\": \"1250.00\",\n    \"currency\": \"USD\"\n  },\n  \"meta\": {\n    \"requestId\": \"req_9f2c1a7e5b3d8f6041c2a9e7b5d3f1a0\",\n    \"timestamp\": \"2026-02-18T10:00:00.000Z\"\n  }\n}"
          }
        ],
        errors: [
          {
            status: 401,
            code: "UNAUTHORIZED",
            when: "Missing or invalid API key credential"
          },
          {
            status: 403,
            code: "INSUFFICIENT_SCOPE",
            when: "API key lacks read scope"
          },
          {
            status: 404,
            code: "USER_NOT_FOUND",
            when: "User balance not found"
          },
          {
            status: 409,
            code: "BALANCE_DISCREPANCY",
            when: "Local balance differs from provider balance by more than 1.00 USD"
          }
        ]
      },
      {
        method: "POST",
        path: "/api/v1/users/{userId}/balance/reconcile",
        title: "Reconcile balance",
        description: "Reconciles balance discrepancy by aligning ledger with provider truth. Requires write scope.",
        controllerFile: "apps/api/src/modules/balance/balance.controller.ts",
        controllerHandler: "reconcile",
        security: [
          {
            scheme: "apiKeyAuth",
            scopes: [
              "write"
            ]
          }
        ],
        pathParams: [
          {
            name: "userId",
            type: "string",
            required: true,
            description: "User ID (usr_...)"
          }
        ],
        responses: [
          {
            status: 200,
            label: "Balance reconciled",
            body: "{\n  \"data\": {\n    \"user_id\": \"usr_9f2c1a7e5b3d8f6041c2a9e7b5d3f1a0\",\n    \"available\": \"1250.00\",\n    \"reserved\": \"0.00\",\n    \"total\": \"1250.00\",\n    \"currency\": \"USD\",\n    \"updated_at\": \"2026-02-18T10:00:00.000Z\"\n  },\n  \"meta\": {\n    \"requestId\": \"req_9f2c1a7e5b3d8f6041c2a9e7b5d3f1a0\",\n    \"timestamp\": \"2026-02-18T10:00:00.000Z\"\n  }\n}"
          }
        ],
        errors: [
          {
            status: 401,
            code: "UNAUTHORIZED",
            when: "Missing or invalid API key credential"
          },
          {
            status: 403,
            code: "INSUFFICIENT_SCOPE",
            when: "API key lacks write scope"
          },
          {
            status: 404,
            code: "USER_NOT_FOUND",
            when: "User balance not found"
          }
        ]
      }
    ]
  },
  {
    name: "Config & Health",
    description: "Public endpoints for orchestrator configuration and basic health verification.",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/config",
        title: "Platform configuration",
        description: "Returns orchestrator platform configuration, supported currencies, network, and provider information.",
        controllerFile: "apps/api/src/modules/config/config.controller.ts",
        controllerHandler: "getConfig",
        security: [
          {
            scheme: "none"
          }
        ],
        responses: [
          {
            status: 200,
            label: "Platform configuration returned",
            body: "{\n  \"data\": {\n    \"currencies\": [\n      \"USD\",\n      \"USDC\"\n    ],\n    \"limits\": {\n      \"order\": {\n        \"min\": \"1.00\",\n        \"max\": \"50000.00\"\n      },\n      \"payout\": {\n        \"min\": \"5.00\"\n      }\n    },\n    \"features\": {\n      \"milestones\": true,\n      \"disputes\": true,\n      \"sse\": true,\n      \"blindpay\": true,\n      \"trustlessWork\": true\n    },\n    \"providers\": {\n      \"fiat\": \"blindpay\",\n      \"escrow\": \"trustless_work\"\n    },\n    \"network\": \"mainnet\",\n    \"version\": \"1.0.0\"\n  }\n}",
            schema: {
              name: "PlatformConfigResponse",
              type: "object",
              required: [
                "data"
              ],
              properties: {
                data: {
                  type: "object",
                  required: [
                    "currencies",
                    "limits",
                    "features",
                    "providers",
                    "network",
                    "version"
                  ],
                  properties: {
                    currencies: {
                      type: "array",
                      items: {
                        type: "string"
                      }
                    },
                    limits: {
                      type: "object"
                    },
                    features: {
                      type: "object"
                    },
                    providers: {
                      type: "object"
                    },
                    network: {
                      type: "string"
                    },
                    version: {
                      type: "string"
                    }
                  }
                }
              }
            }
          }
        ],
        errors: [
          {
            status: 429,
            code: "RATE_LIMITED",
            when: "Rate limit exceeded"
          }
        ]
      },
      {
        method: "GET",
        path: "/api/v1/health",
        title: "Basic health check",
        description: "Returns basic liveness and readiness status of the orchestrator API service.",
        controllerFile: "apps/api/src/modules/health/health.controller.ts",
        controllerHandler: "getHealth",
        security: [
          {
            scheme: "none"
          }
        ],
        responses: [
          {
            status: 200,
            label: "Service is healthy",
            body: "{\n  \"data\": {\n    \"status\": \"ok\",\n    \"timestamp\": \"2026-02-18T10:00:00.000Z\"\n  },\n  \"meta\": {\n    \"requestId\": \"req_9f2c1a7e5b3d8f6041c2a9e7b5d3f1a0\",\n    \"timestamp\": \"2026-02-18T10:00:00.000Z\"\n  }\n}",
            schema: {
              name: "BasicHealthResponse",
              type: "object",
              required: [
                "data"
              ],
              properties: {
                data: {
                  type: "object",
                  required: [
                    "status",
                    "timestamp"
                  ],
                  properties: {
                    status: {
                      type: "string",
                      enum: [
                        "ok",
                        "degraded",
                        "down"
                      ]
                    },
                    timestamp: {
                      type: "string",
                      format: "date-time"
                    }
                  }
                }
              }
            }
          }
        ],
        errors: [
          {
            status: 503,
            code: "SERVICE_UNAVAILABLE",
            when: "Service or database dependency is unavailable"
          }
        ]
      }
    ]
  },
  {
    name: "Events",
    description: "Real-time Server-Sent Events (SSE) stream for orders, escrow, balance, and payout domain events.",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/events",
        title: "Subscribe to event stream",
        description: "Server-Sent Events (SSE) feed for real-time domain events. Scoped to caller's marketplace. Requires API key with read scope.",
        controllerFile: "apps/api/src/modules/events/events.controller.ts",
        controllerHandler: "streamEvents",
        security: [
          {
            scheme: "apiKeyAuth",
            scopes: [
              "read"
            ]
          }
        ],
        queryParams: [
          {
            name: "types",
            type: "string",
            required: false,
            description: "Exact event type filter (e.g. order.created)"
          },
          {
            name: "resources",
            type: "string",
            required: false,
            description: "Aggregate resource filter (e.g. Order, Balance)"
          },
          {
            name: "since",
            type: "string",
            required: false,
            description: "ISO 8601 replay timestamp"
          }
        ],
        responses: [
          {
            status: 200,
            label: "SSE event stream opened",
            contentType: "text/event-stream",
            body: "id: 2026-02-18T10:00:00.000Z\\nevent: order.escrow_funded\\ndata: {\\\"eventId\\\":\\\"evt_102030405060708090a0b0c0d0e0f010\\\",\\\"eventType\\\":\\\"order.escrow_funded\\\",\\\"occurredAt\\\":\\\"2026-02-18T10:00:00.000Z\\\",\\\"aggregateId\\\":\\\"ord_1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d\\\",\\\"aggregateType\\\":\\\"Order\\\",\\\"payload\\\":{\\\"orderId\\\":\\\"ord_1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d\\\",\\\"escrowId\\\":\\\"esc_8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d\\\",\\\"amount\\\":\\\"2500.00\\\",\\\"currency\\\":\\\"USDC\\\"},\\\"metadata\\\":{}}\\n\\n"
          }
        ],
        errors: [
          {
            status: 401,
            code: "UNAUTHORIZED",
            when: "Missing or invalid API key credential"
          },
          {
            status: 403,
            code: "INSUFFICIENT_SCOPE",
            when: "API key lacks read scope"
          },
          {
            status: 429,
            code: "RATE_LIMITED",
            when: "Exceeded stream connection limits"
          }
        ]
      }
    ]
  }
];
