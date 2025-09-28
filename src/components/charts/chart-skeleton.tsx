import { cn } from "@/lib/utils"
import { FC } from "react"

interface ChartSkeletonProps {
  className?: string
  height?: number | string
  width?: number | string
  variant?: 'default' | 'bar' | 'area'
}

const ChartSkeleton: FC<ChartSkeletonProps> = ({
  className,
  height = 300,
  width = "100%",
  variant = 'default'
}) => {
  const renderOverlay = () => {
    if (variant === 'bar') {
      return (
        <div className="flex h-full items-end justify-around px-4 pb-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="w-12 bg-gray-300 dark:bg-gray-700"
              style={{ height: `${Math.random() * 60 + 20}%` }}
            />
          ))}
        </div>
      )
    }
    if (variant === 'area') {
      return (
        <div className="relative h-full w-full">
          <div className="absolute bottom-0 h-[60%] w-full bg-gradient-to-t from-gray-300/50 to-transparent dark:from-gray-700/50" />
        </div>
      )
    }
    return null
  }

  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700",
        className
      )}
      style={{
        height,
        width,
      }}
    >
      <div className="h-full w-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent">
        {renderOverlay()}
      </div>
    </div>
  )
}

export default ChartSkeleton