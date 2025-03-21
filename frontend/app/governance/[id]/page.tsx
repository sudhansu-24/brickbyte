"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useGovernance } from "@/hooks/useGovernanceCombined";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Calendar, Users, Building, CheckCircle2, Clock, VoteIcon } from "lucide-react";

interface ProposalPageProps {
  params: {
    id: string;
  };
}

export default function ProposalPage({ params }: ProposalPageProps) {
  const { id } = params;
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { proposals, isLoading: proposalLoading, voteOnProposal, refreshProposals } = useGovernance();
  const [proposal, setProposal] = useState<any>(null);
  const [voteLoading, setVoteLoading] = useState(false);
  const { toast } = useToast();
  
  const [selectedOption, setSelectedOption] = useState<string>("");

  const isLoading = authLoading || proposalLoading;

  // Find the proposal by ID when proposals are loaded
  useEffect(() => {
    if (proposals && proposals.length > 0) {
      const foundProposal = proposals.find((p: any) => p._id === id);
      if (foundProposal) {
        setProposal(foundProposal);
      }
    }
  }, [proposals, id]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  const handleVote = async () => {
    if (!selectedOption || !proposal) return;
    
    try {
      setVoteLoading(true);
      await voteOnProposal(proposal._id, selectedOption);
      
      toast({
        title: "Vote Submitted",
        description: "Your vote has been recorded successfully.",
      });
      
      await refreshProposals();
      setVoteLoading(false);
    } catch (error: any) {
      setVoteLoading(false);
      toast({
        title: "Vote Failed",
        description: error.message || "Could not submit your vote. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const calculateTimeRemaining = (endDate: string) => {
    const end = new Date(endDate).getTime();
    const now = new Date().getTime();
    const timeRemaining = end - now;
    
    if (timeRemaining <= 0) return "Voting closed";
    
    const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    return `${days}d ${hours}h remaining`;
  };

  if (isLoading) {
    return (
      <div className="container flex items-center justify-center min-h-[600px]">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Loading proposal data...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !proposal) {
    return null; // Redirect is handled in useEffect or proposal not found
  }

  return (
    <div className="container py-12">
      <Button variant="ghost" className="mb-8" onClick={() => router.push('/governance')}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Governance
      </Button>

      <Card className="mb-8">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{proposal.title}</CardTitle>
              <CardDescription className="mt-1">
                Property: {proposal.propertyName}
              </CardDescription>
            </div>
            <Badge className={getStatusColor(proposal.status)}>
              {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <p>{proposal.description}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {formatDate(proposal.startDate)} - {formatDate(proposal.endDate)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{proposal.totalVotes} votes</span>
            </div>
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Created by {proposal.creator.name}</span>
            </div>
          </div>
          
          {proposal.status === 'active' && !proposal.userVoted && (
            <div className="p-4 border rounded-md">
              <h3 className="text-lg font-medium mb-4">Cast Your Vote</h3>
              <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
                <div className="space-y-3">
                  {proposal.options.map((option: string, index: number) => (
                    <div key={index} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={`option-${index}`} />
                      <Label htmlFor={`option-${index}`}>{option}</Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
              <Button 
                className="mt-4 w-full" 
                onClick={handleVote}
                disabled={voteLoading || !selectedOption}
              >
                {voteLoading ? "Submitting..." : "Submit Vote"}
              </Button>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                {calculateTimeRemaining(proposal.endDate)}
              </p>
            </div>
          )}
          
          {proposal.userVoted && (
            <div className="p-4 border rounded-md bg-muted/50">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <h3 className="text-lg font-medium">You've Voted</h3>
              </div>
              <p className="text-muted-foreground">
                You voted for <span className="font-medium">{proposal.userVote}</span>
              </p>
            </div>
          )}
          
          {proposal.status === 'pending' && (
            <div className="p-4 border rounded-md bg-muted/50">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="h-5 w-5 text-yellow-500" />
                <h3 className="text-lg font-medium">Voting Not Started</h3>
              </div>
              <p className="text-muted-foreground">
                This proposal will be open for voting on {formatDate(proposal.startDate)}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Current Results</h2>
        
        {proposal.results && proposal.results.length > 0 ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {proposal.results.map((result: any, index: number) => (
                <Card key={index}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{result.option}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Votes:</span>
                        <span className="font-medium">{result.votes}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Percentage:</span>
                        <span className="font-medium">{result.percentage.toFixed(1)}%</span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden mt-2">
                        <div 
                          className="h-full bg-primary rounded-full" 
                          style={{ width: `${result.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {proposal.status === 'completed' && (
              <Card className="bg-muted/50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <VoteIcon className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-medium">Final Result</h3>
                  </div>
                  <p className="text-muted-foreground">
                    The winning option is <span className="font-bold">
                      {proposal.results.sort((a: any, b: any) => b.votes - a.votes)[0]?.option}
                    </span> with {proposal.results.sort((a: any, b: any) => b.votes - a.votes)[0]?.percentage.toFixed(1)}% of votes.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <Card className="bg-muted/50">
            <CardContent className="py-6">
              <p className="text-center text-muted-foreground">
                No votes have been cast yet.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
