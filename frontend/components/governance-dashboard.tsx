"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Clock, CheckCircle, XCircle, PlusCircle, Vote } from "lucide-react";
import { useGovernance } from "@/hooks/useGovernanceCombined";

interface Proposal {
  _id: string;
  title: string;
  description: string;
  propertyId: string;
  propertyName: string;
  creator: {
    _id: string;
    name: string;
  };
  options: string[];
  status: 'active' | 'completed' | 'pending';
  startDate: string;
  endDate: string;
  results: {
    option: string;
    votes: number;
    percentage: number;
  }[];
  totalVotes: number;
  userVoted?: boolean;
  userVote?: string;
}

export default function GovernanceDashboard() {
  const router = useRouter();
  const { proposals, isLoading, error, voteOnProposal } = useGovernance();
  const [votingProposalId, setVotingProposalId] = useState<string | null>(null);

  const handleVote = async (proposalId: string, option: string) => {
    setVotingProposalId(proposalId);
    try {
      await voteOnProposal(proposalId, option);
    } catch (error) {
      console.error("Error voting on proposal:", error);
    } finally {
      setVotingProposalId(null);
    }
  };

  const handleCreateProposal = () => {
    router.push("/governance/create");
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2 mt-2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-4 bg-muted rounded w-full mb-2"></div>
              <div className="h-4 bg-muted rounded w-full mb-2"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </CardContent>
            <CardFooter>
              <div className="h-10 bg-muted rounded w-full"></div>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error Loading Proposals</CardTitle>
        </CardHeader>
        <CardContent>
          <p>There was an error loading the governance proposals. Please try again later.</p>
        </CardContent>
        <CardFooter>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </CardFooter>
      </Card>
    );
  }

  const activeProposals = proposals?.filter((p: Proposal) => p.status === 'active') || [];
  const completedProposals = proposals?.filter((p: Proposal) => p.status === 'completed') || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Governance Dashboard</h2>
          <p className="text-muted-foreground">
            Vote on active proposals and view past decisions
          </p>
        </div>
        <Button onClick={handleCreateProposal}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Proposal
        </Button>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active" className="flex items-center">
            <Clock className="mr-2 h-4 w-4" />
            Active Proposals ({activeProposals.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center">
            <CheckCircle className="mr-2 h-4 w-4" />
            Completed Proposals ({completedProposals.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6 space-y-4">
          {activeProposals.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                <h3 className="mt-4 text-lg font-medium">No Active Proposals</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  There are currently no active proposals to vote on.
                </p>
                <Button onClick={handleCreateProposal} className="mt-4">
                  Create a New Proposal
                </Button>
              </CardContent>
            </Card>
          ) : (
            activeProposals.map((proposal: Proposal) => (
              <Card key={proposal._id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <Link href={`/governance/${proposal._id}`} className="hover:underline">
                        <CardTitle>{proposal.title}</CardTitle>
                      </Link>
                      <CardDescription className="mt-1">
                        {proposal.propertyName ? (
                          <span className="flex items-center gap-1">
                            Property: {proposal.propertyName}
                          </span>
                        ) : (
                          "Platform-wide proposal"
                        )}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="ml-2">
                      {new Date(proposal.endDate) > new Date() ? 
                        `Ends ${new Date(proposal.endDate).toLocaleDateString()}` : 
                        `Ended ${new Date(proposal.endDate).toLocaleDateString()}`
                      }
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {proposal.description}
                  </p>
                  <div className="space-y-2">
                    {proposal.results.map((result, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="flex items-center">
                            {result.option === 'yes' ? (
                              <CheckCircle className="mr-1 h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="mr-1 h-4 w-4 text-red-500" />
                            )}
                            {result.option}: {result.votes}
                          </span>
                          <span>{result.percentage.toFixed(1)}%</span>
                        </div>
                        <Progress 
                          value={result.percentage} 
                          className="h-2"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between gap-2 border-t bg-muted/50 px-6 py-3">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push(`/governance/${proposal._id}`)}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    View Details
                  </Button>
                  <div className="flex gap-2 w-full">
                    <Button
                      variant="default"
                      className="w-full"
                      onClick={() => handleVote(proposal._id, 'yes')}
                      disabled={votingProposalId === proposal._id}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Vote For
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleVote(proposal._id, 'no')}
                      disabled={votingProposalId === proposal._id}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Vote Against
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-6 space-y-4">
          {completedProposals.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                <h3 className="mt-4 text-lg font-medium">No Completed Proposals</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  There are no completed proposals to display.
                </p>
              </CardContent>
            </Card>
          ) : (
            completedProposals.map((proposal: Proposal) => (
              <Card key={proposal._id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <Link href={`/governance/${proposal._id}`} className="hover:underline">
                        <CardTitle>{proposal.title}</CardTitle>
                      </Link>
                      <CardDescription className="mt-1">
                        {proposal.propertyName ? (
                          <span className="flex items-center gap-1">
                            Property: {proposal.propertyName}
                          </span>
                        ) : (
                          "Platform-wide proposal"
                        )}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="ml-2">
                      {(proposal.results.find(r => r.option === 'yes')?.percentage ?? 0) > 50 ? "Passed" : "Rejected"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {proposal.description}
                  </p>
                  <div className="space-y-2">
                    {proposal.results.map((result, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="flex items-center">
                            {result.option === 'yes' ? (
                              <CheckCircle className="mr-1 h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="mr-1 h-4 w-4 text-red-500" />
                            )}
                            {result.option}: {result.votes}
                          </span>
                          <span>{result.percentage.toFixed(1)}%</span>
                        </div>
                        <Progress 
                          value={result.percentage} 
                          className="h-2"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push(`/governance/${proposal._id}`)}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
