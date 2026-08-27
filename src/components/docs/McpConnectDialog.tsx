"use client";

import { useRef, useState } from "react";
import { Check, Copy, X } from "lucide-react";

import { MCP_SERVER_NAME, MCP_SERVER_URL } from "@/constants/mcp";
import { buildMcpConfigSnippet, copyTextToClipboard } from "@/utils/mcp-connect";
import { logger } from "@/utils/logger";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { useFocusTrap } from "@/hooks/useFocusTrap";

interface McpConnectDialogProps {
  onClose: () => void;
}

type CopiedTarget = "url" | "snippet" | null;

export function McpConnectDialog({ onClose }: McpConnectDialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState<CopiedTarget>(null);
  const snippet = buildMcpConfigSnippet();

  useBodyScrollLock(true);
  useFocusTrap({ containerRef: panelRef, isActive: true, onEscape: onClose });

  async function handleCopy(target: Exclude<CopiedTarget, null>) {
    try {
      await copyTextToClipboard(target === "url" ? MCP_SERVER_URL : snippet);
      setCopied(target);
      setTimeout(() => setCopied(null), 1500);
    } catch (error) {
      logger.error("Failed to copy MCP connection details", error);
    }
  }

  const copyButtonClasses =
    "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-content-secondary hover:text-theme-primary focus-visible:outline-2 focus-visible:outline-theme-primary focus-visible:outline-offset-2 transition-colors";

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="mcp-connect-title"
        className="relative w-full max-w-lg rounded-2xl bg-bg-elevated border border-theme-border/40 shadow-2xl shadow-black/10 p-6 animate-fadeIn"
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
            className="rounded-lg p-2 text-content-secondary hover:text-content-primary focus-visible:outline-2 focus-visible:outline-theme-primary focus-visible:outline-offset-2 transition-colors"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-content-secondary">
              Server URL
            </p>
            <div className="flex items-center gap-2 rounded-xl bg-bg-sunken px-3 py-2.5">
              <code className="flex-1 min-w-0 truncate text-sm text-content-primary">
                {MCP_SERVER_URL}
              </code>
              <button
                type="button"
                onClick={() => handleCopy("url")}
                aria-label="Copy server URL"
                className={copyButtonClasses}
              >
                {copied === "url" ? <Check size={14} /> : <Copy size={14} />}
                <span>{copied === "url" ? "Copied!" : "Copy"}</span>
              </button>
            </div>
          </div>

          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-content-secondary">
              Config snippet
            </p>
            <div className="relative rounded-xl bg-bg-sunken px-3 py-2.5">
              <pre className="overflow-x-auto pr-14 text-xs leading-relaxed text-content-primary">
                <code>{snippet}</code>
              </pre>
              <button
                type="button"
                onClick={() => handleCopy("snippet")}
                aria-label="Copy config snippet"
                className={`${copyButtonClasses} absolute right-2 top-2 bg-bg-elevated`}
              >
                {copied === "snippet" ? <Check size={14} /> : <Copy size={14} />}
                <span>{copied === "snippet" ? "Copied!" : "Copy"}</span>
              </button>
            </div>
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
