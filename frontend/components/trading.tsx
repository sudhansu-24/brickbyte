"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowDownUp, DollarSign, TrendingUp, ArrowRight, Brain } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ethers } from "ethers"
import RealEstateToken from "@/contracts/RealEstateToken.json"
import Cookies from "js-cookie"
import { Chart, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts"
import { Toaster } from "@/components/ui/toaster"

// Mock data for price history
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

interface Property {
  id: string;
  name: string;
  location: string;
  description: string;
  image_url: string;
  price_per_share: number;
  total_shares: number;
  available_shares: number;
  rental_yield: number;
  type: 'Commercial' | 'Residential';
  owner_id: string;
  contract_address: string;
  blockchain_property_id: string;
}

interface UserShare {
  id: string;
  user_id: string;
  property_id: string;
  shares: number;
  properties: Property;
}

declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function Trading() {
  const { toast } = useToast()
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [quantity, setQuantity] = useState("")
  const [activeTab, setActiveTab] = useState("buy")
  const [properties, setProperties] = useState<Property[]>([])
  const [userShares, setUserShares] = useState<UserShare[]>([])
  const [loading, setLoading] = useState(true)
  const [isTransactionPending, setIsTransactionPending] = useState(false)

  useEffect(() => {
    fetchProperties()
    fetchUserShares()
  }, [])

  const fetchProperties = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/properties`, {
        headers: {
          'Authorization': `Bearer ${Cookies.get('token')}`
        }
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      setProperties(data)
    } catch (err: any) {
      console.error('Error fetching properties:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserShares = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/shares`, {
        headers: {
          'Authorization': `Bearer ${Cookies.get('token')}`
        }
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      setUserShares(data)
    } catch (err: any) {
      console.error('Error fetching user shares:', err)
    }
  }

  const handlePropertyChange = (value: string) => {
    setSelectedProperty(properties.find((p) => p.id === value) || null)
    const property = properties.find((p) => p.id === value)
    if (property) {
      // Show AI suggestion
      const suggestion = activeTab === "buy" 
        ? `Suggested buy price: ${(property.price_per_share * 0.98).toFixed(4)} ETH (2% below market)`
        : "Consider holding for 2 more weeks for a potential 5% price increase."
      
      toast({
        title: "AI Suggestion",
        description: suggestion,
      })
    }
  }

  const handleTransaction = async () => {
    if (!selectedProperty || !quantity) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    try {
      setIsTransactionPending(true)
      
      if (!window.ethereum) {
        toast({
          title: "Error",
          description: "Please install MetaMask!",
          variant: "destructive",
        })
        return
      }

      const amount = parseInt(quantity)
      if (isNaN(amount) || amount <= 0) {
        toast({
          title: "Error",
          description: "Please enter a valid number of shares",
          variant: "destructive",
        })
        return
      }

      if (activeTab === "buy" && amount > selectedProperty.available_shares) {
        toast({
          title: "Error",
          description: "Not enough shares available",
          variant: "destructive",
        })
        return
      }

      const userShare = userShares.find(share => share.properties.id === selectedProperty.id)
      if (activeTab === "sell" && (!userShare || amount > userShare.shares)) {
        toast({
          title: "Error",
          description: "Not enough shares to sell",
          variant: "destructive",
        })
        return
      }

      // Show transaction pending toast
      toast({
        title: "Transaction Pending",
        description: `Please confirm the ${activeTab === "buy" ? 'purchase' : 'sale'} in your MetaMask wallet.`,
      })

      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!,
        RealEstateToken.abi,
        signer
      )

      if (activeTab === "buy") {
        const totalCost = ethers.parseEther((selectedProperty.price_per_share * amount).toString())
        const propertyId = ethers.getBigInt(selectedProperty.blockchain_property_id)
        
        console.log('Buying shares:', {
          propertyId: propertyId.toString(),
          amount,
          totalCost: totalCost.toString()
        })

        const tx = await contract.purchaseShares(propertyId, amount, { value: totalCost })
        
        // Show transaction submitted toast
        toast({
          title: "Transaction Submitted",
          description: `Transaction hash: ${tx.hash}`,
        })

        await tx.wait()

        // Show transaction confirmed toast
        toast({
          title: "Transaction Confirmed",
          description: `Successfully purchased ${amount} shares!`,
        })

        // Record transaction in backend
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/properties/${selectedProperty.id}/buy`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Cookies.get('token')}`
          },
          body: JSON.stringify({ shares: amount })
        })

        if (!response.ok) {
          throw new Error('Failed to record transaction')
        }

        toast({
          title: "Success",
          description: `Your purchase has been completed successfully!`,
        })
      } else {
        const propertyId = ethers.getBigInt(selectedProperty.blockchain_property_id)
        
        console.log('Selling shares:', {
          propertyId: propertyId.toString(),
          amount
        })

        const tx = await contract.sellShares(propertyId, amount)
        
        // Show transaction submitted toast
        toast({
          title: "Transaction Submitted",
          description: `Transaction hash: ${tx.hash}`,
        })

        await tx.wait()

        // Show transaction confirmed toast
        toast({
          title: "Transaction Confirmed",
          description: `Successfully sold ${amount} shares!`,
        })

        // Record transaction in backend
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/properties/${selectedProperty.id}/sell`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Cookies.get('token')}`
          },
          body: JSON.stringify({ shares: amount })
        })

        if (!response.ok) {
          throw new Error('Failed to record transaction')
        }

        toast({
          title: "Success",
          description: `Your sale has been completed successfully!`,
        })
      }

      // Refresh data
      fetchProperties()
      fetchUserShares()
      setSelectedProperty(null)
      setQuantity("")
    } catch (error: any) {
      console.error('Transaction error:', error)
      toast({
        title: "Error",
        description: error.message || 'Transaction failed. Please try again.',
        variant: "destructive",
      })
    } finally {
      setIsTransactionPending(false)
    }
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
                      <Select value={selectedProperty?.id} onValueChange={handlePropertyChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a property" />
                        </SelectTrigger>
                        <SelectContent>
                          {properties.map((property) => (
                            <SelectItem key={property.id} value={property.id}>
                              {property.name} - {property.price_per_share} ETH
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-1 block">Quantity (Tokens)</label>
                      <Input 
                        type="number" 
                        placeholder="0" 
                        value={quantity} 
                        onChange={(e) => setQuantity(e.target.value)}
                        min="1"
                        max={selectedProperty ? selectedProperty.available_shares : undefined}
                      />
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
                      <Select value={selectedProperty?.id} onValueChange={handlePropertyChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a property" />
                        </SelectTrigger>
                        <SelectContent>
                          {userShares.map((share) => (
                            <SelectItem key={share.properties.id} value={share.properties.id}>
                              {share.properties.name} - {share.shares} tokens
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-1 block">Quantity (Tokens)</label>
                        <Input
                          type="number"
                        placeholder="0" 
                        value={quantity} 
                        onChange={(e) => setQuantity(e.target.value)}
                        min="1"
                        max={selectedProperty ? userShares.find(s => s.properties.id === selectedProperty.id)?.shares : undefined}
                      />
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
                disabled={!selectedProperty || !quantity || isTransactionPending}
              >
                {isTransactionPending ? "Processing..." : activeTab === "buy" ? "Buy Tokens" : "Sell Tokens"}
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
      <Toaster />
    </section>
  )
}

