"use client";

import { AlertTriangle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#F1F3F7",
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
            background: "#F1F3F7",
            boxShadow:
              "10px 10px 20px rgba(0,0,0,0.12), -10px -10px 20px rgba(255,255,255,0.85)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
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
              marginBottom: "1.5rem",
              background: "#E8EAEE",
              boxShadow:
                "inset 10px 10px 20px rgba(0,0,0,0.08), inset -10px -10px 20px rgba(255,255,255,0.85)",
            }}
          >
            <AlertTriangle
              size={56}
              color="#149A9B"
              strokeWidth={1.5}
            />
          </div>

          <h1
            style={{
              fontSize: "1.25rem",
              fontWeight: 700,
              marginBottom: "0.75rem",
              color: "#1A1A1B",
            }}
          >
            A critical error occurred.
          </h1>

          <p
            style={{
              fontSize: "0.875rem",
              lineHeight: 1.6,
              marginBottom: "2rem",
              color: "#6D758F",
            }}
          >
            The application encountered an unexpected error. Please try
            reloading the page.
          </p>

          <div style={{ display: "flex", gap: "0.75rem", width: "100%" }}>
            <button
              type="button"
              onClick={() => reset()}
              style={{
                flex: 1,
                padding: "0.75rem 2rem",
                borderRadius: "0.75rem",
                border: "none",
                fontSize: "0.875rem",
                fontWeight: 600,
                cursor: "pointer",
                color: "#fff",
                background: "#149A9B",
                boxShadow: "0 4px 14px rgba(20,154,155,0.35)",
              }}
            >
              Try Again
            </button>
            <a
              href="/"
              style={{
                flex: 1,
                padding: "0.75rem 2rem",
                borderRadius: "0.75rem",
                fontSize: "0.875rem",
                fontWeight: 600,
                textDecoration: "none",
                textAlign: "center",
                color: "#6D758F",
                background: "#E8EAEE",
                boxShadow:
                  "inset 4px 4px 8px rgba(0,0,0,0.06), inset -4px -4px 8px rgba(255,255,255,0.7)",
              }}
            >
              Return Home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
