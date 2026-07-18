import { cn } from "@/lib/cn";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "rounded-lg bg-[#F3F4F6] dark:bg-bg-sunken shadow-neu-raised",
        "relative overflow-hidden",
        "before:absolute before:inset-0 before:-translate-x-full",
        "before:bg-gradient-to-r before:from-transparent before:via-white/50 before:to-transparent",
        "before:animate-shimmer motion-reduce:before:hidden",
        className,
      )}
      {...props}
    />
  );
}
