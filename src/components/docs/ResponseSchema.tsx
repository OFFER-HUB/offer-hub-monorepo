"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { ParamTable, type SchemaField } from "./ParamTable";

export type ResponseSchemaProps = {
  fields: SchemaField[];
  example: unknown;
  label?: string;
  className?: string;
};

export function ResponseSchema({
  fields = [],
  example,
  label = "Response schema",
  className,
}: ResponseSchemaProps) {
  const [copied, setCopied] = useState(false);
  const formattedExample = JSON.stringify(example, null, 2);

  async function copyExample() {
    await navigator.clipboard.writeText(formattedExample);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section
      className={cn(
        "my-10 grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(20rem,1.1fr)]",
        className,
      )}
      aria-labelledby={`${label.toLowerCase().replace(/\s+/g, "-")}-heading`}
    >
      <div className="min-w-0">
        <h3
          id={`${label.toLowerCase().replace(/\s+/g, "-")}-heading`}
          className="mb-3 text-sm font-black uppercase tracking-[0.12em] text-content-primary"
        >
          {label}
        </h3>
        <ParamTable
          fields={fields}
          label={`${label} fields`}
          className="my-0"
        />
      </div>
      <div className="min-w-0 rounded-2xl bg-bg-base p-4 shadow-neu-raised">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h4 className="text-sm font-black uppercase tracking-[0.12em] text-content-primary">
            JSON example
          </h4>
          <button
            type="button"
            onClick={copyExample}
            className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-bg-base px-3 text-xs font-bold text-content-secondary shadow-neu-raised-sm transition-shadow hover:text-theme-primary hover:shadow-neu-raised-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary"
            aria-label="Copy JSON example"
          >
            {copied ? (
              <Check size={15} aria-hidden="true" />
            ) : (
              <Copy size={15} aria-hidden="true" />
            )}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <pre
          className="max-h-[34rem] overflow-auto rounded-xl bg-bg-sunken p-4 text-xs leading-relaxed text-content-primary shadow-neu-sunken-subtle"
          tabIndex={0}
          aria-label="JSON response example"
        >
          <code>{formattedExample}</code>
        </pre>
        <p className="sr-only" aria-live="polite">
          {copied ? "JSON example copied" : ""}
        </p>
      </div>
    </section>
  );
}

export default ResponseSchema;
