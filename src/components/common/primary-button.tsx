import * as React from "react"
import { Button, ButtonProps } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface PrimaryButtonProps extends Omit<ButtonProps, 'variant'> {
  className?: string
}

const PrimaryButton = React.forwardRef<HTMLButtonElement, PrimaryButtonProps>(
  ({ className, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant="default"
        className={cn("", className)}
        {...props}
      />
    )
  }
)

PrimaryButton.displayName = "PrimaryButton"

export { PrimaryButton }