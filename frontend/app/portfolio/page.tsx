"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
// Import demo hooks for the presentation
import { useDemoPortfolio, useDemoPortfolioHistory } from "@/hooks/useDemoPortfolio";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, TrendingUp, Home, Building } from "lucide-react";
import Image from "next/image";

export default function PortfolioPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  // Using demo hooks for presentation
  const { portfolio, isLoading: portfolioLoading, mutate, rebalance } = useDemoPortfolio();
  const { history, isLoading: historyLoading } = useDemoPortfolioHistory();
  const router = useRouter();
  const { toast } = useToast();

  const isLoading = authLoading || portfolioLoading || historyLoading;

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  const handleRebalance = async () => {
    try {
      await rebalance();
      toast({
        title: "Portfolio Rebalanced",
        description: "Your portfolio has been optimized based on AI recommendations.",
      });
    } catch (error: any) {
      toast({
        title: "Rebalance Failed",
        description: error.message || "Could not rebalance portfolio at this time.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container flex items-center justify-center min-h-[600px]">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Loading portfolio data...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Redirect is handled in useEffect
  }

  return (
    <div className="container py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Your Portfolio</h1>
          <p className="text-muted-foreground mt-1">Manage and track your real estate investments</p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => mutate()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={handleRebalance}>
            <TrendingUp className="mr-2 h-4 w-4" />
            Optimize Portfolio
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Portfolio Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${portfolio?.totalValue.toLocaleString() || "0"}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Rental Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${portfolio?.rentalIncome.toLocaleString() || "0"}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Properties Owned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{portfolio?.holdings.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="holdings">
        <TabsList className="mb-6">
          <TabsTrigger value="holdings">Current Holdings</TabsTrigger>
          <TabsTrigger value="suggestions">AI Recommendations</TabsTrigger>
          <TabsTrigger value="performance">Historical Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="holdings">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolio?.holdings && portfolio.holdings.length > 0 ? (
              portfolio.holdings.map((holding: any) => (
                <Card key={holding.property._id}>
                  <div className="aspect-video relative overflow-hidden rounded-t-lg">
                    {holding.property.images && holding.property.images[0] && (
                      <Image 
                        src={holding.property.images[0]} 
                        alt={holding.property.name}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  <CardHeader>
                    <CardTitle>{holding.property.name}</CardTitle>
                    <CardDescription>{holding.property.location}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tokens Owned:</span>
                        <span className="font-medium">{holding.amount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Current Value:</span>
                        <span className="font-medium">${holding.value.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Monthly Rental:</span>
                        <span className="font-medium">${holding.monthlyRental.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Predicted ROI:</span>
                        <span className="font-medium text-green-500">+{holding.prediction.roi.toFixed(2)}%</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" onClick={() => router.push(`/properties/${holding.property._id}`)}>
                      <Building className="mr-2 h-4 w-4" />
                      View Property
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center p-12 border rounded-lg bg-muted/50">
                <Home className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">No Properties Yet</h3>
                <p className="text-muted-foreground text-center mb-4">You haven't invested in any properties yet. Start by browsing available properties.</p>
                <Button onClick={() => router.push("/properties")}>Browse Properties</Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="suggestions">
          {portfolio?.suggestion && portfolio.suggestion.length > 0 ? (
            <div className="space-y-4">
              {portfolio.suggestion.map((suggestion: any, index: number) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span className={suggestion.action === 'BUY' ? 'text-green-500' : suggestion.action === 'SELL' ? 'text-red-500' : 'text-yellow-500'}>
                        {suggestion.action}
                      </span>
                      <span>{suggestion.property}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4">{suggestion.reason}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Recommended amount:</span>
                      <span className="font-medium">{suggestion.amount} tokens</span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      variant={suggestion.action === 'BUY' ? 'default' : suggestion.action === 'SELL' ? 'destructive' : 'outline'}
                      className="w-full"
                      onClick={() => router.push(`/properties/${suggestion.property}`)}
                    >
                      {suggestion.action === 'BUY' ? 'Purchase Tokens' : suggestion.action === 'SELL' ? 'Sell Tokens' : 'View Property'}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 border rounded-lg bg-muted/50">
              <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">No Recommendations</h3>
              <p className="text-muted-foreground text-center">There are no portfolio adjustment recommendations at this time.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="performance">
          {history && history.length > 0 ? (
            <div className="space-y-6">
              {history.map((item: any, index: number) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle>{item.property}</CardTitle>
                    <CardDescription>
                      ROI: <span className={item.roi >= 0 ? 'text-green-500' : 'text-red-500'}>{item.roi.toFixed(2)}%</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Purchase Price:</span>
                        <span className="font-medium">${item.purchasePrice.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Current Price:</span>
                        <span className="font-medium">${item.currentPrice.toLocaleString()}</span>
                      </div>
                      <div className="h-24 bg-muted rounded-md">
                        {/* Here you would render a chart using a library like Chart.js or Recharts */}
                        <div className="p-4 text-center text-muted-foreground">
                          Price history chart would be displayed here
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 border rounded-lg bg-muted/50">
              <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">No Performance Data</h3>
              <p className="text-muted-foreground text-center">Historical performance data is not yet available for your portfolio.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
