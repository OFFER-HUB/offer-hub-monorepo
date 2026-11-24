"use client";

import { useEffect } from "react";
import { RouteError } from "@/components/ui/RouteError";
import { logger } from "@/utils/logger";

export default function ProductError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error("Product page error:", error);
  }, [error]);

  return (
    <RouteError
      title="Unable to load product overview"
      message="Something went wrong while loading the product page. Please try again."
      reset={reset}
      showChrome
    />
  );
}
