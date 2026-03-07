#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { loadDocumentation, searchDocs, getDocBySlug, listSections } from "./docs-loader.js";

const server = new McpServer({
  name: "offer-hub-docs",
  version: "1.0.0",
});

// Load documentation on startup
let docsLoaded = false;

async function ensureDocsLoaded() {
  if (!docsLoaded) {
    await loadDocumentation();
    docsLoaded = true;
  }
}

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

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("OFFER-HUB MCP Documentation Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
