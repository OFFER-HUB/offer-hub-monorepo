"use client";

import { useId } from "react";
import type { ComponentPropsWithRef, ReactNode } from "react";
import { cn } from "@/lib/cn";

interface FieldOwnProps {
  /** Visible label above the control. Required for accessibility; hide it with `hideLabel`. */
  label: ReactNode;
  /** Keeps the label for screen readers only (search boxes with an icon). */
  hideLabel?: boolean;
  labelClassName?: string;
  /** Rendered on the label row, right-aligned (e.g. a "required" badge). */
  labelExtra?: ReactNode;
  /** Help text under the label, linked with aria-describedby. */
  hint?: ReactNode;
  /** Error message under the control, in theme-error; sets aria-invalid. */
  error?: string;
  /** Shows "used/max" on the label row when the control has a maxLength. */
  showCount?: boolean;
  /** Decorative icon inside the box, before the control. */
  leadingIcon?: ReactNode;
  /** Interactive or decorative element inside the box, after the control. */
  trailing?: ReactNode;
  /** Classes for the outer wrapper (label + box + error). */
  containerClassName?: string;
}

type InputFieldProps = FieldOwnProps & { as?: "input" } & ComponentPropsWithRef<"input">;
type TextareaFieldProps = FieldOwnProps & { as: "textarea" } & ComponentPropsWithRef<"textarea">;
type SelectFieldProps = FieldOwnProps & { as: "select" } & ComponentPropsWithRef<"select">;

export type FieldProps = InputFieldProps | TextareaFieldProps | SelectFieldProps;

/**
 * Sunken box: inset 4/8 (shadow-neu-sunken), rounded-xl, ≥ 44px tall.
 * The focus ring lives on the box (focus-within) so icons and trailing
 * buttons sit inside the same ring.
 */
const BOX_CLASS =
  "relative flex w-full min-h-11 rounded-xl bg-bg-sunken shadow-neu-sunken transition-shadow duration-200 motion-reduce:transition-none focus-within:ring-2 focus-within:ring-theme-primary";

const CONTROL_CLASS =
  "min-h-11 w-full min-w-0 flex-1 bg-transparent px-4 py-2.5 text-base text-content-primary placeholder:text-content-secondary outline-none disabled:cursor-not-allowed";

const LABEL_CLASS = "text-xs font-semibold uppercase tracking-widest text-content-primary";

function counterClass(length: number, max: number): string {
  if (length >= max * 0.96) return "text-theme-error";
  if (length >= max * 0.8) return "text-theme-warning";
  return "text-content-secondary";
}

function valueLength(value: unknown): number {
  if (typeof value === "string") return value.length;
  if (typeof value === "number") return String(value).length;
  return 0;
}

export function Field(props: FieldProps) {
  const {
    label,
    hideLabel = false,
    labelClassName,
    labelExtra,
    hint,
    error,
    showCount = false,
    leadingIcon,
    trailing,
    containerClassName,
    className,
    id,
    "aria-describedby": ariaDescribedBy,
    ...rest
  } = props;

  const generatedId = useId();
  const controlId = id ?? generatedId;
  const hintId = hint ? `${controlId}-hint` : undefined;
  const errorId = error ? `${controlId}-error` : undefined;
  const describedBy = [ariaDescribedBy, hintId, errorId].filter(Boolean).join(" ") || undefined;

  const as = (rest as { as?: string }).as ?? "input";
  const maxLength = "maxLength" in rest ? rest.maxLength : undefined;
  const disabled = "disabled" in rest ? rest.disabled : undefined;
  const length = valueLength("value" in rest ? rest.value : undefined);

  const shared = {
    id: controlId,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy,
    className: cn(
      CONTROL_CLASS,
      leadingIcon && "pl-3",
      trailing && "pr-2",
      as === "textarea" && "resize-y py-3",
      as === "select" && "cursor-pointer pr-4",
      className,
    ),
  };

  let control: ReactNode;
  if (as === "textarea") {
    const { as: _as, ...textareaProps } = rest as Omit<TextareaFieldProps, keyof FieldOwnProps>;
    void _as;
    control = <textarea {...textareaProps} {...shared} />;
  } else if (as === "select") {
    const { as: _as, ...selectProps } = rest as Omit<SelectFieldProps, keyof FieldOwnProps>;
    void _as;
    control = <select {...selectProps} {...shared} />;
  } else {
    const { as: _as, ...inputProps } = rest as Omit<InputFieldProps, keyof FieldOwnProps>;
    void _as;
    control = <input {...inputProps} {...shared} />;
  }

  const showCounter = showCount && typeof maxLength === "number";

  return (
    <div className={cn("flex w-full flex-col gap-1.5", containerClassName)}>
      {(!hideLabel || labelExtra || showCounter) && (
        <div className={cn("flex items-center justify-between gap-2", hideLabel && "justify-end")}>
          {!hideLabel && (
            <label htmlFor={controlId} className={cn(LABEL_CLASS, labelClassName)}>
              {label}
            </label>
          )}
          {(labelExtra || showCounter) && (
            <div className="flex items-center gap-2">
              {labelExtra}
              {showCounter && (
                <span className={cn("text-xs font-semibold tabular-nums", counterClass(length, maxLength))}>
                  {length}/{maxLength}
                </span>
              )}
            </div>
          )}
        </div>
      )}
      {hideLabel && (
        <label htmlFor={controlId} className="sr-only">
          {label}
        </label>
      )}

      {hint && (
        <p id={hintId} className="text-xs leading-relaxed text-content-secondary">
          {hint}
        </p>
      )}

      <div
        className={cn(
          BOX_CLASS,
          as === "textarea" ? "items-start" : "items-center",
          error && "ring-2 ring-theme-error",
          disabled && "opacity-50",
        )}
      >
        {leadingIcon && (
          <span
            aria-hidden="true"
            className={cn("flex shrink-0 pl-4 text-content-secondary", as === "textarea" && "pt-3.5")}
          >
            {leadingIcon}
          </span>
        )}
        {control}
        {trailing && <div className="flex shrink-0 items-center pr-1">{trailing}</div>}
      </div>

      {error && (
        <p id={errorId} role="alert" className="text-sm text-theme-error">
          {error}
        </p>
      )}
    </div>
  );
}
