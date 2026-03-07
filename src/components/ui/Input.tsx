import { useId } from "react";
import { cn } from "@/lib/cn";
import type { InputHTMLAttributes, ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: ReactNode;
    iconPosition?: "left" | "right";
    rightElement?: ReactNode;
}

export function Input({
    label,
    error,
    icon,
    iconPosition = "left",
    rightElement,
    className,
    id,
    "aria-describedby": ariaDescribedBy,
    ...props
}: InputProps) {
    const generatedId = useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;

    return (
        <div className="flex flex-col gap-1.5 w-full">
            {label && (
                <label
                    htmlFor={inputId}
                    className="text-sm font-medium text-[#19213D]"
                >
                    {label}
                </label>
            )}
            <div className="relative w-full">
                {icon && iconPosition === "left" && (
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6D758F]" aria-hidden="true">
                        {icon}
                    </span>
                )}
                <input
                    id={inputId}
                    aria-invalid={error ? "true" : undefined}
                    aria-describedby={error ? errorId : ariaDescribedBy}
                    className={cn(
                        "w-full rounded-xl bg-[#F1F3F7] px-4 py-3 text-[#19213D]",
                        "shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff]",
                        "placeholder:text-[#6D758F]",
                        "focus:outline-none focus:ring-2 focus:ring-[#149A9B]",
                        "transition-all duration-200",
                        icon && iconPosition === "left" && "pl-12",
                        icon && iconPosition === "right" && "pr-12",
                        error && "ring-2 ring-red-500",
                        className
                    )}
                    {...props}
                />
                {icon && iconPosition === "right" && !rightElement && (
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6D758F]" aria-hidden="true">
                        {icon}
                    </span>
                )}
                {rightElement && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center">
                        {rightElement}
                    </div>
                )}
            </div>
            {error && (
                <span id={errorId} className="text-sm text-red-500" role="alert">
                    {error}
                </span>
            )}
        </div>
    );
}
