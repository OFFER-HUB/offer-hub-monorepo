"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { LegalLayout } from "@/components/legal/LegalLayout";
import { Button } from "@/components/ui/Button";

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
    <LegalLayout eyebrow="Privacy & Data Rights" title="Confirm your data request" updated="April 28, 2026" sections={[]}>
    <div className="mx-auto flex max-w-xl flex-col gap-6 rounded-3xl bg-bg-elevated p-8 shadow-neu-raised sm:p-10">
      {!token ? (
        <p role="alert" className="text-sm font-medium text-theme-error">
          This confirmation link is invalid or has expired.
        </p>
      ) : (
        <>
          {!outcome?.ok && (
            <>
              <p className="text-sm font-medium leading-relaxed text-content-secondary">
                Confirm that you own the email address this link was sent to. The link works once.
              </p>
              <Button
                type="button"
                onClick={confirm}
                disabled={loading}
                loading={loading}
              >
                {loading ? "Processing…" : "Confirm request"}
              </Button>
            </>
          )}
          {outcome && (
            <p
              role="alert"
              className={`text-sm font-medium ${outcome.ok ? "text-theme-success" : "text-theme-error"}`}
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
    </LegalLayout>
  );
}
