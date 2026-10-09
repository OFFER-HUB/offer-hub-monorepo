/* eslint-disable @typescript-eslint/no-explicit-any */
export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

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

export function parseOpenApi(spec: any): EndpointCategory[] {
  const categoriesMap = new Map<string, EndpointCategory>();

  if (!spec || !spec.paths) return [];

  for (const [path, methods] of Object.entries(spec.paths)) {
    for (const [methodStr, op] of Object.entries(methods as any)) {
      const operation = op as any;
      const method = methodStr.toUpperCase() as HttpMethod;
      const tags = operation.tags || ["Default"];
      const categoryName = tags[0];

      if (!categoriesMap.has(categoryName)) {
        categoriesMap.set(categoryName, {
          name: categoryName,
          description: "",
          endpoints: []
        });
      }

      const category = categoriesMap.get(categoryName)!;

      const pathParams: Parameter[] = [];
      const queryParams: Parameter[] = [];

      if (operation.parameters) {
        for (const p of operation.parameters) {
          const param: Parameter = {
            name: p.name,
            type: p.schema?.type === "number" || p.schema?.type === "integer" ? "number" : "string",
            required: !!p.required,
            description: p.description || "",
          };

          if (p.schema?.enum) {
            param.type = "select";
            param.options = p.schema.enum;
          }

          if (p.in === "path") {
            pathParams.push(param);
          } else if (p.in === "query") {
            queryParams.push(param);
          }
        }
      }

      let requestBody: RequestBody | undefined = undefined;
      if (operation.requestBody && operation.requestBody.content) {
        const contentTypes = Object.keys(operation.requestBody.content);
        if (contentTypes.length > 0) {
          const cType = contentTypes[0];
          const example = operation.requestBody.content[cType].example;
          requestBody = {
            contentType: cType,
            example: typeof example === "string" ? example : JSON.stringify(example, null, 2)
          };
        }
      }

      const responses: MockResponse[] = [];
      if (operation.responses) {
        for (const [statusStr, res] of Object.entries(operation.responses)) {
          const responseObj = res as any;
          const status = parseInt(statusStr, 10);
          
          let bodyStr = "";
          if (responseObj.content && responseObj.content["application/json"] && responseObj.content["application/json"].example) {
            const ex = responseObj.content["application/json"].example;
            bodyStr = typeof ex === "string" ? ex : JSON.stringify(ex, null, 2);
          }

          responses.push({
            status: isNaN(status) ? 200 : status,
            label: responseObj.description || "Response",
            body: bodyStr
          });
        }
      }

      category.endpoints.push({
        method,
        path,
        title: operation.summary || operation.operationId || path,
        description: operation.description || "",
        pathParams: pathParams.length > 0 ? pathParams : undefined,
        queryParams: queryParams.length > 0 ? queryParams : undefined,
        requestBody,
        responses: responses.length > 0 ? responses : [{ status: 200, label: "Success", body: "" }]
      });
    }
  }

  return Array.from(categoriesMap.values());
}
