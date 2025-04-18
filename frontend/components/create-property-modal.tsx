'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useProperties } from '@/hooks/use-properties';
import { ethers } from 'ethers';
import RealEstateToken from '@/contracts/RealEstateToken.json';
import Cookies from 'js-cookie';
import { Toaster } from '@/components/ui/toaster';
import { Plus } from 'lucide-react';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

interface CreatePropertyModalProps {
  onPropertyCreated?: () => void;
}

export function CreatePropertyModal({ onPropertyCreated }: CreatePropertyModalProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTransactionPending, setIsTransactionPending] = useState(false);
  const { toast } = useToast();
  const { mutate } = useProperties();

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    type: '',
    image_url: '',
    description: '',
    total_shares: '',
    price_per_share: '',
    rental_yield: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate form data
      if (!formData.name || !formData.location || !formData.description || 
          !formData.image_url || !formData.total_shares || !formData.price_per_share || 
          !formData.rental_yield) {
        throw new Error('Please fill in all fields');
      }

      // Convert values to appropriate types
      const totalShares = parseInt(formData.total_shares);
      const pricePerShare = ethers.parseEther(formData.price_per_share);
      const rentalYield = parseInt(formData.rental_yield);

      // Validate numeric values
      if (isNaN(totalShares) || totalShares <= 0) {
        throw new Error('Total shares must be a positive number');
      }
      if (isNaN(rentalYield) || rentalYield < 0 || rentalYield > 100) {
        throw new Error('Rental yield must be between 0 and 100');
      }

      if (!window.ethereum) {
        throw new Error('Please install MetaMask!');
      }

      if (!CONTRACT_ADDRESS) {
        throw new Error('Smart contract address not configured');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        RealEstateToken.abi,
        signer
      );

      // Show transaction pending toast
      toast({
        title: "Transaction Pending",
        description: "Please confirm the transaction in your MetaMask wallet.",
      });

      // Create property on blockchain
      setIsTransactionPending(true);
      const tx = await contract.listProperty(
        formData.name,
        formData.location,
        formData.description,
        formData.image_url,
        totalShares,
        pricePerShare,
        rentalYield
      );

      // Show transaction submitted toast
      toast({
        title: "Transaction Submitted",
        description: `Transaction hash: ${tx.hash}`,
      });

      // Wait for transaction confirmation
      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt);

      // Show transaction confirmed toast
      toast({
        title: "Transaction Confirmed",
        description: "Property successfully listed on the blockchain!",
      });

      // Get the property ID from the transaction logs
      const propertyId = receipt.logs[0].topics[1];
      if (!propertyId) {
        throw new Error('Failed to get property ID from transaction');
      }

      // Create property in database
      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Cookies.get('token')}`,
        },
        body: JSON.stringify({
          ...formData,
          contract_address: CONTRACT_ADDRESS,
          blockchain_property_id: propertyId,
          total_shares: Number(totalShares),
          available_shares: Number(totalShares),
          price_per_share: Number(ethers.formatEther(pricePerShare)),
          rental_yield: Number(rentalYield),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create property');
      }

      const data = await response.json();
      
      // Show success toast
      toast({
        title: "Success",
        description: "Property created successfully in the database!",
      });

      // Refresh the properties list
      if (onPropertyCreated) {
        await onPropertyCreated();
      } else if (mutate) {
        await mutate();
      } else {
        console.error('No refresh function available');
      }
      
      // Close the modal
      setOpen(false);
    } catch (error: any) {
      console.error('Error creating property:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to create property. Please try again.',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsTransactionPending(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Property
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Property</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Property Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Property Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select property type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Commercial">Commercial</SelectItem>
                  <SelectItem value="Residential">Residential</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image_url">Image URL</Label>
              <Input
                id="image_url"
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="total_shares">Total Shares</Label>
                <Input
                  id="total_shares"
                  type="number"
                  min="1"
                  value={formData.total_shares}
                  onChange={(e) => setFormData({ ...formData, total_shares: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price_per_share">Price per Share (ETH)</Label>
                <Input
                  id="price_per_share"
                  type="number"
                  step="0.0001"
                  min="0"
                  value={formData.price_per_share}
                  onChange={(e) => setFormData({ ...formData, price_per_share: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rental_yield">Rental Yield (%)</Label>
                <Input
                  id="rental_yield"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={formData.rental_yield}
                  onChange={(e) => setFormData({ ...formData, rental_yield: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isLoading || isTransactionPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || isTransactionPending}>
                {isTransactionPending ? 'Processing Transaction...' : isLoading ? 'Creating...' : 'Create Property'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <Toaster />
    </>
  );
} 