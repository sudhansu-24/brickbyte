"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, DollarSign, Landmark, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Mock data for portfolio
const portfolioProperties = [
  {
    id: 1,
    name: "Skyline Towers",
    image: "/placeholder.svg?height=200&width=300",
    tokenValue: 125.5,
    monthlyIncome: 42.3,
    projectedROI: 12.3,
    stakedPercentage: 75,
  },
  {
    id: 2,
    name: "Oceanview Residences",
    image: "/placeholder.svg?height=200&width=300",
    tokenValue: 87.25,
    monthlyIncome: 28.5,
    projectedROI: 9.8,
    stakedPercentage: 50,
  },
  {
    id: 3,
    name: "Tech Hub Office Park",
    image: "/placeholder.svg?height=200&width=300",
    tokenValue: 210.75,
    monthlyIncome: 65.2,
    projectedROI: 15.2,
    stakedPercentage: 30,
  },
]

export default function Portfolio() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("properties")

  const handleSellTokens = (propertyId: number) => {
    toast({
      title: "Sell Order Initiated",
      description: "Your sell order has been placed successfully.",
    })
  }

  const handleStakeTokens = (propertyId: number) => {
    toast({
      title: "Tokens Staked",
      description: "Your tokens have been staked successfully.",
    })
  }

  return (
    <section id="portfolio" className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Your Portfolio</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Manage your property investments and track your returns in real-time.
          </p>
        </div>

        <Tabs defaultValue="properties" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList>
              <TabsTrigger value="properties">Properties</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="properties">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {portfolioProperties.map((property) => (
                <Card key={property.id} className="overflow-hidden">
                  <div className="h-40 overflow-hidden">
                    <img
                      src={property.image || "/placeholder.svg"}
                      alt={property.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle>{property.name}</CardTitle>
                    <CardDescription>Property ID: #{property.id}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Token Value</p>
                          <p className="font-semibold flex items-center">
                            <DollarSign className="h-4 w-4 mr-1" />
                            {property.tokenValue}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Monthly Income</p>
                          <p className="font-semibold flex items-center">
                            <DollarSign className="h-4 w-4 mr-1" />
                            {property.monthlyIncome}
                          </p>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm text-muted-foreground">AI Predicted ROI</p>
                          <p className="font-semibold text-green-600 dark:text-green-400 flex items-center">
                            {property.projectedROI}%
                            <TrendingUp className="h-4 w-4 ml-1" />
                          </p>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm text-muted-foreground">Tokens Staked</p>
                          <p className="text-sm">{property.stakedPercentage}%</p>
                        </div>
                        <Progress value={property.stakedPercentage} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => handleSellTokens(property.id)}>
                      Sell Now
                    </Button>
                    <Button className="flex-1" onClick={() => handleStakeTokens(property.id)}>
                      Stake
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {portfolioProperties.length === 0 && (
              <div className="text-center py-12">
                <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Properties Yet</h3>
                <p className="text-muted-foreground mb-6">
                  You haven't invested in any properties yet. Start exploring our marketplace to begin your investment
                  journey.
                </p>
                <Button>Explore Properties</Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="performance">
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Performance</CardTitle>
                <CardDescription>Track your overall investment performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Value</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">$423.50</div>
                        <p className="text-xs text-muted-foreground">+12.5% from initial investment</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Income</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">$136.00</div>
                        <p className="text-xs text-muted-foreground">Passive rental income</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Staking Rewards</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">$28.75</div>
                        <p className="text-xs text-muted-foreground">From staked property tokens</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Your recent property investment activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-md border">
                    <div className="p-4 flex items-center justify-between">
                      <div className="flex items-center">
                        <Landmark className="h-8 w-8 mr-4 text-blue-500" />
                        <div>
                          <p className="font-medium">Purchased Tokens</p>
                          <p className="text-sm text-muted-foreground">Skyline Towers - 5 tokens</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">$627.50</p>
                        <p className="text-sm text-muted-foreground">Mar 15, 2025</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-md border">
                    <div className="p-4 flex items-center justify-between">
                      <div className="flex items-center">
                        <Landmark className="h-8 w-8 mr-4 text-green-500" />
                        <div>
                          <p className="font-medium">Staked Tokens</p>
                          <p className="text-sm text-muted-foreground">Tech Hub Office Park - 2 tokens</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">$421.50</p>
                        <p className="text-sm text-muted-foreground">Mar 10, 2025</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-md border">
                    <div className="p-4 flex items-center justify-between">
                      <div className="flex items-center">
                        <Landmark className="h-8 w-8 mr-4 text-amber-500" />
                        <div>
                          <p className="font-medium">Received Rental Income</p>
                          <p className="text-sm text-muted-foreground">Oceanview Residences</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">$28.50</p>
                        <p className="text-sm text-muted-foreground">Mar 1, 2025</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  )
}

