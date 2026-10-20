#!/usr/bin/env node

import { fileURLToPath } from "url";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { z } from "zod";
import { loadDocumentation, searchDocs, getDocBySlug, listSections } from "./docs-loader.js";

// Load documentation on startup
let docsLoaded = false;

async function ensureDocsLoaded() {
  if (!docsLoaded) {
    await loadDocumentation();
    docsLoaded = true;
  }
}

/**
 * Builds a fully configured MCP server with all documentation tools.
 *
 * A server instance can be connected to only one transport: since
 * @modelcontextprotocol/sdk 1.26, `connect()` throws "Already connected to a
 * transport" on a second call. The HTTP route and the stdio CLI therefore
 * each get their own instance from this factory.
 */
function createServer(): McpServer {
  const server = new McpServer({
    name: "offer-hub-docs",
    version: "1.0.0",
  });

  // Tool 1: List all documentation sections
  server.tool(
    "list_doc_sections",
    "List all available documentation sections and their pages. Returns a structured overview of the OFFER-HUB documentation.",
    {},
    async () => {
      await ensureDocsLoaded();
      const sections = listSections();

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(sections, null, 2),
          },
        ],
      };
    }
  );

  // Tool 2: Search documentation
  server.tool(
    "search_docs",
    "Search OFFER-HUB documentation by query. Returns matching documents with titles, descriptions, and content snippets.",
    {
      query: z.string().describe("Search query to find relevant documentation"),
      maxResults: z.number().optional().default(10).describe("Maximum number of results to return (default: 10)"),
    },
    async ({ query, maxResults }) => {
      await ensureDocsLoaded();
      const results = searchDocs(query, maxResults ?? 10);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(results, null, 2),
          },
        ],
      };
    }
  );

  // Tool 3: Get specific documentation page
  server.tool(
    "get_doc_page",
    "Get the full content of a specific documentation page by its slug. Use list_doc_sections to discover available slugs.",
    {
      slug: z.string().describe("The slug/path of the documentation page (e.g., 'getting-started', 'guides/overview', 'api-reference/webhooks')"),
    },
    async ({ slug }) => {
      await ensureDocsLoaded();
      const doc = getDocBySlug(slug);

      if (!doc) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                error: "Document not found",
                slug,
                suggestion: "Use list_doc_sections to see available documentation pages.",
              }, null, 2),
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              title: doc.title,
              description: doc.description,
              section: doc.section,
              slug: doc.slug,
              content: doc.content,
            }, null, 2),
          },
        ],
      };
    }
  );

  return server;
}

// HTTP transport in stateful mode, created and connected on first use so the
// stdio CLI never opens it. One transport (and its server) is reused for the
// lifetime of the process, as before.
let httpTransportReady: Promise<WebStandardStreamableHTTPServerTransport> | undefined;

function getHttpTransport(): Promise<WebStandardStreamableHTTPServerTransport> {
  if (!httpTransportReady) {
    const transport = new WebStandardStreamableHTTPServerTransport({
      sessionIdGenerator: () => crypto.randomUUID(),
    });
    httpTransportReady = createServer()
      .connect(transport)
      .then(() => transport)
      .catch((error) => {
        // Allow a later request to retry instead of caching the failure.
        httpTransportReady = undefined;
        throw error;
      });
  }
  return httpTransportReady;
}

/**
 * Handle HTTP requests (e.g. from Next.js API routes or Cloudflare Workers)
 * using the MCP Streamable HTTP transport.
 */
export async function handleMcpRequest(req: Request) {
  await ensureDocsLoaded();
  const transport = await getHttpTransport();
  return transport.handleRequest(req);
}

async function runStdio() {
  const stdioTransport = new StdioServerTransport();
  await createServer().connect(stdioTransport);
  console.error("OFFER-HUB MCP Documentation Server running on stdio");
}

// Check if running directly as a script (stdio mode)
const isMain = typeof process !== "undefined" && process.argv[1] &&
  (process.argv[1] === fileURLToPath(import.meta.url) ||
   process.argv[1].endsWith("build/index.js"));

if (isMain) {
  runStdio().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}