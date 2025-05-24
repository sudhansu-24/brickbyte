'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, TrendingUp, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { ethers } from 'ethers';
import RealEstateToken from '@/contracts/RealEstateToken.json';
import Cookies from 'js-cookie';
import { AIAnalysisModal } from '@/components/ai-analysis-modal';

declare global {
  interface Window {
    ethereum?: any;
  }
}

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

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

export default function PropertyDetails() {
  const { id } = useParams();
  const [property, setProperty] = useState<Property | null>(null);
  const [userShares, setUserShares] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transactionAmount, setTransactionAmount] = useState('');
  const [isBuying, setIsBuying] = useState(true);
  const [isTransactionPending, setIsTransactionPending] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPropertyDetails();
    fetchUserShares();
  }, [id]);

  const fetchPropertyDetails = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/properties/${id}`, {
        headers: {
          'Authorization': `Bearer ${Cookies.get('token')}`
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setProperty(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserShares = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/shares`, {
        headers: {
          'Authorization': `Bearer ${Cookies.get('token')}`
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      
      const propertyShares = data.find((share: any) => share.properties.id === id);
      setUserShares(propertyShares ? propertyShares.shares : 0);
    } catch (err: any) {
      console.error('Error fetching user shares:', err);
    }
  };

  const handleTransaction = async () => {
    if (!property) return;
    
    try {
      setIsTransactionPending(true);
      
      if (!window.ethereum) {
        toast({
          title: "Error",
          description: "Please install MetaMask!",
          variant: "destructive",
        });
        return;
      }

      const amount = parseInt(transactionAmount);
      if (isNaN(amount) || amount <= 0) {
        toast({
          title: "Error",
          description: "Please enter a valid number of shares",
          variant: "destructive",
        });
        return;
      }

      if (isBuying && amount > property.available_shares) {
        toast({
          title: "Error",
          description: "Not enough shares available",
          variant: "destructive",
        });
        return;
      }

      if (!isBuying && amount > userShares) {
        toast({
          title: "Error",
          description: "Not enough shares to sell",
          variant: "destructive",
        });
        return;
      }

      // Show transaction pending toast
      toast({
        title: "Transaction Pending",
        description: `Please confirm the ${isBuying ? 'purchase' : 'sale'} in your MetaMask wallet.`,
      });

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!,
        RealEstateToken.abi,
        signer
      );

      if (isBuying) {
        const totalCost = ethers.parseEther((property.price_per_share * amount).toString());
        const propertyId = ethers.getBigInt(property.blockchain_property_id);
        
        console.log('Buying shares:', {
          propertyId: propertyId.toString(),
          amount,
          totalCost: totalCost.toString()
        });

        const tx = await contract.purchaseShares(propertyId, amount, { value: totalCost });
        
        // Show transaction submitted toast
        toast({
          title: "Transaction Submitted",
          description: `Transaction hash: ${tx.hash}`,
        });

        await tx.wait();

        // Show transaction confirmed toast
        toast({
          title: "Transaction Confirmed",
          description: `Successfully purchased ${amount} shares!`,
        });
      } else {
        const propertyId = ethers.getBigInt(property.blockchain_property_id);
        
        console.log('Selling shares:', {
          propertyId: propertyId.toString(),
          amount
        });

        const tx = await contract.sellShares(propertyId, amount);
        
        // Show transaction submitted toast
        toast({
          title: "Transaction Submitted",
          description: `Transaction hash: ${tx.hash}`,
        });

        await tx.wait();

        // Show transaction confirmed toast
        toast({
          title: "Transaction Confirmed",
          description: `Successfully sold ${amount} shares!`,
        });
      }

      // Record transaction in backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/properties/${id}/${isBuying ? 'buy' : 'sell'}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Cookies.get('token')}`
        },
        body: JSON.stringify({ shares: amount })
      });

      if (!response.ok) {
        throw new Error('Failed to record transaction');
      }

      // Show final success toast
      toast({
        title: "Success",
        description: `Your ${isBuying ? 'purchase' : 'sale'} has been completed successfully!`,
      });

      // Refresh data
      fetchPropertyDetails();
      fetchUserShares();
      setTransactionAmount('');
    } catch (error: any) {
      console.error('Transaction error:', error);
      toast({
        title: "Error",
        description: error.message || 'Transaction failed. Please try again.',
        variant: "destructive",
      });
    } finally {
      setIsTransactionPending(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="container mx-auto py-8">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error || 'Property not found'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Property Image */}
        <div className="relative h-[500px] rounded-lg overflow-hidden">
          <img
            src={property.image_url}
            alt={property.name}
            className="w-full h-full object-cover"
          />
          <Badge
            className="absolute top-4 right-4"
            variant={property.type === "Commercial" ? "default" : "secondary"}
          >
            {property.type}
          </Badge>
        </div>

        {/* Property Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{property.name}</h1>
            <div className="flex items-center text-muted-foreground mt-2">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{property.location}</span>
            </div>
          </div>

          <p className="text-gray-600">{property.description}</p>

          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Price per Share</p>
                <p className="text-2xl font-semibold">{property.price_per_share} BNB</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Available Shares</p>
                <p className="text-2xl font-semibold">{property.available_shares}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Your Shares</p>
                <p className="text-2xl font-semibold">{userShares}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Rental Yield</p>
                <p className="text-2xl font-semibold text-green-600 flex items-center">
                  {property.rental_yield}%
                  <TrendingUp className="h-4 w-4 ml-1" />
                </p>
              </CardContent>
            </Card>
          </div>

          {/* AI Analysis and Price Prediction */}
          <div className="grid grid-cols-2 gap-4">
            <AIAnalysisModal 
              propertyId={property.id} 
              propertyData={{
                name: property.name,
                location: property.location,
                type: property.type,
                price_per_share: property.price_per_share
              }}
            />
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.open('https://price-prediction-59gg.onrender.com', '_blank')}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Try Price Prediction
            </Button>
          </div>

          {/* Trading Section */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Trade Shares</h3>
              <div className="flex space-x-4 mb-4">
                <Button
                  variant={isBuying ? "default" : "outline"}
                  onClick={() => setIsBuying(true)}
                  className="flex-1"
                >
                  Buy
                </Button>
                <Button
                  variant={!isBuying ? "default" : "outline"}
                  onClick={() => setIsBuying(false)}
                  className="flex-1"
                >
                  Sell
                </Button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Number of Shares</label>
                  <input
                    type="number"
                    value={transactionAmount}
                    onChange={(e) => setTransactionAmount(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2"
                    min="1"
                    max={isBuying ? property.available_shares : userShares}
                  />
                </div>
                <Button
                  onClick={handleTransaction}
                  disabled={isTransactionPending}
                  className="w-full"
                >
                  {isTransactionPending ? 'Processing...' : isBuying ? 'Buy Shares' : 'Sell Shares'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Toaster />
    </div>
  );
} 