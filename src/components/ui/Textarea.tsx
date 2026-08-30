import { useId } from "react";
import { cn } from "@/lib/cn";
import type { TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    labelClassName?: string;
    labelledBy?: string;
    error?: string;
    hideWrapper?: boolean;
}

export function Textarea({
    label,
    labelClassName,
    labelledBy,
    error,
    className,
    id,
    hideWrapper = false,
    "aria-describedby": ariaDescribedBy,
    ...props
}: TextareaProps) {
    const generatedId = useId();
    const textareaId = id || generatedId;
    const errorId = `${textareaId}-error`;

    const textareaElement = (
        <textarea
            id={textareaId}
            aria-labelledby={labelledBy}
            aria-invalid={error ? "true" : undefined}
            aria-describedby={error ? errorId : ariaDescribedBy}
            className={cn(
                "w-full rounded-xl px-4 py-3",
                "bg-bg-sunken shadow-neu-sunken-subtle",
                "text-content-primary placeholder:text-content-muted",
                "focus-visible:outline-2 focus-visible:outline-theme-primary focus-visible:outline-offset-2",
                "focus-visible:ring-2 focus-visible:ring-theme-primary",
                "transition-all duration-200 resize-none",
                error && "ring-2 ring-theme-error",
                className
            )}
            {...props}
        />
    );

    if (hideWrapper) {
        return (
            <>
                {textareaElement}
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
                    htmlFor={textareaId}
                    className={cn("text-sm font-medium text-content-primary", labelClassName)}
                >
                    {label}
                </label>
            )}
            {textareaElement}
            {error && (
                <span id={errorId} className="text-sm text-theme-error" role="alert">
                    {error}
                </span>
            )}
        </div>
    );
}
