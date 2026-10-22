"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

type Outcome =
  | { ok: true; message: string; data?: Record<string, unknown> }
  | { ok: false; message: string };

export function ConfirmDataRequest() {
  const token = useSearchParams().get("token") ?? "";
  const [loading, setLoading] = useState(false);
  const [outcome, setOutcome] = useState<Outcome | null>(null);

  const confirm = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/privacy/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const json = await res.json();

      if (!res.ok) {
        setOutcome({ ok: false, message: json.error ?? "An error occurred." });
      } else if (json.action === "export") {
        setOutcome({
          ok: true,
          message: "Your data is shown below. Save it for your records.",
          data: json.data,
        });
      } else {
        setOutcome({ ok: true, message: json.message ?? "Done." });
      }
    } catch {
      setOutcome({ ok: false, message: "Network error. Please try again." });
    }
    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto p-8 sm:p-10 rounded-[2.5rem] bg-bg-elevated shadow-neu-raised flex flex-col gap-6">
      <h1 className="text-2xl font-black tracking-tight text-content-primary">
        Confirm your data request
      </h1>
      {!token ? (
        <p role="alert" className="text-sm font-medium text-red-500">
          This confirmation link is invalid or has expired.
        </p>
      ) : (
        <>
          {!outcome?.ok && (
            <>
              <p className="text-sm font-medium leading-relaxed text-content-secondary">
                Confirm that you own the email address this link was sent to. The link works once.
              </p>
              <button
                type="button"
                onClick={confirm}
                disabled={loading}
                className="py-3 rounded-xl text-xs font-black uppercase tracking-wider bg-theme-primary text-white hover:bg-theme-primary-hover shadow-lg transition-colors disabled:opacity-50"
              >
                {loading ? "Processing…" : "Confirm request"}
              </button>
            </>
          )}
          {outcome && (
            <p
              role="alert"
              className={`text-sm font-medium ${outcome.ok ? "text-theme-primary" : "text-red-500"}`}
            >
              {outcome.message}
            </p>
          )}
          {outcome?.ok && outcome.data && (
            <pre className="p-4 rounded-xl shadow-neu-sunken-subtle text-xs overflow-x-auto text-content-secondary">
              {JSON.stringify(outcome.data, null, 2)}
            </pre>
          )}
        </>
      )}
    </div>
  );
}
