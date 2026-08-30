import { describe, it, expect } from "vitest";

import { MCP_SERVER_NAME, MCP_SERVER_URL } from "@/constants/mcp";
import {
  buildClaudeCodeMcpCommand,
  buildCodexMcpConfigSnippet,
  buildMcpConfigSnippet,
  buildVscodeMcpInstallLink,
} from "@/utils/mcp-connect";

describe("mcp-connect builders", () => {
  it("points every builder at the hosted endpoint, never a local stdio server", () => {
    const outputs = [
      buildMcpConfigSnippet(),
      buildClaudeCodeMcpCommand(),
      buildCodexMcpConfigSnippet(),
    ];

    for (const output of outputs) {
      expect(output).toContain(MCP_SERVER_URL);
      expect(output).not.toMatch(/stdio|localhost|127\.0\.0\.1|absolute/);
    }

    // The VS Code deep link URL-encodes the endpoint inside the query string.
    const decodedVscodeLink = decodeURIComponent(buildVscodeMcpInstallLink());
    expect(decodedVscodeLink).toContain(MCP_SERVER_URL);
    expect(decodedVscodeLink).not.toMatch(/stdio|localhost|127\.0\.0\.1|absolute/);
  });

  it("builds a generic mcpServers config snippet with the http transport", () => {
    const snippet = buildMcpConfigSnippet();
    const parsed = JSON.parse(snippet) as {
      mcpServers: Record<string, { type: string; url: string }>;
    };

    expect(parsed.mcpServers[MCP_SERVER_NAME]).toEqual({
      type: "http",
      url: MCP_SERVER_URL,
    });
  });

  it("builds a VS Code install deep link with the URL-encoded http server config", () => {
    const link = buildVscodeMcpInstallLink();

    expect(link.startsWith("vscode:mcp/install?")).toBe(true);

    const encoded = link.slice("vscode:mcp/install?".length);
    const decoded = JSON.parse(decodeURIComponent(encoded)) as {
      name: string;
      transportType: string;
      url: string;
    };

    expect(decoded).toEqual({
      name: MCP_SERVER_NAME,
      transportType: "http",
      url: MCP_SERVER_URL,
    });
  });

  it("builds the claude mcp add command for the hosted server", () => {
    expect(buildClaudeCodeMcpCommand()).toBe(
      `claude mcp add --transport http ${MCP_SERVER_NAME} ${MCP_SERVER_URL}`,
    );
  });

  it("builds a Codex config.toml snippet for the hosted server", () => {
    expect(buildCodexMcpConfigSnippet()).toBe(
      `[mcp_servers.${MCP_SERVER_NAME}]\nurl = "${MCP_SERVER_URL}"`,
    );
  });
});
