"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Brain, Check, Clock, Landmark, Users } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Mock data for governance proposals
const governanceProposals = [
  {
    id: 1,
    title: "Increase Rental Rates for Skyline Towers",
    description: "Proposal to increase rental rates by 5% to match market conditions.",
    votesFor: 65,
    votesAgainst: 35,
    status: "active",
    timeRemaining: "2 days",
  },
  {
    id: 2,
    title: "Renovate Common Areas in Oceanview Residences",
    description: "Allocate funds to renovate lobby and pool area to increase property value.",
    votesFor: 82,
    votesAgainst: 18,
    status: "active",
    timeRemaining: "5 days",
  },
  {
    id: 3,
    title: "Add EV Charging Stations to Tech Hub Office Park",
    description: "Install electric vehicle charging stations in the parking garage.",
    votesFor: 75,
    votesAgainst: 25,
    status: "completed",
    timeRemaining: "0 days",
  },
]

export default function StakingGovernance() {
  const { toast } = useToast()
  const [stakingAmount, setStakingAmount] = useState("")
  const [stakingDuration, setStakingDuration] = useState("30")
  const [activeTab, setActiveTab] = useState("staking")

  const handleStake = () => {
    if (!stakingAmount || Number.parseFloat(stakingAmount) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid staking amount",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Tokens Staked Successfully",
      description: `You have staked ${stakingAmount} tokens for ${stakingDuration} days.`,
    })

    // Reset form
    setStakingAmount("")
  }

  const handleVote = (proposalId: number, vote: "for" | "against") => {
    toast({
      title: "Vote Recorded",
      description: `Your vote has been recorded for proposal #${proposalId}.`,
    })
  }

  // Calculate estimated APY based on staking duration
  const calculateAPY = () => {
    const duration = Number.parseInt(stakingDuration)
    // Base APY is 5%, increases with longer staking periods
    const baseAPY = 5
    const bonusAPY = (duration / 30) * 0.5 // 0.5% bonus for each month
    return (baseAPY + bonusAPY).toFixed(2)
  }

  return (
    <section id="staking" className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Staking & Governance</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Stake your tokens to earn rewards and participate in property governance decisions.
          </p>
        </div>

        <Tabs defaultValue="staking" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList>
              <TabsTrigger value="staking">Staking</TabsTrigger>
              <TabsTrigger value="governance">Governance</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="staking">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Stake Your Tokens</CardTitle>
                  <CardDescription>Earn passive income by staking your property tokens</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Amount to Stake</label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={stakingAmount}
                      onChange={(e) => setStakingAmount(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">Staking Duration (Days)</label>
                    <div className="grid grid-cols-3 gap-2">
                      {["30", "90", "180"].map((days) => (
                        <Button
                          key={days}
                          type="button"
                          variant={stakingDuration === days ? "default" : "outline"}
                          onClick={() => setStakingDuration(days)}
                        >
                          {days} Days
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-md bg-blue-50 dark:bg-blue-950 p-4">
                    <div className="flex items-center mb-2">
                      <Brain className="h-5 w-5 text-blue-500 mr-2" />
                      <h4 className="font-medium text-blue-700 dark:text-blue-300">AI-Generated APY Estimate</h4>
                    </div>
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      Based on current market conditions and property performance, your estimated APY is:
                    </p>
                    <div className="mt-2 text-2xl font-bold text-blue-700 dark:text-blue-300">{calculateAPY()}%</div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={handleStake}
                    className="w-full"
                    disabled={!stakingAmount || Number.parseFloat(stakingAmount) <= 0}
                  >
                    Stake Tokens
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Your Staking Overview</CardTitle>
                  <CardDescription>Track your staked tokens and rewards</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Staked</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">$325.75</div>
                        <p className="text-xs text-muted-foreground">Across 3 properties</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Rewards Earned</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">$28.75</div>
                        <p className="text-xs text-muted-foreground">+$2.15 this week</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">Staking Positions</h4>
                    <div className="space-y-4">
                      <div className="rounded-md border p-4">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center">
                            <Landmark className="h-5 w-5 mr-2 text-blue-500" />
                            <span className="font-medium">Skyline Towers</span>
                          </div>
                          <Badge variant="outline">30 Days Left</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-2">
                          <div>
                            <p className="text-xs text-muted-foreground">Amount</p>
                            <p className="font-medium">$150.25</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">APY</p>
                            <p className="font-medium">5.5%</p>
                          </div>
                        </div>
                        <Progress value={50} className="h-2" />
                      </div>

                      <div className="rounded-md border p-4">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center">
                            <Landmark className="h-5 w-5 mr-2 text-blue-500" />
                            <span className="font-medium">Tech Hub Office Park</span>
                          </div>
                          <Badge variant="outline">90 Days Left</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-2">
                          <div>
                            <p className="text-xs text-muted-foreground">Amount</p>
                            <p className="font-medium">$175.50</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">APY</p>
                            <p className="font-medium">6.5%</p>
                          </div>
                        </div>
                        <Progress value={25} className="h-2" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="governance">
            <Card>
              <CardHeader>
                <CardTitle>Community Governance</CardTitle>
                <CardDescription>Vote on property management decisions and proposals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {governanceProposals.map((proposal) => (
                    <div key={proposal.id} className="rounded-md border p-4 space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium">{proposal.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{proposal.description}</p>
                        </div>
                        <Badge
                          variant={proposal.status === "active" ? "default" : "secondary"}
                          className="flex items-center"
                        >
                          {proposal.status === "active" ? (
                            <>
                              <Clock className="mr-1 h-3 w-3" />
                              {proposal.timeRemaining}
                            </>
                          ) : (
                            <>
                              <Check className="mr-1 h-3 w-3" />
                              Completed
                            </>
                          )}
                        </Badge>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Current Votes</span>
                          </div>
                          <div className="text-sm">
                            <span className="text-green-600 dark:text-green-400 font-medium">
                              {proposal.votesFor}% For
                            </span>{" "}
                            /{" "}
                            <span className="text-red-600 dark:text-red-400 font-medium">
                              {proposal.votesAgainst}% Against
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-4">
                          <div
                            className="bg-green-600 dark:bg-green-500 h-2.5 rounded-full"
                            style={{ width: `${proposal.votesFor}%` }}
                          ></div>
                        </div>
                      </div>

                      {proposal.status === "active" && (
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            className="flex-1 border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-950"
                            onClick={() => handleVote(proposal.id, "for")}
                          >
                            Vote For
                          </Button>
                          <Button
                            variant="outline"
                            className="flex-1 border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                            onClick={() => handleVote(proposal.id, "against")}
                          >
                            Vote Against
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  )
}

