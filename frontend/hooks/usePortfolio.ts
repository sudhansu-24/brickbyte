"use client";

import useSWR from 'swr';
import { portfolioService } from '@/lib/api';

type PortfolioHolding = {
  property: {
    _id: string;
    name: string;
    location: string;
    images: string[];
    tokenPrice: number;
    rentalIncome: number;
  };
  amount: number;
  value: number;
  monthlyRental: number;
  prediction: {
    predictedPrice: number;
    roi: number;
    confidence: number;
  };
};

type Portfolio = {
  totalValue: number;
  rentalIncome: number;
  holdings: PortfolioHolding[];
  suggestion: {
    property: string;
    action: 'BUY' | 'SELL' | 'HOLD';
    amount: number;
    reason: string;
  }[];
};

type PortfolioHistory = {
  property: string;
  purchasePrice: number;
  currentPrice: number;
  priceHistory: { date: string; price: number }[];
  roi: number;
}[];

const portfolioFetcher = async () => {
  const response = await portfolioService.getPortfolio();
  return response.data;
};

const historyFetcher = async () => {
  const response = await portfolioService.getHistoricalPerformance();
  return response.data;
};

export function usePortfolio() {
  const { data, error, isLoading, mutate } = useSWR<Portfolio>('portfolio', portfolioFetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000, // 1 minute
  });

  const rebalance = async () => {
    try {
      const result = await portfolioService.rebalancePortfolio();
      mutate();
      return result;
    } catch (error) {
      console.error('Error rebalancing portfolio:', error);
      throw error;
    }
  };

  return {
    portfolio: data,
    isLoading,
    isError: error,
    mutate,
    rebalance,
  };
}

export function usePortfolioHistory() {
  const { data, error, isLoading } = useSWR<PortfolioHistory>('portfolio-history', historyFetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 300000, // 5 minutes
  });

  return {
    history: data || [],
    isLoading,
    isError: error,
  };
}
