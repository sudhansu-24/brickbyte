"use client";

import useSWR from 'swr';
import { useState } from 'react';
import axios from 'axios';
import { governanceService } from '@/lib/api';
import { Proposal, VoteData, CreateProposalData } from '@/types/governance';

// Combined hook for all governance functionality
export function useGovernance() {
  const { data: proposals, error, isLoading, mutate } = useSWR<Proposal[]>('governance-proposals', async () => {
    const response = await governanceService.getProposals();
    return response.data;
  }, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    dedupingInterval: 60000, // 1 minute
  });

  const voteOnProposal = async (proposalId: string, option: string) => {
    try {
      const response = await governanceService.voteOnProposal(proposalId, option);
      await mutate();
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };

  const createProposal = async (proposalData: CreateProposalData) => {
    try {
      const response = await governanceService.createProposal(proposalData);
      await mutate();
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };

  return {
    proposals,
    isLoading,
    error,
    voteOnProposal,
    createProposal,
    refreshProposals: mutate
  };
}

// Separate hook for creating proposals
export function useCreateProposal() {
  const [isLoading, setIsLoading] = useState(false);
  
  const createProposal = async (proposalData: CreateProposalData) => {
    setIsLoading(true);
    try {
      const response = await governanceService.createProposal(proposalData);
      setIsLoading(false);
      return response.data;
    } catch (error: any) {
      setIsLoading(false);
      throw error;
    }
  };

  return {
    createProposal,
    isLoading
  };
}
