"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { usePortfolio } from "@/hooks/usePortfolio";
import { useProperties } from "@/hooks/useProperties";
import { useMarketInsights } from "@/hooks/useMarketInsights";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet, Building, TrendingUp, Home, DollarSign, Landmark, ArrowUpRight, ArrowDownRight, BarChart3 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { portfolio, isLoading: portfolioLoading } = usePortfolio();
  const { properties, isLoading: propertiesLoading } = useProperties();
  const { insights, isLoading: insightsLoading } = useMarketInsights();
  const router = useRouter();

  const isLoading = authLoading || portfolioLoading || propertiesLoading || insightsLoading;

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  // Get featured properties (newest 3)
  const featuredProperties = properties && properties.length > 0
    ? [...properties].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3)
    : [];

  if (isLoading) {
    return (
      <div className="container flex items-center justify-center min-h-[600px]">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null; // Redirect is handled in useEffect
  }

  return (
    <div className="container py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Welcome, {user.name}</h1>
        <p className="text-muted-foreground mt-1">Here's an overview of your real estate investments</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Portfolio Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${portfolio?.totalValue.toLocaleString() || "0"}</div>
            <div className="flex items-center mt-1 text-xs">
              <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-green-500">+2.5%</span>
              <span className="text-muted-foreground ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Monthly Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${portfolio?.rentalIncome.toLocaleString() || "0"}</div>
            <div className="flex items-center mt-1 text-xs">
              <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-green-500">+1.8%</span>
              <span className="text-muted-foreground ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Building className="h-4 w-4" />
              Properties Owned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{portfolio?.holdings.length || 0}</div>
            <div className="flex items-center mt-1 text-xs">
              <span className="text-muted-foreground">across {portfolio?.holdings.length || 0} locations</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Average ROI
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {portfolio?.holdings.length ? 
                (portfolio.holdings.reduce((acc, holding) => acc + holding.prediction.roi, 0) / portfolio.holdings.length).toFixed(2) : 
                "0"}%
            </div>
            <div className="flex items-center mt-1 text-xs">
              <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-green-500">+0.5%</span>
              <span className="text-muted-foreground ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Portfolio Overview</h2>
            <Button variant="outline" size="sm" onClick={() => router.push('/portfolio')}>
              View All
            </Button>
          </div>

          {portfolio?.holdings && portfolio.holdings.length > 0 ? (
            <div className="space-y-4">
              {portfolio.holdings.slice(0, 3).map((holding) => (
                <Card key={holding.property._id}>
                  <div className="flex">
                    <div className="w-24 h-24 relative">
                      {holding.property.images && holding.property.images[0] && (
                        <Image 
                          src={holding.property.images[0]} 
                          alt={holding.property.name}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{holding.property.name}</h3>
                          <p className="text-sm text-muted-foreground">{holding.property.location}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${holding.value.toLocaleString()}</p>
                          <p className="text-sm text-green-500">+{holding.prediction.roi.toFixed(2)}%</p>
                        </div>
                      </div>
                      <div className="flex justify-between mt-2 text-sm">
                        <span className="text-muted-foreground">Tokens: {holding.amount}</span>
                        <span className="text-muted-foreground">Monthly: ${holding.monthlyRental.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}

              {portfolio.holdings.length > 3 && (
                <Button variant="outline" className="w-full" onClick={() => router.push('/portfolio')}>
                  View All Properties
                </Button>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <Home className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">No Properties Yet</h3>
                <p className="text-muted-foreground text-center mb-4">You haven't invested in any properties yet.</p>
                <Button onClick={() => router.push("/properties")}>Browse Properties</Button>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Market Insights</h2>
            <Button variant="outline" size="sm" onClick={() => router.push('/properties')}>
              View Market
            </Button>
          </div>

          {insights ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Market Trends</CardTitle>
                <CardDescription>Latest real estate market analysis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {insights.marketTrends.slice(0, 2).map((trend, index) => (
                  <div key={index} className="flex justify-between items-center pb-2 border-b">
                    <div>
                      <p className="font-medium">{trend.propertyType}</p>
                      <div className="flex items-center mt-1">
                        {trend.priceGrowth > 0 ? (
                          <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                        ) : (
                          <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
                        )}
                        <span className={trend.priceGrowth > 0 ? 'text-green-500 text-xs' : 'text-red-500 text-xs'}>
                          {trend.priceGrowth > 0 ? '+' : ''}{trend.priceGrowth.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Demand</p>
                      <p className="font-medium">{trend.demand.toFixed(1)}/10</p>
                    </div>
                  </div>
                ))}

                <div className="pt-2">
                  <h4 className="font-medium mb-2">Top Recommendation</h4>
                  {insights.aiRecommendations[0] ? (
                    <div className="p-3 bg-muted rounded-md">
                      <div className="flex items-center gap-2 mb-1">
                        <BarChart3 className="h-4 w-4 text-primary" />
                        <p className="font-medium">{insights.aiRecommendations[0].action}</p>
                      </div>
                      <p className="text-sm text-muted-foreground">{insights.aiRecommendations[0].reason}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No recommendations available</p>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => router.push('/properties')}>
                  View Full Market Analysis
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Market Data Unavailable</h3>
                <p className="text-muted-foreground text-center text-sm">Market insights are currently being updated.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Featured Properties</h2>
          <Button variant="outline" size="sm" onClick={() => router.push('/properties')}>
            View All
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredProperties.length > 0 ? (
            featuredProperties.map((property) => (
              <Card key={property._id} className="overflow-hidden">
                <div className="aspect-video relative">
                  {property.images && property.images[0] && (
                    <Image 
                      src={property.images[0]} 
                      alt={property.name}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
                <CardHeader>
                  <CardTitle className="line-clamp-1">{property.name}</CardTitle>
                  <CardDescription>{property.location}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Token Price</p>
                      <p className="font-medium">${property.tokenPrice.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">ROI</p>
                      <p className="font-medium text-green-500">{property.projectedRoi.toFixed(2)}%</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" onClick={() => router.push(`/properties/${property._id}`)}>
                    View Property
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-3 flex flex-col items-center justify-center p-12 border rounded-lg bg-muted/50">
              <Landmark className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">No Properties Available</h3>
              <p className="text-muted-foreground text-center">There are currently no properties available for investment.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
