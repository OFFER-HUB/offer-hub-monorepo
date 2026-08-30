/**
 * Hosted docs MCP server (companion hosting issue #1535).
 *
 * `mcp/` is exposed over the MCP Streamable HTTP transport at this stable
 * production URL. Every one-click "Connect to …" action in the docs
 * page-actions menu points here — never at a local stdio server.
 */
export const MCP_SERVER_NAME = "offer-hub-docs";
export const MCP_SERVER_URL = "https://offer-hub.tech/api/mcp";
