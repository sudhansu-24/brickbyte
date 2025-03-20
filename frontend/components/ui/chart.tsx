import type * as React from "react"

import { cn } from "@/lib/utils"

const ChartContainer = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return <div className={cn("relative w-full", className)} {...props} />
}

const Chart = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return <div className={cn("w-full", className)} {...props} />
}

const ChartTooltip = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return <div className={cn("bg-popover text-popover-foreground rounded-md shadow-md p-2", className)} {...props} />
}

const ChartTooltipContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return <div className={cn("text-sm", className)} {...props} />
}

const ChartLegend = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return <div className={cn("flex items-center space-x-2", className)} {...props} />
}

const ChartLegendItem = ({
  name,
  color,
  className,
  ...props
}: { name: string; color: string } & React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={cn("flex items-center space-x-1", className)} {...props}>
      <span className="block h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-sm">{name}</span>
    </div>
  )
}

export { Chart, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendItem }

