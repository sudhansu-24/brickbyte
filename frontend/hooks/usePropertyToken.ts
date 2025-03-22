"use client";

import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  connectWallet,
  buyPropertyTokens,
  getTokenPrice,
  getAvailableTokens,
  getTokenBalance
} from '@/lib/web3';

export function usePropertyToken(contractAddress: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get token price from the contract
  const fetchTokenPrice = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const price = await getTokenPrice(contractAddress);
      return price;
    } catch (err: any) {
      setError(err.message || 'Failed to get token price');
      toast({
        title: 'Error',
        description: 'Failed to get token price',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [contractAddress, toast]);

  // Get available tokens from the contract
  const fetchAvailableTokens = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const available = await getAvailableTokens(contractAddress);
      return available;
    } catch (err: any) {
      setError(err.message || 'Failed to get available tokens');
      toast({
        title: 'Error',
        description: 'Failed to get available tokens',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [contractAddress, toast]);

  // Get user's token balance
  const fetchUserBalance = useCallback(async (address?: string) => {
    if (!address && !user?.walletAddress) {
      setError('Wallet address is required');
      return null;
    }

    setIsLoading(true);
    setError(null);
    try {
      const walletAddress = address || user?.walletAddress || '';
      const balance = await getTokenBalance(contractAddress, walletAddress);
      return balance;
    } catch (err: any) {
      setError(err.message || 'Failed to get token balance');
      toast({
        title: 'Error',
        description: 'Failed to get token balance',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [contractAddress, user, toast]);

  // Buy tokens from the contract
  const buyTokens = useCallback(async (amount: number, tokenPrice: number) => {
    if (!user?.walletAddress) {
      try {
        // Connect wallet if not connected
        await connectWallet();
      } catch (err: any) {
        setError(err.message || 'Failed to connect wallet');
        toast({
          title: 'Wallet Connection Failed',
          description: err.message || 'Failed to connect wallet',
          variant: 'destructive',
        });
        return null;
      }
    }

    setIsLoading(true);
    setError(null);
    try {
      const result = await buyPropertyTokens(contractAddress, amount, tokenPrice);
      toast({
        title: 'Purchase Successful',
        description: `Successfully purchased ${amount} tokens`,
      });
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to buy tokens');
      toast({
        title: 'Purchase Failed',
        description: err.message || 'Failed to buy tokens',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [contractAddress, user, toast]);

  return {
    fetchTokenPrice,
    fetchAvailableTokens,
    fetchUserBalance,
    buyTokens,
    isLoading,
    error,
  };
}
