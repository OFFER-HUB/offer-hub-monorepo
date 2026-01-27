"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Send, 
  Loader2,
  CheckCircle2 
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ExpressInterestButtonProps {
  projectId: string;
  disabled?: boolean;
  isSubmitting?: boolean;
  onSubmit?: (projectId: string) => void;
}

export function ExpressInterestButton({ 
  projectId,
  disabled = true, // Disabled by default as it's a placeholder
  isSubmitting = false,
  onSubmit
}: ExpressInterestButtonProps) {
  const [submitted, setSubmitted] = useState(false);

  const handleClick = () => {
    if (onSubmit && !disabled) {
      onSubmit(projectId);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    }
  };

  const ButtonContent = () => {
    if (isSubmitting) {
      return (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          Submitting...
        </>
      );
    }

    if (submitted) {
      return (
        <>
          <CheckCircle2 className="w-5 h-5" />
          Interest Submitted!
        </>
      );
    }

    return (
      <>
        <Send className="w-5 h-5" />
        Express Interest
      </>
    );
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="w-full">
            <Button
              onClick={handleClick}
              disabled={disabled || isSubmitting || submitted}
              size="lg"
              className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed h-12 text-base font-semibold"
            >
              <ButtonContent />
            </Button>
          </div>
        </TooltipTrigger>
        {disabled && (
          <TooltipContent side="bottom" className="max-w-xs">
            <p className="text-sm">
              <strong>Coming Soon!</strong> The application system is currently under development. 
              Soon you'll be able to submit proposals and express interest in projects.
            </p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}

export default ExpressInterestButton;
