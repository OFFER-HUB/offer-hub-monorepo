"use client";

import { AlertTriangle } from "lucide-react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f1f3f7",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "28rem",
            padding: "2.5rem",
            borderRadius: "1.5rem",
            background: "#f1f3f7",
            boxShadow:
              "10px 10px 20px #d1d3d7, -10px -10px 20px #ffffff",
            textAlign: "center",
          }}
        >
          {/* Error icon */}
          <div
            style={{
              width: "9rem",
              height: "9rem",
              borderRadius: "1rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.5rem",
              background: "#e6e8ec",
              boxShadow:
                "inset 10px 10px 20px #d1d3d7, inset -10px -10px 20px #ffffff",
            }}
          >
            <AlertTriangle size={48} color="#149A9B" strokeWidth={1.5} />
          </div>

          {/* Headline */}
          <h1
            style={{
              fontSize: "1.25rem",
              fontWeight: 700,
              marginBottom: "0.75rem",
              color: "#1a1a2e",
            }}
          >
            Critical Error
          </h1>

          {/* Subtext */}
          <p
            style={{
              fontSize: "0.875rem",
              lineHeight: 1.6,
              marginBottom: "0.5rem",
              color: "#6b7280",
            }}
          >
            A critical error occurred in the application. The root layout could
            not render. Please try again.
          </p>

          {error.digest && (
            <p
              style={{
                fontSize: "0.75rem",
                fontFamily: "monospace",
                marginBottom: "2rem",
                color: "#9ca3af",
              }}
            >
              Error ID: {error.digest}
            </p>
          )}

          {/* Buttons */}
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
            <button
              onClick={reset}
              style={{
                padding: "0.75rem 2rem",
                borderRadius: "0.75rem",
                fontSize: "0.875rem",
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
                background: "#149A9B",
                color: "#ffffff",
                boxShadow: "4px 4px 8px #d1d3d7, -4px -4px 8px #ffffff",
                transition: "all 0.3s ease",
              }}
            >
              Try Again
            </button>
            <a
              href="/"
              style={{
                padding: "0.75rem 2rem",
                borderRadius: "0.75rem",
                fontSize: "0.875rem",
                fontWeight: 600,
                textDecoration: "none",
                background: "#e6e8ec",
                color: "#6b7280",
                boxShadow:
                  "inset 3px 3px 6px #d1d3d7, inset -3px -3px 6px #ffffff",
                transition: "all 0.3s ease",
              }}
            >
              Go Home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
