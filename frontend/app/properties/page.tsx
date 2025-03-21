"use client";

import { useState } from "react";
import { useProperties } from "@/hooks/useProperties";
import { useMarketInsights } from "@/hooks/useMarketInsights";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { Search, Filter, MapPin, Home, Building, TrendingUp, Banknote } from "lucide-react";
import Image from "next/image";

export default function PropertiesPage() {
  const router = useRouter();
  const { properties, isLoading } = useProperties();
  const { insights } = useMarketInsights();
  const [searchTerm, setSearchTerm] = useState("");
  const [propertyType, setPropertyType] = useState<string | undefined>();
  const [sortBy, setSortBy] = useState<string | undefined>();

  // Filter and sort properties
  const filteredProperties = properties && properties.length > 0
    ? properties
      .filter((property: any) => {
        // Filter by search term
        const matchesSearch = 
          property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          property.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
          property.description.toLowerCase().includes(searchTerm.toLowerCase());
        
        // Filter by property type
        const matchesType = !propertyType || property.propertyType === propertyType;
        
        return matchesSearch && matchesType;
      })
      .sort((a: any, b: any) => {
        if (!sortBy) return 0;
        
        switch (sortBy) {
          case "price-low":
            return a.tokenPrice - b.tokenPrice;
          case "price-high":
            return b.tokenPrice - a.tokenPrice;
          case "roi":
            return b.projectedRoi - a.projectedRoi;
          case "newest":
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          default:
            return 0;
        }
      })
    : [];

  if (isLoading) {
    return (
      <div className="container flex items-center justify-center min-h-[600px]">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Loading properties...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Available Properties</h1>
          <p className="text-muted-foreground mt-1">Browse and invest in tokenized real estate</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, location, or description"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-4">
          <Select value={propertyType} onValueChange={setPropertyType}>
            <SelectTrigger className="w-[180px]">
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                <SelectValue placeholder="Property Type" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Types</SelectItem>
              <SelectItem value="residential">Residential</SelectItem>
              <SelectItem value="commercial">Commercial</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <SelectValue placeholder="Sort By" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Default</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="roi">Highest ROI</SelectItem>
              <SelectItem value="newest">Newest First</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredProperties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <Card key={property._id} className="overflow-hidden flex flex-col">
              <div className="aspect-video relative overflow-hidden">
                {property.images && property.images[0] && (
                  <Image 
                    src={property.images[0]} 
                    alt={property.name}
                    fill
                    className="object-cover transition-transform hover:scale-105"
                  />
                )}
                <Badge className="absolute top-2 right-2">
                  {property.propertyType === "residential" ? "Residential" : "Commercial"}
                </Badge>
              </div>
              
              <CardHeader>
                <CardTitle className="line-clamp-1">{property.name}</CardTitle>
                <CardDescription className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {property.location}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="flex-1">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Token Price</p>
                    <p className="font-medium">${property.tokenPrice.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Available</p>
                    <p className="font-medium">{property.tokensAvailable.toLocaleString()} tokens</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Rental Yield</p>
                    <p className="font-medium text-green-500">{property.rentalIncome.toFixed(2)}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Projected ROI</p>
                    <p className="font-medium text-green-500">{property.projectedRoi.toFixed(2)}%</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{property.description}</p>
              </CardContent>
              
              <CardFooter>
                <Button className="w-full" onClick={() => router.push(`/properties/${property._id}`)}>
                  View Details
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 border rounded-lg bg-muted/50">
          <Home className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium mb-2">No Properties Found</h3>
          <p className="text-muted-foreground text-center mb-4">Try adjusting your filters or search terms.</p>
          <Button onClick={() => { setSearchTerm(""); setPropertyType(undefined); setSortBy(undefined); }}>
            Reset Filters
          </Button>
        </div>
      )}

      {insights && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Market Insights</h2>
          
          <Tabs defaultValue="trends">
            <TabsList className="mb-6">
              <TabsTrigger value="trends">Market Trends</TabsTrigger>
              <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
            </TabsList>
            
            <TabsContent value="trends">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {insights.marketTrends.map((trend, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="text-lg">{trend.propertyType}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Demand:</span>
                          <span className="font-medium">{trend.demand.toFixed(1)}/10</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Price Growth:</span>
                          <span className="font-medium text-green-500">+{trend.priceGrowth.toFixed(2)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Confidence:</span>
                          <span className="font-medium">{trend.confidence.toFixed(1)}%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="recommendations">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {insights.aiRecommendations.map((recommendation, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {recommendation.action === "Buy" ? (
                          <TrendingUp className="h-5 w-5 text-green-500" />
                        ) : recommendation.action === "Sell" ? (
                          <TrendingUp className="h-5 w-5 text-red-500 rotate-180" />
                        ) : (
                          <Banknote className="h-5 w-5 text-yellow-500" />
                        )}
                        {recommendation.action}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>{recommendation.reason}</p>
                      <div className="mt-2 flex items-center">
                        <span className="text-xs text-muted-foreground">Confidence: </span>
                        <span className="text-xs ml-1">{recommendation.confidence.toFixed(1)}%</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
