import * as React from "react"

import { cn } from "@/lib/utils"

export interface TextareaProps extends React.ComponentProps<"textarea"> {
  /** ARIA label for accessibility when no visible label is present */
  "aria-label"?: string;
  /** ID of element that labels this textarea */
  "aria-labelledby"?: string;
  /** ID of element that describes this textarea */
  "aria-describedby"?: string;
  /** Indicates whether the textarea is required */
  "aria-required"?: boolean;
  /** Indicates whether the textarea has an invalid value */
  "aria-invalid"?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ 
    className, 
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledby,
    "aria-describedby": ariaDescribedby,
    "aria-required": ariaRequired,
    "aria-invalid": ariaInvalid,
    ...props 
  }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledby}
        aria-describedby={ariaDescribedby}
        aria-required={ariaRequired}
        aria-invalid={ariaInvalid}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }