"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Brain, TrendingUp } from "lucide-react"
import {
  Chart,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendItem,
} from "@/components/ui/chart"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Area, AreaChart, Tooltip } from "recharts"

// Mock data for market insights
const tokenValueData = [
  { month: "Jan", value: 100, yield: 5.2 },
  { month: "Feb", value: 120, yield: 5.5 },
  { month: "Mar", value: 115, yield: 5.3 },
  { month: "Apr", value: 130, yield: 5.7 },
  { month: "May", value: 145, yield: 6.0 },
  { month: "Jun", value: 160, yield: 6.2 },
  { month: "Jul", value: 170, yield: 6.5 },
  { month: "Aug", value: 185, yield: 6.8 },
  { month: "Sep", value: 195, yield: 7.0 },
  { month: "Oct", value: 210, yield: 7.2 },
  { month: "Nov", value: 225, yield: 7.5 },
  { month: "Dec", value: 240, yield: 7.8 },
]

const marketTrends = [
  {
    id: 1,
    title: "Urban Residential",
    change: "+8.3%",
    prediction: "High growth potential in Q3",
    isPositive: true,
  },
  {
    id: 2,
    title: "Commercial Office Space",
    change: "-2.1%",
    prediction: "Recovery expected by Q4",
    isPositive: false,
  },
  {
    id: 3,
    title: "Industrial Properties",
    change: "+12.7%",
    prediction: "Continued strong performance",
    isPositive: true,
  },
  {
    id: 4,
    title: "Retail Spaces",
    change: "+3.2%",
    prediction: "Moderate growth expected",
    isPositive: true,
  },
]

export default function MarketInsights() {
  const [filter, setFilter] = useState("roi")

  return (
    <section id="insights" className="py-20">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <div className="flex items-center justify-center mb-4">
            <h2 className="text-3xl font-bold">AI-Powered Market Insights</h2>
            <Brain className="ml-2 h-6 w-6 text-blue-500" />
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our AI analyzes market trends and property data to provide you with the most accurate investment insights.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Real-Time Token Value & Rental Yield</CardTitle>
                <CardDescription>Track performance over the last 12 months</CardDescription>
              </div>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="roi">Sort by ROI</SelectItem>
                  <SelectItem value="value">Sort by Value</SelectItem>
                  <SelectItem value="location">Sort by Location</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="value" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="value">Token Value</TabsTrigger>
                  <TabsTrigger value="yield">Rental Yield</TabsTrigger>
                </TabsList>
                <TabsContent value="value" className="h-[350px]">
                  <ChartContainer>
                    <ChartLegend>
                      <ChartLegendItem name="Token Value" color="#3b82f6" />
                    </ChartLegend>
                    <Chart>
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={tokenValueData}>
                          <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `$${value}`}
                          />
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <Tooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <ChartTooltip>
                                    <ChartTooltipContent>
                                      <p className="text-sm font-medium">{payload[0].payload.month}</p>
                                      <p className="text-sm">Token Value: ${payload[0].value}</p>
                                    </ChartTooltipContent>
                                  </ChartTooltip>
                                )
                              }
                              return null
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#3b82f6"
                            fillOpacity={1}
                            fill="url(#colorValue)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </Chart>
                  </ChartContainer>
                </TabsContent>
                <TabsContent value="yield" className="h-[350px]">
                  <ChartContainer>
                    <ChartLegend>
                      <ChartLegendItem name="Rental Yield %" color="#10b981" />
                    </ChartLegend>
                    <Chart>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={tokenValueData}>
                          <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `${value}%`}
                          />
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <Tooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <ChartTooltip>
                                    <ChartTooltipContent>
                                      <p className="text-sm font-medium">{payload[0].payload.month}</p>
                                      <p className="text-sm">Rental Yield: {payload[0].value}%</p>
                                    </ChartTooltipContent>
                                  </ChartTooltip>
                                )
                              }
                              return null
                            }}
                          />
                          <Line type="monotone" dataKey="yield" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </Chart>
                  </ChartContainer>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Market Trends</CardTitle>
                <CardDescription>AI-powered predictions and analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {marketTrends.map((trend) => (
                    <div key={trend.id} className="flex items-start justify-between p-3 rounded-lg border">
                      <div>
                        <h4 className="font-medium">{trend.title}</h4>
                        <p className="text-sm text-muted-foreground">{trend.prediction}</p>
                      </div>
                      <div className="flex flex-col items-end">
                        <span
                          className={`font-semibold flex items-center ${
                            trend.isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {trend.change}
                          {trend.isPositive ? (
                            <TrendingUp className="ml-1 h-4 w-4" />
                          ) : (
                            <TrendingUp className="ml-1 h-4 w-4 transform rotate-180" />
                          )}
                        </span>
                        <Badge
                          variant="outline"
                          className="mt-1 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                        >
                          <Brain className="mr-1 h-3 w-3" />
                          AI Prediction
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}

