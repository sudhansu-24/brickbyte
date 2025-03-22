"use client";

import useSWR from 'swr';
import { marketService } from '@/lib/api';

type MarketInsight = {
  tokenValue: {
    current: number;
    projected: number;
    change: number;
    history: { date: string; value: number }[];
  };
  rentalYield: {
    current: number;
    projected: number;
    change: number;
    history: { date: string; value: number }[];
  };
  marketTrends: {
    propertyType: string;
    demand: number;
    priceGrowth: number;
    confidence: number;
  }[];
  aiRecommendations: {
    action: string;
    reason: string;
    confidence: number;
  }[];
};

const fetcher = async (propertyId?: string) => {
  const response = await marketService.getMarketInsights(propertyId);
  return response.data;
};

export function useMarketInsights(propertyId?: string) {
  const { data, error, isLoading, mutate } = useSWR<MarketInsight>(
    [`market-insights`, propertyId],
    () => fetcher(propertyId),
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      dedupingInterval: 300000, // 5 minutes
    }
  );

  return {
    insights: data,
    isLoading,
    isError: error,
    mutate,
  };
}
