"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export type SchemaField = {
  name: string;
  type: string;
  required?: boolean;
  description?: ReactNode;
  defaultValue?: ReactNode;
  enum?: readonly string[];
  nullable?: boolean;
  deprecated?: boolean | string;
  children?: SchemaField[];
};

export type ParamTableProps = {
  fields: SchemaField[];
  label?: string;
  className?: string;
};

function Metadata({ field }: { field: SchemaField }) {
  return (
    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-content-secondary">
      {field.defaultValue !== undefined && (
        <span>
          Default:{" "}
          <code className="font-mono text-content-primary">
            {String(field.defaultValue)}
          </code>
        </span>
      )}
      {field.enum && field.enum.length > 0 && (
        <span>
          One of:{" "}
          {field.enum.map((value) => (
            <code key={value} className="mr-1 font-mono text-theme-primary">
              {value}
            </code>
          ))}
        </span>
      )}
      {field.nullable && <span className="text-theme-warning">Nullable</span>}
      {field.deprecated && (
        <span className="text-theme-warning">
          Deprecated
          {typeof field.deprecated === "string" ? `: ${field.deprecated}` : ""}
        </span>
      )}
    </div>
  );
}

function FieldRows({
  fields,
  depth = 0,
}: {
  fields: SchemaField[];
  depth?: number;
}) {
  const [openFields, setOpenFields] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      fields
        .filter((field) => field.children?.length)
        .map((field) => [field.name, true]),
    ),
  );

  return (
    <>
      {fields.map((field) => {
        const hasChildren = Boolean(field.children?.length);
        const isOpen = openFields[field.name] ?? false;

        return (
          <>
            <tr className="align-top text-sm text-content-primary">
              <td
                className="w-[22%] px-4 py-4 font-mono font-semibold"
                style={{ paddingLeft: `${1 + depth * 1.25}rem` }}
              >
                <div className="flex items-start gap-2">
                  {hasChildren ? (
                    <button
                      type="button"
                      className="mt-0.5 shrink-0 rounded p-0.5 text-content-secondary hover:text-theme-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary"
                      aria-label={`${isOpen ? "Collapse" : "Expand"} ${field.name}`}
                      aria-expanded={isOpen}
                      onClick={() =>
                        setOpenFields((current) => ({
                          ...current,
                          [field.name]: !isOpen,
                        }))
                      }
                    >
                      {isOpen ? (
                        <ChevronDown size={15} aria-hidden="true" />
                      ) : (
                        <ChevronRight size={15} aria-hidden="true" />
                      )}
                    </button>
                  ) : (
                    <span className="w-5" aria-hidden="true" />
                  )}
                  <span
                    className={cn(
                      field.deprecated && "line-through opacity-70",
                    )}
                  >
                    {field.name}
                  </span>
                </div>
              </td>
              <td className="w-[16%] px-4 py-4 font-mono text-xs text-theme-primary">
                {field.type}
                {field.nullable ? " | null" : ""}
              </td>
              <td className="w-[12%] px-4 py-4 text-xs font-semibold">
                {field.required ? (
                  <span className="text-theme-primary">Yes</span>
                ) : (
                  <span className="text-content-muted">No</span>
                )}
              </td>
              <td className="px-4 py-4 leading-relaxed text-content-secondary">
                {field.description || (
                  <span className="text-content-muted">No description</span>
                )}
                <Metadata field={field} />
              </td>
            </tr>
            {hasChildren && isOpen && (
              <FieldRows fields={field.children ?? []} depth={depth + 1} />
            )}
          </>
        );
      })}
    </>
  );
}

export function ParamTable({
  fields = [],
  label = "Request parameters",
  className,
}: ParamTableProps) {
  return (
    <div
      className={cn(
        "my-8 overflow-x-auto rounded-2xl bg-bg-base p-3 shadow-neu-raised",
        className,
      )}
      tabIndex={0}
      role="region"
      aria-label={label}
    >
      <table className="min-w-[720px] w-full border-collapse text-left">
        <caption className="sr-only">{label}</caption>
        <thead className="bg-bg-sunken text-[11px] uppercase tracking-[0.12em] text-theme-primary shadow-neu-sunken-subtle">
          <tr>
            <th scope="col" className="px-4 py-3 font-black">
              Name
            </th>
            <th scope="col" className="px-4 py-3 font-black">
              Type
            </th>
            <th scope="col" className="px-4 py-3 font-black">
              Required
            </th>
            <th scope="col" className="px-4 py-3 font-black">
              Description
            </th>
          </tr>
        </thead>
        <tbody className="bg-bg-base">
          <FieldRows fields={fields} />
        </tbody>
      </table>
    </div>
  );
}

export default ParamTable;
