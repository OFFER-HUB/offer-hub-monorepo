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

  it("advertises and validates tool arguments after initialization", async () => {
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

    const sessionId = res.headers.get("mcp-session-id");
    expect(sessionId).toBeTruthy();

    async function call(body: unknown) {
      const req = request("POST", "/api/mcp", body);
      req.headers.set("mcp-session-id", sessionId!);
      req.headers.set("mcp-protocol-version", "2024-11-05");
      return POST(req);
    }

    async function readMessage(response: Response) {
      expect(response.status).toBe(200);
      const data = (await response.text()).split(/\r?\n/).find((line) => line.startsWith("data:"));
      expect(data).toBeDefined();
      return JSON.parse(data!.slice(5));
    }

    const initialized = await call({ jsonrpc: "2.0", method: "notifications/initialized" });
    expect(initialized.status).toBe(202);

    const listed = await readMessage(await call({ jsonrpc: "2.0", id: 2, method: "tools/list" }));
    const search = listed.result.tools.find((tool: { name: string }) => tool.name === "search_docs");
    expect(search.inputSchema.required).toContain("query");
    expect(search.inputSchema.properties.maxResults.default).toBe(10);

    const result = await readMessage(await call({
      jsonrpc: "2.0", id: 3, method: "tools/call",
      params: { name: "search_docs", arguments: { query: "escrow" } },
    }));
    expect(result.result.isError).not.toBe(true);
    expect(docsLoader.searchDocs).toHaveBeenCalledWith("escrow", 10);

    vi.mocked(docsLoader.searchDocs).mockClear();
    const invalid = await readMessage(await call({
      jsonrpc: "2.0", id: 4, method: "tools/call",
      params: { name: "search_docs", arguments: { query: 123 } },
    }));
    expect(invalid.result.isError).toBe(true);
    expect(docsLoader.searchDocs).not.toHaveBeenCalled();
  });
  
  it("rejects invalid requests gracefully", async () => {
    // Missing required fields will cause parse error or bad request
    const res = await POST(request("POST", "/api/mcp", { jsonrpc: "2.0" }));
    expect([400, 404, 500]).toContain(res.status);
  });

  it("handles DELETE requests to close a session", async () => {
    // No prior session was initialized, so this should fail gracefully
    // rather than throwing, exercising the same handleMcpRequest path as
    // GET/POST.
    const res = await DELETE(request("DELETE", "/api/mcp"));
    expect([400, 404, 405]).toContain(res.status);
  });
});
