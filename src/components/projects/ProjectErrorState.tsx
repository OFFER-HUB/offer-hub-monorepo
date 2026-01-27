"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

interface ProjectErrorStateProps {
  error?: Error | null;
  onRetry?: () => void;
}

export function ProjectErrorState({ error, onRetry }: ProjectErrorStateProps) {
  const errorMessage = error?.message || "Something went wrong while loading projects.";

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="rounded-full bg-red-100 p-6 mb-4">
        <AlertCircle className="w-12 h-12 text-red-600" />
      </div>
      
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        Oops! Something Went Wrong
      </h3>
      
      <p className="text-gray-600 text-center max-w-md mb-6">
        {errorMessage}
      </p>

      <div className="flex gap-3">
        {onRetry && (
          <Button 
            onClick={onRetry}
            className="gap-2 bg-indigo-600 hover:bg-indigo-700"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
        )}
        
        <Link href="/onboarding/dashboard">
          <Button variant="outline" className="gap-2">
            <Home className="w-4 h-4" />
            Go to Dashboard
          </Button>
        </Link>
      </div>

      {error && (
        <details className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200 max-w-md w-full">
          <summary className="text-sm font-medium text-gray-700 cursor-pointer">
            Technical Details
          </summary>
          <pre className="mt-2 text-xs text-gray-600 overflow-auto">
            {error.stack || error.message}
          </pre>
        </details>
      )}
    </div>
  );
}

export default ProjectErrorState;
