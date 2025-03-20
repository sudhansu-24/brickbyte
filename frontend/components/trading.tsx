"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowDownUp, DollarSign, TrendingUp, ArrowRight, Brain } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Chart, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts"

// Mock data for trading
const properties = [
  { id: 1, name: "Skyline Towers", currentPrice: 125.5 },
  { id: 2, name: "Oceanview Residences", currentPrice: 87.25 },
  { id: 3, name: "Tech Hub Office Park", currentPrice: 210.75 },
  { id: 4, name: "Mountain View Apartments", currentPrice: 65.3 },
]

const priceHistoryData = [
  { time: "9:00", price: 125.5 },
  { time: "10:00", price: 126.2 },
  { time: "11:00", price: 127.8 },
  { time: "12:00", price: 126.5 },
  { time: "13:00", price: 128.3 },
  { time: "14:00", price: 130.1 },
  { time: "15:00", price: 129.7 },
  { time: "16:00", price: 131.2 },
  { time: "17:00", price: 132.5 },
]

export default function Trading() {
  const { toast } = useToast()
  const [selectedProperty, setSelectedProperty] = useState("")
  const [amount, setAmount] = useState("")
  const [quantity, setQuantity] = useState("")
  const [activeTab, setActiveTab] = useState("buy")

  const handlePropertyChange = (value: string) => {
    setSelectedProperty(value)
    const property = properties.find((p) => p.id.toString() === value)
    if (property) {
      // Suggest AI-based pricing
      const suggestedPrice = (property.currentPrice * 0.98).toFixed(2)
      toast({
        title: "AI Suggestion",
        description: `Suggested buy price: $${suggestedPrice} (2% below market)`,
      })
    }
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value)
    if (selectedProperty) {
      const property = properties.find((p) => p.id.toString() === selectedProperty)
      if (property && e.target.value) {
        const calculatedQuantity = (Number.parseFloat(e.target.value) / property.currentPrice).toFixed(2)
        setQuantity(calculatedQuantity)
      }
    }
  }

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuantity(e.target.value)
    if (selectedProperty) {
      const property = properties.find((p) => p.id.toString() === selectedProperty)
      if (property && e.target.value) {
        const calculatedAmount = (Number.parseFloat(e.target.value) * property.currentPrice).toFixed(2)
        setAmount(calculatedAmount)
      }
    }
  }

  const handleTransaction = () => {
    if (!selectedProperty || !amount || !quantity) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    const property = properties.find((p) => p.id.toString() === selectedProperty)
    if (!property) return

    toast({
      title: `${activeTab === "buy" ? "Purchase" : "Sale"} Successful`,
      description: `You have ${
        activeTab === "buy" ? "purchased" : "sold"
      } ${quantity} tokens of ${property.name} for $${amount}`,
    })

    // Reset form
    setSelectedProperty("")
    setAmount("")
    setQuantity("")
  }

  return (
    <section id="trading" className="py-20">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Trading Platform</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Buy and sell property tokens with real-time pricing and AI-powered suggestions.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Token Trading</CardTitle>
              <CardDescription>Buy or sell property tokens with ease</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="buy" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="buy">Buy Tokens</TabsTrigger>
                  <TabsTrigger value="sell">Sell Tokens</TabsTrigger>
                </TabsList>

                <TabsContent value="buy" className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Select Property</label>
                      <Select value={selectedProperty} onValueChange={handlePropertyChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a property" />
                        </SelectTrigger>
                        <SelectContent>
                          {properties.map((property) => (
                            <SelectItem key={property.id} value={property.id.toString()}>
                              {property.name} - ${property.currentPrice}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-1 block">Amount (USD)</label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="number"
                          placeholder="0.00"
                          className="pl-10"
                          value={amount}
                          onChange={handleAmountChange}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-1 block">Quantity (Tokens)</label>
                      <Input type="number" placeholder="0.00" value={quantity} onChange={handleQuantityChange} />
                    </div>

                    {selectedProperty && (
                      <div className="rounded-md bg-blue-50 dark:bg-blue-950 p-3 flex items-center">
                        <Brain className="h-5 w-5 text-blue-500 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-blue-700 dark:text-blue-300">AI Suggestion</p>
                          <p className="text-xs text-blue-600 dark:text-blue-400">
                            Current market conditions suggest this is a good time to buy.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="sell" className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Select Property</label>
                      <Select value={selectedProperty} onValueChange={handlePropertyChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a property" />
                        </SelectTrigger>
                        <SelectContent>
                          {properties.map((property) => (
                            <SelectItem key={property.id} value={property.id.toString()}>
                              {property.name} - ${property.currentPrice}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-1 block">Quantity (Tokens)</label>
                      <Input type="number" placeholder="0.00" value={quantity} onChange={handleQuantityChange} />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-1 block">Amount (USD)</label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="number"
                          placeholder="0.00"
                          className="pl-10"
                          value={amount}
                          onChange={handleAmountChange}
                        />
                      </div>
                    </div>

                    {selectedProperty && (
                      <div className="rounded-md bg-amber-50 dark:bg-amber-950 p-3 flex items-center">
                        <Brain className="h-5 w-5 text-amber-500 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-amber-700 dark:text-amber-300">AI Suggestion</p>
                          <p className="text-xs text-amber-600 dark:text-amber-400">
                            Consider holding for 2 more weeks for a potential 5% price increase.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleTransaction}
                className="w-full"
                disabled={!selectedProperty || !amount || !quantity}
              >
                {activeTab === "buy" ? "Buy Tokens" : "Sell Tokens"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Market Value Trend</CardTitle>
              <CardDescription>Real-time token value for selected property</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px]">
              <ChartContainer>
                <Chart>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={priceHistoryData}>
                      <XAxis dataKey="time" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `$${value}`}
                        domain={["dataMin - 5", "dataMax + 5"]}
                      />
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <ChartTooltip>
                                <ChartTooltipContent>
                                  <p className="text-sm font-medium">{payload[0].payload.time}</p>
                                  <p className="text-sm">Price: ${payload[0].value}</p>
                                </ChartTooltipContent>
                              </ChartTooltip>
                            )
                          }
                          return null
                        }}
                      />
                      <Line type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </Chart>
              </ChartContainer>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="flex items-center">
                <ArrowDownUp className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">24h Change:</span>
                <span className="ml-1 text-sm font-medium text-green-600 dark:text-green-400 flex items-center">
                  +5.6%
                  <TrendingUp className="ml-1 h-3 w-3" />
                </span>
              </div>
              <div className="flex items-center">
                <span className="text-sm text-muted-foreground">Volume:</span>
                <span className="ml-1 text-sm font-medium">$45,230</span>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>
  )
}

