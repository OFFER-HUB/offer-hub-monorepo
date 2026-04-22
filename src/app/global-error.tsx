"use client";

import { useEffect } from "react";

/**
 * Global error boundary — catches errors in the root layout itself.
 * Must include its own <html> and <body> tags since the root layout
 * may have failed to render.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[OFFER-HUB] Global error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          backgroundColor: "#1a1a2e",
          color: "#e0e0e0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          padding: "1rem",
        }}
      >
        <div
          style={{
            maxWidth: "28rem",
            textAlign: "center",
            padding: "2.5rem",
            borderRadius: "1.5rem",
            background: "#1a1a2e",
            boxShadow:
              "10px 10px 20px rgba(0,0,0,0.4), -10px -10px 20px rgba(50,50,80,0.15)",
          }}
        >
          <div
            style={{
              width: "6rem",
              height: "6rem",
              borderRadius: "1rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.5rem",
              background: "#16162a",
              boxShadow:
                "inset 5px 5px 10px rgba(0,0,0,0.4), inset -5px -5px 10px rgba(50,50,80,0.15)",
              fontSize: "2rem",
            }}
          >
            ⚠️
          </div>

          <h1
            style={{
              fontSize: "1.25rem",
              fontWeight: 700,
              marginBottom: "0.75rem",
            }}
          >
            Critical Error
          </h1>

          <p
            style={{
              fontSize: "0.875rem",
              lineHeight: 1.6,
              opacity: 0.7,
              marginBottom: "2rem",
            }}
          >
            The application encountered an unrecoverable error.
            {error.digest && (
              <span
                style={{
                  display: "block",
                  marginTop: "0.5rem",
                  fontFamily: "monospace",
                  fontSize: "0.75rem",
                  opacity: 0.5,
                }}
              >
                Error ID: {error.digest}
              </span>
            )}
          </p>

          <button
            onClick={reset}
            style={{
              padding: "0.75rem 2rem",
              borderRadius: "0.75rem",
              border: "none",
              background: "linear-gradient(135deg, #6366f1, #818cf8)",
              color: "white",
              fontSize: "0.875rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Reload Application
          </button>
        </div>
      </body>
    </html>
  );
}
