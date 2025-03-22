"use client";

import useSWR from 'swr';
import { stakingService, governanceService } from '@/lib/api';

type StakingOption = {
  propertyId: string;
  propertyName: string;
  minDuration: number;
  maxDuration: number;
  baseApy: number;
  bonusApy: number;
  minAmount: number;
};

type StakedToken = {
  _id: string;
  propertyId: string;
  propertyName: string;
  amount: number;
  startDate: string;
  endDate: string;
  duration: number;
  apy: number;
  rewards: number;
  status: 'active' | 'completed' | 'pending';
};

type GovernanceProposal = {
  _id: string;
  title: string;
  description: string;
  propertyId?: string;
  propertyName?: string;
  status: 'active' | 'completed';
  votesFor: number;
  votesAgainst: number;
  timeRemaining?: string;
  createdAt: string;
  expiresAt: string;
};

export function useStakingOptions() {
  const { data, error, isLoading, mutate } = useSWR<StakingOption[]>('staking-options', async () => {
    const response = await stakingService.getStakingOptions();
    return response.data;
  }, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    dedupingInterval: 300000, // 5 minutes
  });

  return {
    options: data,
    isLoading,
    error,
    mutate,
  };
}

export function useStakedTokens() {
  const { data, error, isLoading, mutate } = useSWR<StakedToken[]>('staked-tokens', async () => {
    const response = await stakingService.getStakedTokens();
    return response.data;
  }, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    dedupingInterval: 60000, // 1 minute
  });

  return {
    stakedTokens: data,
    isLoading,
    error,
    mutate,
  };
}

export function useStakeTokens() {
  const { mutate: mutateStakedTokens } = useStakedTokens();

  const stakeTokens = async (propertyId: string, amount: number, duration: number) => {
    try {
      const response = await stakingService.stakeTokens(propertyId, amount, duration);
      await mutateStakedTokens();
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  return { stakeTokens };
}

export function useUnstakeTokens() {
  const { mutate: mutateStakedTokens } = useStakedTokens();

  const unstakeTokens = async (stakeId: string) => {
    try {
      const response = await stakingService.unstakeTokens(stakeId);
      await mutateStakedTokens();
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  return { unstakeTokens };
}

export function useGovernanceProposals() {
  const { data, error, isLoading, mutate } = useSWR<GovernanceProposal[]>(
    'governance-proposals',
    async () => {
      const response = await governanceService.getProposals();
      return response.data;
    },
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      dedupingInterval: 60000, // Refresh every minute for active votes
    }
  );

  const voteOnProposal = async (proposalId: string, vote: 'for' | 'against') => {
    try {
      const result = await governanceService.voteOnProposal(proposalId, vote);
      await mutate();
      return result;
    } catch (error) {
      console.error('Error voting on proposal:', error);
      throw error;
    }
  };

  return {
    proposals: data || [],
    isLoading,
    error,
    voteOnProposal,
    mutate,
  };
}
