import fs from 'fs';
import path from 'path';
import { API_SCHEMA } from '../src/data/api-schema';
import { logger } from '../src/utils/logger';

interface OpenApiParameter {
  name: string;
  in: 'path' | 'query';
  required: boolean;
  description: string;
  schema: { type: string; enum?: string[] };
}

interface OpenApiOperation {
  summary: string;
  description: string;
  operationId: string;
  tags: string[];
  security: Array<{ bearerAuth: string[] }>;
  parameters?: OpenApiParameter[];
  requestBody?: {
    content: Record<string, { schema: { type: string }; example: unknown }>;
  };
  responses: Record<number, { description: string; content: Record<string, { schema: { type: string }; example: unknown }> }>;
}

interface OpenApiSpec {
  openapi: string;
  info: { title: string; version: string; description: string; license: { name: string; url: string } };
  servers: Array<{ url: string; description: string }>;
  paths: Record<string, Record<string, OpenApiOperation>>;
  components: {
    schemas: Record<string, unknown>;
    securitySchemes: Record<string, { type: string; scheme: string; bearerFormat: string }>;
  };
  security: unknown[];
}

function generateOpenApiSpec(): OpenApiSpec {
  const openapi: OpenApiSpec = {
    openapi: "3.0.0",
    info: {
      title: "OFFER-HUB API",
      version: "1.0.0",
      description: "Auto-generated OpenAPI specification for OFFER-HUB",
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT"
      }
    },
    servers: [
      {
        url: "https://api.offer-hub.com",
        description: "Production Server"
      }
    ],
    paths: {},
    components: {
      schemas: {},
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      }
    },
    security: [] // Global default: no auth
  };

  API_SCHEMA.forEach((category) => {
    category.endpoints.forEach((endpoint) => {
      // Replace Express-style path params (:id) with OpenAPI-style ({id})
      const openApiPath = endpoint.path.replace(/:([a-zA-Z0-9_]+)/g, '{$1}');

      if (!openapi.paths[openApiPath]) {
        openapi.paths[openApiPath] = {};
      }

      const method = endpoint.method.toLowerCase();

      const operation: OpenApiOperation = {
        summary: endpoint.title,
        description: endpoint.description,
        operationId: endpoint.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        tags: [category.name],
        security: [],
        responses: {}
      };

      // Guess security based on presence of 401 response or explicit mention of "authentication"
      if (
        endpoint.responses.some((r) => r.status === 401) ||
        endpoint.description.toLowerCase().includes("authentication") ||
        endpoint.description.toLowerCase().includes("authenticated") ||
        endpoint.description.toLowerCase().includes("requires authentication")
      ) {
        operation.security = [{ bearerAuth: [] }];
      } else {
        operation.security = []; // explicit no auth
      }

      const parameters: OpenApiParameter[] = [];

      if (endpoint.pathParams) {
        endpoint.pathParams.forEach((p) => {
          parameters.push({
            name: p.name,
            in: "path",
            required: true,
            description: p.description,
            schema: {
              type: p.type === "number" ? "number" : "string"
            }
          });
        });
      }

      if (endpoint.queryParams) {
        endpoint.queryParams.forEach((p) => {
          const param: OpenApiParameter = {
            name: p.name,
            in: "query",
            required: !!p.required,
            description: p.description,
            schema: {
              type: p.type === "number" ? "number" : "string"
            }
          };
          if (p.type === "select" && p.options) {
            param.schema.enum = p.options;
          }
          parameters.push(param);
        });
      }

      if (parameters.length > 0) {
        operation.parameters = parameters;
      }

      if (endpoint.requestBody) {
        let exampleObj: unknown = {};
        try {
          exampleObj = JSON.parse(endpoint.requestBody.example);
        } catch {
          // Keep as string if it's not valid JSON
          exampleObj = endpoint.requestBody.example;
        }

        operation.requestBody = {
          content: {
            [endpoint.requestBody.contentType]: {
              schema: {
                type: "object"
              },
              example: exampleObj
            }
          }
        };
      }

      endpoint.responses.forEach((r) => {
        let bodyObj: unknown = {};
        try {
          bodyObj = JSON.parse(r.body);
        } catch {
          bodyObj = r.body;
        }

        operation.responses[r.status] = {
          description: r.label,
          content: {
            "application/json": {
              schema: {
                type: "object"
              },
              example: bodyObj
            }
          }
        };
      });

      openapi.paths[openApiPath][method] = operation;
    });
  });

  return openapi;
}

const spec = generateOpenApiSpec();
const outputPath = path.join(process.cwd(), 'public', 'openapi.json');

fs.writeFileSync(outputPath, JSON.stringify(spec, null, 2));
logger.log(`OpenAPI spec successfully generated at ${outputPath}`);