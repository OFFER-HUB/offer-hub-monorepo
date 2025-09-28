import * as React from "react"
import { Button, ButtonProps } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SecondaryButtonProps extends Omit<ButtonProps, 'variant'> {
  className?: string
}

const SecondaryButton = React.forwardRef<HTMLButtonElement, SecondaryButtonProps>(
  ({ className, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant="secondary"
        className={cn("", className)}
        {...props}
      />
    )
  }
)

SecondaryButton.displayName = "SecondaryButton"

export { SecondaryButton }