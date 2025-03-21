"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { usePropertyById, useBuyTokens } from "@/hooks/useProperties";
import { propertyService } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Home, Building, TrendingUp, Banknote, Calendar, Users, Landmark, FileText, Wallet } from "lucide-react";
import Image from "next/image";

interface PropertyDetailsPageProps {
  params: {
    id: string;
  };
}

export default function PropertyDetailsPage({ params }: PropertyDetailsPageProps) {
  const { id } = params;
  const router = useRouter();
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const { property, isLoading: propertyLoading, error } = usePropertyById(id);
  const { buyTokens } = useBuyTokens();
  const [isBuying, setIsBuying] = useState(false);
  const { toast } = useToast();
  
  const [tokenAmount, setTokenAmount] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const isLoading = authLoading || propertyLoading;

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Property not found or could not be loaded.",
        variant: "destructive",
      });
      router.push("/properties");
    }
  }, [error, router, toast]);

  const handleBuyTokens = async () => {
    console.log('Buy tokens clicked');
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to purchase property tokens.",
        variant: "destructive",
      });
      router.push("/login");
      return;
    }

    if (!property) return;

    setIsBuying(true);
    try {
      console.log('Property:', property);
      // First check if user has a wallet connected
      if (!user?.walletAddress) {
        // For demo purposes, we'll show a connect wallet dialog
        toast({
          title: "Demo Mode",
          description: "Connecting demo wallet for the presentation...",
        });
        
        // Import the demo helper
        const { connectDemoWallet } = await import('@/lib/demo-helper');
        
        // Connect a demo wallet
        const walletAddress = await connectDemoWallet();
        
        // Continue with the purchase flow
      } else {
        console.log('Using existing wallet:', user.walletAddress);
      }

      console.log('Fetching contract data for property ID:', property._id);
      // Get contract details from backend
      const contractData = await propertyService.getPropertyContract(property._id);
      console.log('Contract data received:', contractData);
      
      // For demo purposes, we'll use our demo helper
      const { purchaseDemoTokens } = await import('@/lib/demo-helper');
      
      // Show a loading toast
      toast({
        title: "Processing Transaction",
        description: `Purchasing ${tokenAmount} tokens for $${(tokenAmount * property.tokenPrice).toFixed(2)}...`,
      });
      
      // Simulate the blockchain transaction
      await purchaseDemoTokens(property.name, tokenAmount, property.tokenPrice);
      
      // Also update in the backend
      await buyTokens(property._id, tokenAmount);
      
      // Redirect to portfolio page after a short delay
      setTimeout(() => {
        router.push("/portfolio");
      }, 1500);
    } catch (error: any) {
      console.error('Token purchase error:', error);
      toast({
        title: "Purchase Failed",
        description: error.message || "Could not complete the purchase. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsBuying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container flex items-center justify-center min-h-[600px]">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (!property) return null;

  const totalPrice = tokenAmount * property.tokenPrice;

  return (
    <div className="container py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Property Images and Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Image */}
          <div className="aspect-video relative rounded-lg overflow-hidden border">
            {property.images && property.images.length > 0 && (
              <Image 
                src={property.images[selectedImageIndex]} 
                alt={property.name}
                fill
                className="object-cover"
              />
            )}
            <Badge className="absolute top-2 right-2">
              {property.propertyType === "residential" ? "Residential" : "Commercial"}
            </Badge>
          </div>

          {/* Thumbnail Images */}
          {property.images && property.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {property.images.map((image, index) => (
                <div 
                  key={index} 
                  className={`relative w-24 h-24 rounded-md overflow-hidden cursor-pointer border-2 ${selectedImageIndex === index ? 'border-primary' : 'border-transparent'}`}
                  onClick={() => setSelectedImageIndex(index)}
                >
                  <Image 
                    src={image} 
                    alt={`${property.name} - image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Property Info */}
          <div>
            <h1 className="text-3xl font-bold">{property.name}</h1>
            <div className="flex items-center text-muted-foreground mt-1 mb-4">
              <MapPin className="h-4 w-4 mr-1" />
              {property.location}
            </div>

            <Tabs defaultValue="overview">
              <TabsList className="mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="details">Property Details</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview">
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <Banknote className="h-4 w-4 text-primary" />
                          Token Price
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">${property.tokenPrice.toLocaleString()}</div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <Users className="h-4 w-4 text-primary" />
                          Available
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{property.tokensAvailable.toLocaleString()}</div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <Landmark className="h-4 w-4 text-primary" />
                          Rental Yield
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-500">{property.rentalIncome.toFixed(2)}%</div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-primary" />
                          Projected ROI
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-500">{property.projectedRoi.toFixed(2)}%</div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold mb-2">Description</h3>
                    <p className="text-muted-foreground">{property.description}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold mb-2">Investment Highlights</h3>
                    <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                      <li>Prime location in {property.location}</li>
                      <li>Stable rental income with {property.rentalIncome.toFixed(2)}% yield</li>
                      <li>Professional property management</li>
                      <li>Projected annual appreciation of {(property.projectedRoi - property.rentalIncome).toFixed(2)}%</li>
                      <li>Fully tokenized ownership with blockchain security</li>
                    </ul>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="details">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-xl font-bold mb-4">Property Specifications</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-muted-foreground">Property Type:</span>
                          <span className="font-medium">{property.propertyType === "residential" ? "Residential" : "Commercial"}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-muted-foreground">Year Built:</span>
                          <span className="font-medium">{property.yearBuilt || "2020"}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-muted-foreground">Square Footage:</span>
                          <span className="font-medium">{property.squareFootage || "2,500"} sq ft</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-muted-foreground">Lot Size:</span>
                          <span className="font-medium">{property.lotSize || "0.25"} acres</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-muted-foreground">Bedrooms:</span>
                          <span className="font-medium">{property.bedrooms || "N/A"}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-muted-foreground">Bathrooms:</span>
                          <span className="font-medium">{property.bathrooms || "N/A"}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-bold mb-4">Financial Details</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-muted-foreground">Total Property Value:</span>
                          <span className="font-medium">${(property.tokenPrice * property.totalTokens).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-muted-foreground">Token Price:</span>
                          <span className="font-medium">${property.tokenPrice.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-muted-foreground">Total Tokens:</span>
                          <span className="font-medium">{property.totalTokens.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-muted-foreground">Available Tokens:</span>
                          <span className="font-medium">{property.tokensAvailable.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-muted-foreground">Monthly Rental Income:</span>
                          <span className="font-medium">${((property.tokenPrice * property.totalTokens) * (property.rentalIncome / 100) / 12).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-muted-foreground">Annual Rental Yield:</span>
                          <span className="font-medium text-green-500">{property.rentalIncome.toFixed(2)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="documents">
                <div className="space-y-6">
                  <p className="text-muted-foreground mb-4">The following documents are available for this property:</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        <span>Property Deed</span>
                      </div>
                      <Button variant="ghost" size="sm">View</Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        <span>Inspection Report</span>
                      </div>
                      <Button variant="ghost" size="sm">View</Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        <span>Financial Projections</span>
                      </div>
                      <Button variant="ghost" size="sm">View</Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        <span>Token Smart Contract</span>
                      </div>
                      <Button variant="ghost" size="sm">View</Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Right Column - Purchase Card */}
        <div>
          <div className="sticky top-24">
            <Card>
              <CardHeader>
                <CardTitle>Purchase Tokens</CardTitle>
                <CardDescription>
                  Invest in {property.name} by purchasing tokens
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Token Amount</label>
                  <div className="flex items-center">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => setTokenAmount(Math.max(1, tokenAmount - 1))}
                      disabled={tokenAmount <= 1}
                    >
                      -
                    </Button>
                    <Input 
                      type="number" 
                      min="1" 
                      max={property.tokensAvailable}
                      value={tokenAmount} 
                      onChange={(e) => setTokenAmount(parseInt(e.target.value) || 1)}
                      className="text-center mx-2" 
                    />
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => setTokenAmount(Math.min(property.tokensAvailable, tokenAmount + 1))}
                      disabled={tokenAmount >= property.tokensAvailable}
                    >
                      +
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Price per token:</span>
                    <span className="font-medium">${property.tokenPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Number of tokens:</span>
                    <span className="font-medium">{tokenAmount}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Transaction fee:</span>
                    <span className="font-medium">$0</span>
                  </div>
                  <div className="flex justify-between py-2 border-b font-bold">
                    <span>Total price:</span>
                    <span>${totalPrice.toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">Expected monthly income:</span>
                    <span className="font-medium text-green-500">
                      ${((totalPrice * (property.rentalIncome / 100)) / 12).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">Expected annual return:</span>
                    <span className="font-medium text-green-500">
                      ${(totalPrice * (property.projectedRoi / 100)).toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="flex flex-col space-y-4">
                {!user?.walletAddress && (
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={async () => {
                      try {
                        const { connectWallet } = await import('@/lib/web3');
                        await connectWallet();
                        toast({
                          title: "Wallet Connected",
                          description: "Your wallet has been connected successfully.",
                        });
                      } catch (error: any) {
                        toast({
                          title: "Connection Failed",
                          description: error.message || "Could not connect to wallet.",
                          variant: "destructive",
                        });
                      }
                    }}
                  >
                    <Wallet className="mr-2 h-4 w-4" /> Connect Wallet
                  </Button>
                )}
                
                <Button 
                  className="w-full" 
                  onClick={handleBuyTokens}
                  disabled={isBuying || tokenAmount < 1 || tokenAmount > property.tokensAvailable}
                >
                  {isBuying ? "Processing..." : `Buy ${tokenAmount} Tokens`}
                </Button>
                
                <p className="text-xs text-muted-foreground text-center">
                  By purchasing tokens, you agree to the terms and conditions of BrickByte's tokenized real estate platform.
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
