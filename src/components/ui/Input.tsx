import { useId } from "react";
import { cn } from "@/lib/cn";
import type { InputHTMLAttributes, ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    labelClassName?: string;
    labelledBy?: string;
    error?: string;
    icon?: ReactNode;
    iconPosition?: "left" | "right";
    rightElement?: ReactNode;
    hideWrapper?: boolean;
}

export function Input({
    label,
    labelClassName,
    labelledBy,
    error,
    icon,
    iconPosition = "left",
    rightElement,
    className,
    id,
    hideWrapper = false,
    "aria-describedby": ariaDescribedBy,
    ...props
}: InputProps) {
    const generatedId = useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;

    const inputElement = (
        <div className="relative w-full">
            {icon && iconPosition === "left" && (
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-content-secondary" aria-hidden="true">
                    {icon}
                </span>
            )}
            <input
                id={inputId}
                aria-labelledby={labelledBy}
                aria-invalid={error ? "true" : undefined}
                aria-describedby={error ? errorId : ariaDescribedBy}
                className={cn(
                    "w-full rounded-xl px-4 py-3",
                    "bg-bg-sunken shadow-neu-sunken-subtle",
                    "text-content-primary placeholder:text-content-muted",
                    "focus-visible:outline-2 focus-visible:outline-theme-primary focus-visible:outline-offset-2",
                    "focus-visible:ring-2 focus-visible:ring-theme-primary",
                    "transition-all duration-200",
                    icon && iconPosition === "left" && "pl-12",
                    icon && iconPosition === "right" && "pr-12",
                    error && "ring-2 ring-theme-error",
                    className
                )}
                {...props}
            />
            {icon && iconPosition === "right" && !rightElement && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-content-secondary" aria-hidden="true">
                    {icon}
                </span>
            )}
            {rightElement && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center">
                    {rightElement}
                </div>
            )}
        </div>
    );

    if (hideWrapper) {
        return (
            <>
                {inputElement}
                {error && (
                    <span id={errorId} className="text-sm text-theme-error" role="alert">
                        {error}
                    </span>
                )}
            </>
        );
    }

    return (
        <div className="flex flex-col gap-1.5 w-full">
            {label && (
                <label
                    htmlFor={inputId}
                    className={cn("text-sm font-medium text-content-primary", labelClassName)}
                >
                    {label}
                </label>
            )}
            {inputElement}
            {error && (
                <span id={errorId} className="text-sm text-theme-error" role="alert">
                    {error}
                </span>
            )}
        </div>
    );
}
