"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, TrendingDown, DollarSign, Landmark, AlertCircle, BarChart3, History } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"

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
  rental_income?: number;
  size?: number;
  square_feet?: number;
  type: 'Commercial' | 'Residential';
  owner_id: string;
  contract_address: string;
  blockchain_property_id: string;
}

interface UserShare {
  id: string;
  property_id: string;
  user_id: string;
  shares: number;
  properties: Property;
}

interface Transaction {
  id: string;
  property_id: string;
  user_id: string;
  type: 'BUY' | 'SELL';
  shares: number;
  price_per_share: number;
  created_at: string;
  properties: Property;
}

interface Valuation {
  predicted_value: number;
  confidence_score: number;
  predicted_roi: number;
  market_trend: 'rising' | 'stable' | 'cooling';
  analysis: {
    location_score: number;
    market_demand: number;
    growth_potential: number;
  };
}

export default function Portfolio() {
  const { toast } = useToast()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("properties")
  const [userShares, setUserShares] = useState<UserShare[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [propertyValuations, setPropertyValuations] = useState<Record<string, Valuation>>({})

  const determineLocationGrade = (pricePerShare: number) => {
    if (!pricePerShare) return 'good';
    const price = parseFloat(pricePerShare.toString());
    if (price >= 1.0) return 'prime';
    if (price >= 0.5) return 'good';
    if (price >= 0.2) return 'average';
    return 'developing';
  };

  const fetchPropertyValuation = async (property: Property) => {
    try {
      const propertyData = {
        sqft: parseInt(property.size?.toString() || property.square_feet?.toString() || '1500'),
        property_type: (property.type || 'residential').toLowerCase(),
        location_grade: determineLocationGrade(property.price_per_share),
        address: property.location || ''
      };
      
      console.log('Sending valuation request for property:', property.id, propertyData);
      
      const response = await fetch('http://localhost:8000/api/valuation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(propertyData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch valuation');
      }
      
      const valuation = await response.json();
      console.log('Received valuation for property:', property.id, valuation);
      return valuation;
    } catch (error) {
      console.error('Error fetching valuation for property:', property.id, error);
      return null;
    }
  };

  useEffect(() => {
    fetchUserShares()
    fetchTransactions()
  }, [])

  const fetchUserShares = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/shares`, {
        headers: {
          'Authorization': `Bearer ${Cookies.get('token')}`
        }
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      
      console.log('Raw user shares response:', data);
      if (data && data.length > 0) {
        console.log('First share data:', {
          shares: data[0].shares,
          propertyDetails: data[0].properties,
          imageUrl: data[0].properties?.image_url,
          fullProperties: JSON.stringify(data[0].properties, null, 2)
        });
      }
      
      setUserShares(data)
      
      // Fetch valuations for all properties
      const valuations: Record<string, Valuation> = {}
      for (const share of data) {
        if (share.properties) {
          const valuation = await fetchPropertyValuation(share.properties)
          if (valuation) {
            valuations[share.properties.id] = valuation
          }
        }
      }
      setPropertyValuations(valuations)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchTransactions = async () => {
    try {
      console.log('Fetching transactions...');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/transactions`, {
        headers: {
          'Authorization': `Bearer ${Cookies.get('token')}`
        }
      })
      console.log('Response status:', response.status);
      const data = await response.json()
      console.log('Response data:', data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch transactions');
      }
      
      setTransactions(data)
    } catch (err: any) {
      console.error('Error fetching transactions:', err)
    }
  }

  const handleSellTokens = (propertyId: string) => {
    router.push(`/properties/${propertyId}`)
  }

  const handleStakeTokens = (propertyId: string) => {
    toast({
      title: "Coming Soon",
      description: "Token staking functionality will be available soon.",
    })
  }

  const calculateTotalValue = () => {
    return userShares.reduce((total, share) => 
      total + (share.shares * share.properties.price_per_share), 0
    )
  }

  const calculateMonthlyIncome = () => {
    return userShares.reduce((total, share) => {
      if (share.properties.rental_income && share.properties.total_shares) {
        return total + (share.shares * share.properties.rental_income / share.properties.total_shares);
      } else {
        return total + (share.shares * share.properties.rental_yield / 100 * share.properties.price_per_share / 12);
      }
    }, 0);
  }

  if (loading) {
    return (
      <section id="portfolio" className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-lg text-gray-600">Loading portfolio...</p>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section id="portfolio" className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
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
              {userShares.map((share) => (
                <Card key={share.id} className="overflow-hidden">
                  <div className="h-40 overflow-hidden">
                    <img
                      src={share.properties.image_url || "https://placehold.co/400x300"}
                      alt={share.properties.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error('Image failed to load:', e.currentTarget.src);
                        e.currentTarget.src = "https://placehold.co/400x300";
                        e.currentTarget.onerror = null; // Prevent infinite loop if placeholder also fails
                      }}
                    />
                  </div>
                  <CardHeader>
                    <CardTitle>{share.properties.name}</CardTitle>
                    <CardDescription>Property ID: #{share.properties.id}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Token Value</p>
                          <p className="font-semibold flex items-center">
                            <DollarSign className="h-4 w-4 mr-1" />
                            {(share.shares * share.properties.price_per_share).toFixed(2)} ETH
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Monthly Income</p>
                          <p className="font-semibold flex items-center">
                            <DollarSign className="h-4 w-4 mr-1" />
                            {share.properties.rental_income && share.properties.total_shares ? 
                              (share.shares * share.properties.rental_income / share.properties.total_shares).toFixed(2) :
                              (share.shares * share.properties.rental_yield / 100 * share.properties.price_per_share / 12).toFixed(2)
                            } ETH
                          </p>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm text-muted-foreground">AI Projected ROI</p>
                          <p className="font-semibold text-green-600 dark:text-green-400 flex items-center">
                            {propertyValuations[share.properties.id] ? 
                              `+${propertyValuations[share.properties.id].predicted_roi}%` : 
                              `+${share.properties.rental_yield}%`
                            }
                            <TrendingUp className="h-4 w-4 ml-1" />
                          </p>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm text-muted-foreground">Tokens Staked</p>
                          <p className="text-sm">0%</p>
                        </div>
                        <Progress value={0} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => handleSellTokens(share.properties.id)}>
                      Sell Now
                    </Button>
                    <Button className="flex-1" onClick={() => handleStakeTokens(share.properties.id)}>
                      Stake
                    </Button>
                  </CardFooter>
                </Card>
              ))}

              {userShares.length === 0 && (
                <div className="text-center py-12 col-span-full">
                  <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Properties Yet</h3>
                  <p className="text-muted-foreground mb-6">
                    You haven't invested in any properties yet. Start exploring our marketplace to begin your investment
                    journey.
                  </p>
                  <Button onClick={() => router.push('/properties')}>Explore Properties</Button>
                </div>
              )}
            </div>
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
                        <div className="text-2xl font-bold">{calculateTotalValue().toFixed(2)} ETH</div>
                        <p className="text-xs text-muted-foreground">+0% from initial investment</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Income</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{calculateMonthlyIncome().toFixed(2)} ETH</div>
                        <p className="text-xs text-muted-foreground">Passive rental income</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Staking Rewards</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">0.00 ETH</div>
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
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="rounded-md border">
                      <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center">
                          <Landmark className={`h-8 w-8 mr-4 ${
                            transaction.type === 'BUY' ? 'text-blue-500' : 'text-red-500'
                          }`} />
                          <div>
                            <p className="font-medium">{transaction.type === 'BUY' ? 'Purchased' : 'Sold'} Tokens</p>
                            <p className="text-sm text-muted-foreground">
                              {transaction.properties.name} - {transaction.shares} tokens
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{(transaction.shares * transaction.price_per_share).toFixed(2)} ETH</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(transaction.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {transactions.length === 0 && (
                    <div className="text-center py-8">
                      <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-xl font-semibold mb-2">No Transactions Yet</h3>
                      <p className="text-muted-foreground">
                        You haven't made any transactions yet. Start investing to see your transaction history.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  )
}

