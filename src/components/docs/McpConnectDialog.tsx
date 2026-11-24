"use client";

import { useRef } from "react";
import { X } from "lucide-react";

import { MCP_SERVER_NAME, MCP_SERVER_URL } from "@/constants/mcp";
import { buildMcpConfigSnippet } from "@/utils/mcp-connect";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { CodeBlock } from "@/components/docs/CodeBlock";

interface McpConnectDialogProps {
  onClose: () => void;
}

export function McpConnectDialog({ onClose }: McpConnectDialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const snippet = buildMcpConfigSnippet();

  useBodyScrollLock(true);
  useFocusTrap({ containerRef: panelRef, isActive: true, onEscape: onClose });

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-[color-mix(in_srgb,var(--color-bg-base)_60%,transparent)] backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="mcp-connect-title"
        className="relative w-full max-w-lg rounded-2xl border border-theme-border bg-bg-elevated p-6 shadow-neu-raised animate-fadeIn"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2
              id="mcp-connect-title"
              className="text-lg font-semibold text-content-primary"
            >
              Connect with MCP
            </h2>
            <p className="mt-1 text-sm text-content-secondary">
              Add the OFFER-HUB docs to your AI assistant as an MCP server.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Connect with MCP dialog"
            className="min-h-11 min-w-11 rounded-xl p-2 text-content-secondary hover:text-content-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="min-w-0">
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-content-secondary">
              Server URL
            </p>
            <CodeBlock
              code={MCP_SERVER_URL}
              language="text"
              title="Server URL"
              copyLabel="Copy server URL"
              className="my-0"
              dense
            />
          </div>

          <div className="min-w-0">
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-content-secondary">
              Config snippet
            </p>
            <CodeBlock
              code={snippet}
              language="json"
              title="Config snippet"
              copyLabel="Copy config snippet"
              className="my-0"
              dense
            />
          </div>
        </div>

        <p className="mt-4 text-xs text-content-muted">
          Paste this into any MCP client that reads the{" "}
          <code className="text-content-secondary">mcpServers</code> format —
          Claude Desktop, Cursor, or a Claude Code{" "}
          <code className="text-content-secondary">.mcp.json</code> file. The
          server name is <code className="text-content-secondary">{MCP_SERVER_NAME}</code>.
        </p>
      </div>
    </div>
  );
}
