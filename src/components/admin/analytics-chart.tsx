import { FC } from "react"
import { Card } from "@/components/ui/card"
import ChartSkeleton from "../charts/chart-skeleton"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { cn } from "@/lib/utils"

interface AnalyticsChartProps {
  data: any[]
  isLoading?: boolean
  className?: string
}

const AnalyticsChart: FC<AnalyticsChartProps> = ({
  data,
  isLoading = false,
  className,
}) => {
  if (isLoading) {
    return <ChartSkeleton variant="bar" className={className} height={350} />
  }

  return (
    <Card className={cn("p-4", className)}>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="total" fill="#3b82f6" />
          <Bar dataKey="completed" fill="#22c55e" />
          <Bar dataKey="active" fill="#eab308" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}

export default AnalyticsChart