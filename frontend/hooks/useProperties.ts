"use client";

import useSWR from 'swr';
import { propertyService } from '@/lib/api';

type Property = {
  _id: string;
  name: string;
  location: string;
  description: string;
  images: string[];
  propertyType: 'commercial' | 'residential' | 'retail';
  tokenPrice: number;
  totalTokens: number;
  tokensAvailable: number;
  rentalIncome: number;
  projectedRoi: number;
  yearBuilt: number;
  squareFootage: number;
  lotSize: string;
  bedrooms: number;
  bathrooms: number;
  contractAddress: string;
  createdAt: string;
  updatedAt: string;
};

const fetcher = async () => {
  const response = await propertyService.getProperties();
  return response.data;
};

export function useProperties() {
  const { data, error, isLoading, mutate } = useSWR<Property[]>('properties', fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    dedupingInterval: 60000, // 1 minute
  });

  return {
    properties: data,
    isLoading,
    error,
    mutate,
  };
}

export function usePropertyById(id: string) {
  const { data, error, isLoading } = useSWR<Property>(
    id ? `property/${id}` : null,
    async () => {
      const response = await propertyService.getProperty(id);
      return response.data;
    },
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      dedupingInterval: 60000,
    }
  );

  return {
    property: data,
    isLoading,
    error,
  };
}

export function useBuyTokens() {
  const buyTokens = async (propertyId: string, amount: number) => {
    try {
      const response = await propertyService.buyTokens(propertyId, amount);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  return { buyTokens };
}

