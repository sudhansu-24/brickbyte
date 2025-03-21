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
    image: "/skyline.avif", // Updated image path
    tokenValue: 125.5,
    monthlyIncome: 42.3,
    projectedROI: 12.3,
    stakedPercentage: 75,
  },
  {
    id: 2,
    name: "Oceanview Residences",
    image: "/oceanView.avif",
    tokenValue: 87.25,
    monthlyIncome: 28.5,
    projectedROI: 9.8,
    stakedPercentage: 50,
  },
  {
    id: 3,
    name: "Tech Hub Office Park",
    image: "/techHub.avif",
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
                      src={property.image}
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
          </TabsContent>
        </Tabs>
      </div>
    </section>
  )
}
