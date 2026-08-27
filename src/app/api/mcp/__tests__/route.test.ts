// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET, POST, DELETE } from "../route";
import * as docsLoader from "../../../../../mcp/src/docs-loader";

vi.mock("../../../../../mcp/src/docs-loader", () => ({
  loadDocumentation: vi.fn().mockResolvedValue(undefined),
  listSections: vi.fn().mockReturnValue([{
    name: "Getting Started",
    slug: "getting-started",
    pages: [{ title: "Installation", slug: "installation", description: "setup" }]
  }]),
  searchDocs: vi.fn().mockReturnValue([{
    title: "Escrow",
    slug: "escrow",
    description: "desc",
    section: "Guides",
    snippet: "...",
    score: 10
  }]),
  getDocBySlug: vi.fn().mockReturnValue(null),
}));

function request(method: "GET" | "POST" | "DELETE", url: string, body?: unknown) {
  const headers: Record<string, string> = {};
  if (method === "GET") {
    headers["Accept"] = "text/event-stream";
  } else {
    headers["Content-Type"] = "application/json";
    headers["Accept"] = "application/json, text/event-stream";
  }
  return new NextRequest(`https://offer-hub.tech${url}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
}

describe("MCP HTTP Transport", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("requires POST initialize before GET for stateful transport", async () => {
    // Before initialization, GET should return 400
    const res = await GET(request("GET", "/api/mcp"));
    expect(res.status).toBe(400);
  });

  it("handles POST requests with JSON-RPC messages", async () => {
    // Test a basic JSON-RPC POST (initialize)
    const rpcRequest = {
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2024-11-05",
        capabilities: {},
        clientInfo: { name: "test", version: "1.0" }
      }
    };
    
    // We expect it to respond with a 200, returning the SSE stream
    const res = await POST(request("POST", "/api/mcp", rpcRequest));
    expect(res.status).toBe(200); 
    expect(res.headers.get("Content-Type")).toContain("text/event-stream");
  });
  
  it("rejects invalid requests gracefully", async () => {
    // Missing required fields will cause parse error or bad request
    const res = await POST(request("POST", "/api/mcp", { jsonrpc: "2.0" }));
    expect([400, 404, 500]).toContain(res.status);
  });
});
