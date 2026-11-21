import fs from 'fs';
import path from 'path';
import {
  API_SCHEMA,
  type ApiEndpoint,
  type EndpointCategory,
  type JsonSchema,
  type Parameter,
  type SchemaProperty,
} from './openapi-source-data';

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
  security: Array<Record<string, string[]>>;
  parameters?: OpenApiParameter[];
  requestBody?: {
    required: boolean;
    content: Record<string, { schema: unknown; example: unknown }>;
  };
  responses: Record<
    number,
    { description: string; content?: Record<string, { schema: unknown; example?: unknown }> }
  >;
}

interface OpenApiSpec {
  openapi: string;
  info: { title: string; version: string; description: string; license: { name: string; url: string } };
  servers: Array<{
    url: string;
    description: string;
    variables?: Record<string, { default: string; description: string }>;
  }>;
  tags: Array<{ name: string; description: string }>;
  paths: Record<string, Record<string, OpenApiOperation>>;
  components: {
    schemas: Record<string, unknown>;
    securitySchemes: Record<string, { type: string; scheme: string; bearerFormat: string }>;
  };
  security: unknown[];
}

// These schemas describe the illustrative examples authored alongside each
// endpoint, not an exhaustive validation contract for the real DTO - the
// orchestrator's actual response may include fields this file doesn't list.
// Mark every object level as open so example validators (and consumers)
// don't treat a documented subset of fields as the complete set.
function markObjectsOpen(node: unknown): void {
  if (!node || typeof node !== 'object') return;
  const obj = node as Record<string, unknown>;
  if (obj.type === 'object' && obj.additionalProperties === undefined) {
    obj.additionalProperties = true;
  }
  // `nullable: true` only actually permits a null example/value here if the
  // validator also sees null as a member of `enum` - add it when missing.
  if (obj.nullable === true && Array.isArray(obj.enum) && !obj.enum.includes(null)) {
    obj.enum = [...obj.enum, null];
  }
  if (obj.properties && typeof obj.properties === 'object') {
    for (const prop of Object.values(obj.properties as Record<string, unknown>)) {
      markObjectsOpen(prop);
    }
  }
  if (obj.items) {
    markObjectsOpen(obj.items);
  }
}

// Strips the registry-only `name` key, leaving a plain OpenAPI Schema Object.
function toOpenApiSchema(schema: JsonSchema | SchemaProperty): Record<string, unknown> {
  const rest: Record<string, unknown> = { ...(schema as unknown as Record<string, unknown>) };
  delete rest.name;
  markObjectsOpen(rest);
  return rest;
}

function registerSchema(schemas: Record<string, unknown>, schema: JsonSchema): string {
  schemas[schema.name] = toOpenApiSchema(schema);
  return schema.name;
}

function paramSchema(p: Parameter): { type: string; enum?: string[] } {
  if (p.type === 'select') {
    return { type: 'string', enum: p.options };
  }
  return { type: p.type === 'number' ? 'number' : 'string' };
}

function toParameters(params: Parameter[] | undefined, location: 'path' | 'query'): OpenApiParameter[] {
  return (params ?? []).map((p) => ({
    name: p.name,
    in: location,
    required: location === 'path' ? true : p.required,
    description: p.description,
    schema: paramSchema(p),
  }));
}

function parseJsonMaybe(value: string): unknown {
  if (value === '') return undefined;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

// Collects every distinct error code across the schema, for the shared
// ApiError.error.code enum (purely descriptive - not validated at runtime).
function collectErrorCodes(categories: EndpointCategory[]): string[] {
  const codes = new Set<string>();
  for (const category of categories) {
    for (const endpoint of category.endpoints) {
      for (const err of endpoint.errors ?? []) {
        codes.add(err.code);
      }
    }
  }
  return Array.from(codes).sort();
}

function buildOperation(
  endpoint: ApiEndpoint,
  category: EndpointCategory,
  schemas: Record<string, unknown>,
): OpenApiOperation {
  const operationId =
    endpoint.controllerHandler ??
    endpoint.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const operation: OpenApiOperation = {
    summary: endpoint.title,
    description: endpoint.description,
    operationId,
    tags: [category.name],
    security: (endpoint.security ?? [])
      .filter((s) => s.scheme !== 'none')
      .map((s) => ({ [s.scheme]: s.scopes ?? [] })),
    responses: {},
  };

  const parameters = [
    ...toParameters(endpoint.pathParams, 'path'),
    ...toParameters(endpoint.queryParams, 'query'),
  ];
  if (parameters.length > 0) {
    operation.parameters = parameters;
  }

  if (endpoint.requestBody) {
    const schema = endpoint.requestBody.schema
      ? { $ref: `#/components/schemas/${registerSchema(schemas, endpoint.requestBody.schema)}` }
      : { type: 'object' };
    operation.requestBody = {
      required: true,
      content: {
        [endpoint.requestBody.contentType]: {
          schema,
          example: parseJsonMaybe(endpoint.requestBody.example),
        },
      },
    };
  }

  // Successful responses. Several response variants can share one status
  // code (e.g. a webhook's "processed" / "duplicate" / "business failure"
  // replies are all 200) - OpenAPI allows only one response object per
  // status, so merge same-status variants: the first schema found wins, and
  // multiple bodies become named `examples` instead of a single `example`.
  const byStatus = new Map<number, typeof endpoint.responses>();
  for (const r of endpoint.responses) {
    const list = byStatus.get(r.status) ?? [];
    list.push(r);
    byStatus.set(r.status, list);
  }
  for (const [status, variants] of byStatus) {
    const withSchema = variants.find((v) => v.schema) ?? variants[0];
    const contentType = withSchema.contentType ?? 'application/json';
    const schema = withSchema.schema
      ? { $ref: `#/components/schemas/${registerSchema(schemas, withSchema.schema)}` }
      : { type: 'object' };
    const namedExamples: Record<string, { summary: string; value: unknown }> = {};
    variants.forEach((v, i) => {
      if (v.body !== '') {
        namedExamples[`variant${i + 1}`] = { summary: v.label, value: parseJsonMaybe(v.body) };
      }
    });
    const exampleKeys = Object.keys(namedExamples);
    const hasBody = exampleKeys.length > 0;
    operation.responses[status] = {
      description: variants.map((v) => v.description ?? v.label).join(' / '),
      ...(hasBody || withSchema.schema
        ? {
            content: {
              [contentType]: {
                schema,
                ...(exampleKeys.length === 1
                  ? { example: namedExamples[exampleKeys[0]].value }
                  : exampleKeys.length > 1
                    ? { examples: namedExamples }
                    : {}),
              },
            },
          }
        : {}),
    };
  }

  // Error responses: multiple error codes can share one HTTP status (e.g. two
  // different 400s), but OpenAPI allows only one response object per status -
  // merge them into a single description, each pointing at the shared ApiError
  // schema.
  const errorsByStatus = new Map<number, { code: string; when: string }[]>();
  for (const err of endpoint.errors ?? []) {
    if (operation.responses[err.status]) continue; // a real success response already owns this status
    const list = errorsByStatus.get(err.status) ?? [];
    list.push(err);
    errorsByStatus.set(err.status, list);
  }
  for (const [status, errs] of errorsByStatus) {
    operation.responses[status] = {
      description: errs.map((e) => `${e.code}: ${e.when}`).join(' / '),
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/ApiError' },
          example: { error: { code: errs[0].code, message: errs[0].when } },
        },
      },
    };
  }

  return operation;
}

function generateOpenApiSpec(): OpenApiSpec {
  const schemas: Record<string, unknown> = {
    ApiError: {
      type: 'object',
      required: ['error'],
      properties: {
        error: {
          type: 'object',
          required: ['code', 'message'],
          properties: {
            code: {
              type: 'string',
              description: 'Canonical machine-readable error code. Branch on this field, not on message.',
              enum: collectErrorCodes(API_SCHEMA),
            },
            message: { type: 'string', description: 'Human-readable explanation; may change across versions.' },
            details: { type: 'object', additionalProperties: true, nullable: true },
          },
        },
      },
    },
  };

  const paths: OpenApiSpec['paths'] = {};
  const tags: OpenApiSpec['tags'] = [];

  for (const category of API_SCHEMA) {
    tags.push({ name: category.name, description: category.description });
    for (const endpoint of category.endpoints) {
      paths[endpoint.path] ??= {};
      paths[endpoint.path][endpoint.method.toLowerCase()] = buildOperation(endpoint, category, schemas);
    }
  }

  return {
    openapi: '3.0.0',
    info: {
      title: 'OFFER-HUB Orchestrator API',
      version: '1.0.0',
      description:
        'Generated from the real orchestrator controllers and DTOs - see scripts/openapi-source-data.ts and scripts/README.md for how.',
      license: { name: 'MIT', url: 'https://opensource.org/licenses/MIT' },
    },
    servers: [
      {
        url: 'https://{your-orchestrator-domain}',
        description: 'Production - replace the placeholder with your deployed orchestrator domain',
        variables: {
          'your-orchestrator-domain': {
            default: 'api.your-domain.com',
            description: "Your deployed orchestrator's domain",
          },
        },
      },
      { url: 'http://localhost:4000', description: 'Local development' },
    ],
    tags,
    paths,
    components: {
      schemas,
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'API key or JWT' },
      },
    },
    security: [],
  };
}

const outputPath = path.join(process.cwd(), 'public', 'openapi.json');
const generated = JSON.stringify(generateOpenApiSpec(), null, 2);

if (process.argv.includes('--check')) {
  // Staleness guard (used by `npm run validate:openapi` in CI): fail if the
  // committed spec no longer matches its source (scripts/openapi-source-data.ts).
  // Normalize CRLF so Windows checkouts don't report false drift.
  let committed: string | null = null;
  try {
    committed = fs.readFileSync(outputPath, 'utf8').replace(/\r\n/g, '\n');
  } catch {
    committed = null;
  }

  if (committed !== generated.replace(/\r\n/g, '\n')) {
    console.error(
      'OpenAPI staleness check failed: public/openapi.json is out of date. ' +
        'Run "npm run generate:openapi" and commit the regenerated file.',
    );
    process.exit(1);
  }

  const parsed = JSON.parse(generated) as OpenApiSpec;
  const operationCount = Object.values(parsed.paths).reduce((sum, ops) => sum + Object.keys(ops).length, 0);
  if (operationCount < 1 || Object.keys(parsed.paths).length < 1) {
    console.error('OpenAPI staleness check failed: generated spec has no operations.');
    process.exit(1);
  }
  for (const [p, ops] of Object.entries(parsed.paths)) {
    for (const [method, op] of Object.entries(ops)) {
      if (!op.operationId || !op.responses || Object.keys(op.responses).length === 0) {
        console.error(`OpenAPI staleness check failed: ${method.toUpperCase()} ${p} is missing operationId/responses.`);
        process.exit(1);
      }
    }
  }

  console.log(`OpenAPI spec is up to date (${Object.keys(parsed.paths).length} paths, ${operationCount} operations).`);
} else {
  fs.writeFileSync(outputPath, generated);
  console.log(`OpenAPI spec successfully generated at ${outputPath}`);
}
