"use client";

import { cn } from "@/lib/cn";
import { CodeBlock } from "./CodeBlock";
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
  const headingId = `${label.toLowerCase().replace(/\s+/g, "-")}-heading`;

  return (
    <section
      className={cn(
        "my-10 grid w-full min-w-0 gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]",
        className,
      )}
      aria-labelledby={headingId}
    >
      <div className="min-w-0">
        <h3
          id={headingId}
          className="mb-3 text-sm font-bold uppercase tracking-[0.12em] text-content-primary"
        >
          {label}
        </h3>
        <ParamTable fields={fields} label={`${label} fields`} className="my-0" />
      </div>
      <div className="min-w-0">
        <CodeBlock
          code={JSON.stringify(example, null, 2)}
          language="json"
          title="JSON example"
          dense
          className="my-0"
        />
      </div>
    </section>
  );
}
