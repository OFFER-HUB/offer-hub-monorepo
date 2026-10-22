// Turns the generated OpenAPI document (public/openapi.json) into the shape
// the Interactive Explorer renders: operations grouped by tag, in document
// order, with their parameters/requestBody/responses already in a form the
// UI can use directly (every example is inlined in the spec itself, so no
// $ref resolution is needed for display).

export interface OpenApiParameterSpec {
  name: string;
  in: "path" | "query";
  required: boolean;
  description: string;
  schema: { type: string; enum?: string[] };
}

export interface OpenApiMediaType {
  schema?: unknown;
  example?: unknown;
  examples?: Record<string, { summary?: string; value: unknown }>;
}

export interface OpenApiResponseSpec {
  status: string;
  description: string;
  contentType?: string;
  content?: OpenApiMediaType;
}

export interface OpenApiOperationSpec {
  method: string;
  path: string;
  operationId: string;
  summary: string;
  description: string;
  tag: string;
  security: { scheme: string; scopes: string[] }[];
  parameters: OpenApiParameterSpec[];
  requestBody?: {
    contentType: string;
    required: boolean;
    content: OpenApiMediaType;
  };
  responses: OpenApiResponseSpec[];
}

export interface OpenApiCategory {
  name: string;
  description: string;
  operations: OpenApiOperationSpec[];
}

interface RawOperation {
  summary?: string;
  description?: string;
  operationId?: string;
  tags?: string[];
  security?: Array<Record<string, string[]>>;
  parameters?: Array<{
    name: string;
    in: string;
    required?: boolean;
    description?: string;
    schema?: { type: string; enum?: string[] };
  }>;
  requestBody?: {
    required?: boolean;
    content: Record<string, OpenApiMediaType>;
  };
  responses: Record<string, { description: string; content?: Record<string, OpenApiMediaType> }>;
}

export interface RawOpenApiDocument {
  tags?: Array<{ name: string; description?: string }>;
  paths: Record<string, Record<string, RawOperation>>;
}

function firstContentEntry(
  content: Record<string, OpenApiMediaType> | undefined,
): { contentType: string; media: OpenApiMediaType } | undefined {
  if (!content) return undefined;
  const [contentType, media] = Object.entries(content)[0] ?? [];
  if (!contentType) return undefined;
  return { contentType, media };
}

export function parseOpenApiSpec(spec: RawOpenApiDocument): OpenApiCategory[] {
  const categories = new Map<string, OpenApiCategory>();
  for (const tag of spec.tags ?? []) {
    categories.set(tag.name, { name: tag.name, description: tag.description ?? "", operations: [] });
  }

  for (const [path, methods] of Object.entries(spec.paths)) {
    for (const [method, op] of Object.entries(methods)) {
      const tag = op.tags?.[0] ?? "Other";
      if (!categories.has(tag)) {
        categories.set(tag, { name: tag, description: "", operations: [] });
      }

      const parameters: OpenApiParameterSpec[] = (op.parameters ?? [])
        .filter((p) => p.in === "path" || p.in === "query")
        .map((p) => ({
          name: p.name,
          in: p.in as "path" | "query",
          required: !!p.required,
          description: p.description ?? "",
          schema: p.schema ?? { type: "string" },
        }));

      const reqEntry = firstContentEntry(op.requestBody?.content);
      const requestBody = reqEntry
        ? {
            contentType: reqEntry.contentType,
            required: !!op.requestBody?.required,
            content: reqEntry.media,
          }
        : undefined;

      const responses: OpenApiResponseSpec[] = Object.entries(op.responses).map(([status, r]) => {
        const entry = firstContentEntry(r.content);
        return {
          status,
          description: r.description,
          contentType: entry?.contentType,
          content: entry?.media,
        };
      });

      categories.get(tag)!.operations.push({
        method: method.toUpperCase(),
        path,
        operationId: op.operationId ?? `${method}-${path}`,
        summary: op.summary ?? "",
        description: op.description ?? "",
        tag,
        security: (op.security ?? []).flatMap((req) =>
          Object.entries(req).map(([scheme, scopes]) => ({ scheme, scopes })),
        ),
        parameters,
        requestBody,
        responses,
      });
    }
  }

  return Array.from(categories.values()).filter((c) => c.operations.length > 0);
}
