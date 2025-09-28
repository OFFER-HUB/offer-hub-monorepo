import { FC } from "react"
import { Card } from "@/components/ui/card"
import ChartSkeleton from "@/components/charts/chart-skeleton"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { cn } from "@/lib/utils"

interface EarningsChartProps {
  data: any[]
  isLoading?: boolean
  className?: string
}

const EarningsChart: FC<EarningsChartProps> = ({
  data,
  isLoading = false,
  className,
}) => {
  if (isLoading) {
    return <ChartSkeleton variant="area" className={className} height={300} />
  }

  return (
    <Card className={cn("p-4", className)}>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip formatter={(value) => `$${value}`} />
          <Area type="monotone" dataKey="earnings" fill="#10b981" stroke="#059669" />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  )
}

export default EarningsChart