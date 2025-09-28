"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";

interface LoadingIndicatorProps {
  className?: string;
}

export default function LoadingIndicator({ className = "" }: LoadingIndicatorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [pathname]);

  if (!isLoading) return null;

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm ${className}`}>
      <div className="h-1 bg-gray-200">
        <div className="h-full bg-[#15949C] animate-pulse" style={{ width: "100%" }}>
          <div className="h-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
        </div>
      </div>
      <div className="flex items-center justify-center py-2">
        <Loader2 className="w-5 h-5 animate-spin text-[#15949C]" />
        <span className="ml-2 text-sm text-gray-600">Loading...</span>
      </div>
    </div>
  );
}

export function useNavigationLoading() {
  const [isLoading, setIsLoading] = useState(false);

  return {
    isLoading,
    startLoading: () => setIsLoading(true),
    stopLoading: () => setIsLoading(false),
  };
}