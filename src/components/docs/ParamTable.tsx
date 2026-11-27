"use client";

import { Fragment, useState, type ReactNode } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
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

/** Shared table cell styles used by MDX tables and the roadmap table. */
export const TABLE_HEAD_CLASS =
  "bg-bg-sunken px-4 py-3 text-xs font-semibold uppercase tracking-widest text-content-secondary";
export const TABLE_ROW_CLASS =
  "border-b border-theme-border align-top text-sm text-content-primary transition-colors duration-200 hover:bg-[color-mix(in_srgb,var(--color-primary)_6%,var(--color-bg-base))]";
export const TABLE_CELL_CLASS =
  "px-4 py-4 align-top leading-relaxed text-content-secondary";

/**
 * The single table surface. Wide content scrolls inside the labelled region
 * instead of widening the page; at 390px the region stays within its column.
 */
export function Table({
  label,
  caption,
  children,
  className,
}: {
  label: string;
  caption?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "my-8 w-full min-w-0 max-w-full rounded-2xl bg-bg-base p-1 shadow-neu-raised",
        className,
      )}
    >
      <div
        tabIndex={0}
        role="region"
        aria-label={label}
        className="max-w-full overflow-x-auto rounded-2xl scrollbar-thin scrollbar-track-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary"
      >
        <table className="w-full min-w-[32rem] border-collapse text-left">
          {caption && <caption className="sr-only">{caption}</caption>}
          {children}
        </table>
      </div>
    </div>
  );
}

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
          <Fragment key={`${depth}-${field.name}`}>
            <tr className={TABLE_ROW_CLASS}>
              <td
                className={cn(TABLE_CELL_CLASS, "w-[22%] font-mono font-semibold")}
                style={{ paddingLeft: `${1 + depth * 1.25}rem` }}
              >
                <div className="flex items-start gap-2">
                  {hasChildren ? (
                    <button
                      type="button"
                      className="mt-0.5 shrink-0 rounded-full p-0.5 text-content-secondary hover:text-theme-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary"
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
                  <span className={cn(field.deprecated && "line-through opacity-70")}>
                    {field.name}
                  </span>
                </div>
              </td>
              <td className={cn(TABLE_CELL_CLASS, "w-[16%] font-mono text-xs text-theme-primary")}>
                {field.type}
                {field.nullable ? " | null" : ""}
              </td>
              <td className={cn(TABLE_CELL_CLASS, "w-[12%] text-xs font-semibold")}>
                {field.required ? (
                  <span className="text-theme-primary">Yes</span>
                ) : (
                  <span className="text-content-muted">No</span>
                )}
              </td>
              <td className={TABLE_CELL_CLASS}>
                {field.description || (
                  <span className="text-content-muted">No description</span>
                )}
                <Metadata field={field} />
              </td>
            </tr>
            {hasChildren && isOpen && (
              <FieldRows fields={field.children ?? []} depth={depth + 1} />
            )}
          </Fragment>
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
    <Table label={label} caption={label} className={className}>
      <thead>
        <tr>
          {["Name", "Type", "Required", "Description"].map((heading) => (
            <th key={heading} scope="col" className={TABLE_HEAD_CLASS}>
              {heading}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="bg-bg-base">
        <FieldRows fields={fields} />
      </tbody>
    </Table>
  );
}
