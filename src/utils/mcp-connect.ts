import { MCP_SERVER_NAME, MCP_SERVER_URL } from "@/constants/mcp";

/**
 * Generic MCP client config snippet — works in Claude Desktop, Cursor, and
 * any other client that reads the `mcpServers` shape. Excludes the raw JSON
 * object itself so `JSON.stringify` output stays stable for tests.
 */
export function buildMcpConfigSnippet(): string {
  return JSON.stringify(
    {
      mcpServers: {
        [MCP_SERVER_NAME]: {
          type: "http",
          url: MCP_SERVER_URL,
        },
      },
    },
    null,
    2,
  );
}

/**
 * VS Code one-click install deep link.
 *
 * VS Code registers `vscode:mcp/install?{json-configuration}` as a URL
 * handler, where the configuration is a URL-encoded JSON object describing
 * the server (`transportType: "http"` for a Streamable HTTP endpoint).
 */
export function buildVscodeMcpInstallLink(): string {
  const config = {
    name: MCP_SERVER_NAME,
    transportType: "http",
    url: MCP_SERVER_URL,
  };
  return `vscode:mcp/install?${encodeURIComponent(JSON.stringify(config))}`;
}

/** Claude Code CLI command that registers the hosted server. */
export function buildClaudeCodeMcpCommand(): string {
  return `claude mcp add --transport http ${MCP_SERVER_NAME} ${MCP_SERVER_URL}`;
}

/** Codex `config.toml` snippet for a Streamable HTTP server. */
export function buildCodexMcpConfigSnippet(): string {
  return `[mcp_servers.${MCP_SERVER_NAME}]
url = "${MCP_SERVER_URL}"`;
}

/**
 * Copies `text` to the clipboard. All copy actions in the docs page-actions
 * menu route through this so failure handling stays in one place.
 */
export async function copyTextToClipboard(text: string): Promise<void> {
  await navigator.clipboard.writeText(text);
}
