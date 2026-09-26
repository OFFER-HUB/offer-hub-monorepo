import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { LoadingBar } from "@/components/ui/LoadingBar";
import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

/**
 * Shared shell for the per-route `loading.tsx` placeholders.
 *
 * The eight content-page loading states (`changelog`, `blueprint`, `terms`,
 * `community`, `architecture`, `privacy`, `pricing`, `use-cases`) all render the
 * same chrome: a `LoadingBar`, the `Navbar`, a `<main>` wrapping their skeleton
 * content, and the `Footer`. That shell — plus its three import lines — used to
 * be copy/pasted into every file. This component centralises it; each route
 * keeps its own unique skeleton layout as `children` and overrides the outer
 * container / `<main>` classes to preserve its exact layout.
 */
interface PageLoadingSkeletonProps {
  children: ReactNode;
  /** Classes for the outer container (merged onto `min-h-screen bg-transparent`). */
  className?: string;
  /** Classes for the `<main>` element. */
  mainClassName?: string;
}

export function PageLoadingSkeleton({ children, className, mainClassName }: PageLoadingSkeletonProps) {
  return (
    <div className={cn("min-h-screen bg-transparent", className)}>
      <LoadingBar />
      <Navbar />
      <main className={mainClassName}>{children}</main>
      <Footer />
    </div>
  );
}
