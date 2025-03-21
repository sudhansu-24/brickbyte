"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useStakingOptions, useStakedTokens, useStakeTokens, useUnstakeTokens } from "@/hooks/useStaking";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, Clock, Wallet, Landmark, TrendingUp, Lock, Unlock } from "lucide-react";

export default function StakingPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { stakingOptions, isLoading: optionsLoading, mutate: refreshOptions } = useStakingOptions();
  const { stakedTokens, isLoading: stakedLoading, mutate: refreshStaked } = useStakedTokens();
  const { stakeTokens, isLoading: stakeLoading } = useStakeTokens();
  const { unstakeTokens, isLoading: unstakeLoading } = useUnstakeTokens();
  const router = useRouter();
  const { toast } = useToast();

  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [stakeAmount, setStakeAmount] = useState(1);
  const [unstakeId, setUnstakeId] = useState<string | null>(null);

  const isLoading = authLoading || optionsLoading || stakedLoading;
  const isProcessing = stakeLoading || unstakeLoading;

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  const handleStake = async () => {
    if (!selectedOption) return;
    
    try {
      await stakeTokens(selectedOption, stakeAmount);
      toast({
        title: "Tokens Staked",
        description: `Successfully staked ${stakeAmount} tokens.`,
      });
      setSelectedOption(null);
      setStakeAmount(1);
      refreshStaked();
    } catch (error: any) {
      toast({
        title: "Staking Failed",
        description: error.message || "Could not stake tokens. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUnstake = async (stakeId: string) => {
    try {
      await unstakeTokens(stakeId);
      toast({
        title: "Tokens Unstaked",
        description: "Successfully unstaked your tokens.",
      });
      refreshStaked();
    } catch (error: any) {
      toast({
        title: "Unstaking Failed",
        description: error.message || "Could not unstake tokens. Please try again.",
        variant: "destructive",
      });
    }
  };

  const calculateTimeRemaining = (endDate: string) => {
    const end = new Date(endDate).getTime();
    const now = new Date().getTime();
    const timeRemaining = end - now;
    
    if (timeRemaining <= 0) return "Ready to unstake";
    
    const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    return `${days}d ${hours}h remaining`;
  };

  const calculateProgress = (startDate: string, endDate: string) => {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const now = new Date().getTime();
    
    const totalDuration = end - start;
    const elapsed = now - start;
    
    if (elapsed >= totalDuration) return 100;
    if (elapsed <= 0) return 0;
    
    return Math.floor((elapsed / totalDuration) * 100);
  };

  if (isLoading) {
    return (
      <div className="container flex items-center justify-center min-h-[600px]">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Loading staking options...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Redirect is handled in useEffect
  }

  return (
    <div className="container py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Token Staking</h1>
          <p className="text-muted-foreground mt-1">Stake your property tokens to earn additional rewards</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => { refreshOptions(); refreshStaked(); }}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="stake">
        <TabsList className="mb-6">
          <TabsTrigger value="stake">Stake Tokens</TabsTrigger>
          <TabsTrigger value="active">Active Stakes</TabsTrigger>
        </TabsList>

        <TabsContent value="stake">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stakingOptions && stakingOptions.length > 0 ? (
              stakingOptions.map((option) => (
                <Card 
                  key={option._id} 
                  className={`cursor-pointer transition-all ${selectedOption === option._id ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => setSelectedOption(option._id)}
                >
                  <CardHeader>
                    <CardTitle>{option.name}</CardTitle>
                    <CardDescription>{option.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">APY:</span>
                        <span className="font-medium text-green-500">{option.apy.toFixed(2)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Lock Period:</span>
                        <span className="font-medium">{option.lockPeriodDays} days</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Min. Stake:</span>
                        <span className="font-medium">{option.minimumStake} tokens</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <div className="w-full text-center text-sm text-muted-foreground">
                      {selectedOption === option._id ? "Selected" : "Click to select"}
                    </div>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center p-12 border rounded-lg bg-muted/50">
                <Landmark className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">No Staking Options Available</h3>
                <p className="text-muted-foreground text-center">There are currently no staking options available.</p>
              </div>
            )}
          </div>

          {selectedOption && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Stake Your Tokens</CardTitle>
                <CardDescription>
                  Enter the amount of tokens you want to stake
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Amount to Stake</label>
                    <div className="flex items-center">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => setStakeAmount(Math.max(1, stakeAmount - 1))}
                        disabled={stakeAmount <= 1 || isProcessing}
                      >
                        -
                      </Button>
                      <Input 
                        type="number" 
                        min="1"
                        value={stakeAmount} 
                        onChange={(e) => setStakeAmount(parseInt(e.target.value) || 1)}
                        className="text-center mx-2" 
                        disabled={isProcessing}
                      />
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => setStakeAmount(stakeAmount + 1)}
                        disabled={isProcessing}
                      >
                        +
                      </Button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Selected plan:</span>
                      <span className="font-medium">
                        {stakingOptions.find(o => o._id === selectedOption)?.name || ""}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">APY:</span>
                      <span className="font-medium text-green-500">
                        {stakingOptions.find(o => o._id === selectedOption)?.apy.toFixed(2) || 0}%
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Lock period:</span>
                      <span className="font-medium">
                        {stakingOptions.find(o => o._id === selectedOption)?.lockPeriodDays || 0} days
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b font-bold">
                      <span>Estimated reward:</span>
                      <span className="text-green-500">
                        {(
                          stakeAmount * 
                          (stakingOptions.find(o => o._id === selectedOption)?.apy || 0) / 100 * 
                          (stakingOptions.find(o => o._id === selectedOption)?.lockPeriodDays || 0) / 365
                        ).toFixed(2)} tokens
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  onClick={handleStake}
                  disabled={isProcessing || stakeAmount < 1}
                >
                  {isProcessing ? "Processing..." : `Stake ${stakeAmount} Tokens`}
                </Button>
              </CardFooter>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="active">
          <div className="space-y-6">
            {stakedTokens && stakedTokens.length > 0 ? (
              stakedTokens.map((stake) => (
                <Card key={stake._id}>
                  <CardHeader>
                    <CardTitle>{stake.stakingOption.name}</CardTitle>
                    <CardDescription>
                      Staked on {new Date(stake.startDate).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Staked Amount</p>
                          <p className="font-medium">{stake.amount} tokens</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">APY</p>
                          <p className="font-medium text-green-500">{stake.stakingOption.apy.toFixed(2)}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Reward</p>
                          <p className="font-medium text-green-500">+{stake.estimatedReward.toFixed(2)} tokens</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Progress</span>
                          <span className="text-sm">
                            {calculateTimeRemaining(stake.endDate)}
                          </span>
                        </div>
                        <Progress value={calculateProgress(stake.startDate, stake.endDate)} />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full" 
                      variant={new Date(stake.endDate) > new Date() ? "outline" : "default"}
                      onClick={() => handleUnstake(stake._id)}
                      disabled={isProcessing || new Date(stake.endDate) > new Date()}
                    >
                      {new Date(stake.endDate) > new Date() ? (
                        <>
                          <Lock className="mr-2 h-4 w-4" />
                          Locked until {new Date(stake.endDate).toLocaleDateString()}
                        </>
                      ) : (
                        <>
                          <Unlock className="mr-2 h-4 w-4" />
                          {isProcessing ? "Processing..." : "Unstake Tokens"}
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center p-12 border rounded-lg bg-muted/50">
                <Wallet className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">No Active Stakes</h3>
                <p className="text-muted-foreground text-center mb-4">You don't have any active staked tokens. Start staking to earn rewards.</p>
                <Button onClick={() => router.push("/staking?tab=stake")}>Start Staking</Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
