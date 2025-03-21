export interface Proposal {
  _id: string;
  title: string;
  description: string;
  status: 'pending' | 'active' | 'completed';
  startDate: string;
  endDate: string;
  options: string[];
  creator: {
    _id: string;
    name: string;
  };
  relatedProperty?: {
    _id: string;
    name: string;
  };
  userVoted?: boolean;
  results?: ProposalResult[];
}

export interface ProposalResult {
  option: string;
  votes: number;
  percentage: number;
}

export interface VoteData {
  proposalId: string;
  option: string;
}

export interface CreateProposalData {
  title: string;
  description: string;
  options: string[];
  startDate: string;
  endDate: string;
  propertyId?: string;
}
