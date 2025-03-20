const User = require('../models/User');
const Property = require('../models/Property');
const marketPrediction = require('./marketPrediction');
const blockchain = require('../config/blockchain');
const ethers = require('ethers');

class StakingService {
  constructor() {
    this.minApy = 1.0; // 1%
    this.maxApy = 15.0; // 15%
    this.adjustmentRate = 0.5; // 0.5% adjustment
  }

  async calculateStakingAPY(propertyId) {
    try {
      const property = await Property.findById(propertyId);
      if (!property) throw new Error('Property not found');

      // Get AI prediction for market demand
      const prediction = await marketPrediction.getPrediction({
        location: property.location,
        historicalPrices: [property.tokenPrice],
        transactionVolume: property.totalTokens - property.tokensAvailable,
        rentalYield: (property.rentalIncome * 12) / (property.tokenPrice * property.totalTokens) * 100,
        marketDemand: 8.5 // Mock demand score
      });

      // Base APY calculation
      let apy = this.minApy;

      // Adjust APY based on market demand
      if (prediction.confidence > 0.7) {
        if (prediction.marketDemand > 7.5) {
          apy = Math.min(this.maxApy, apy + this.adjustmentRate);
        } else if (prediction.marketDemand < 5.0) {
          apy = Math.max(this.minApy, apy - this.adjustmentRate);
        }
      }

      return {
        apy,
        confidence: prediction.confidence,
        marketDemand: prediction.marketDemand
      };
    } catch (error) {
      console.error('APY Calculation Error:', error);
      return {
        apy: this.minApy,
        confidence: 0,
        marketDemand: 5.0
      };
    }
  }

  async stakeTokens(user, propertyId, amount) {
    try {
      const property = await Property.findById(propertyId);
      if (!property) throw new Error('Property not found');

      // Check if user has enough tokens
      const userTokens = user.tokensHeld.find(t => t.property.toString() === propertyId);
      if (!userTokens || userTokens.amount < amount) {
        throw new Error('Insufficient tokens');
      }

      // Call smart contract to stake tokens
      const tx = await blockchain.stakeTokens(
        property.contractAddress,
        ethers.parseEther(amount.toString())
      );
      await tx.wait();

      // Update user's staking balance in MongoDB
      const stakeIndex = user.stakedTokens.findIndex(
        s => s.property.toString() === propertyId
      );

      if (stakeIndex === -1) {
        user.stakedTokens.push({
          property: propertyId,
          amount: amount,
          stakedAt: new Date(),
          lastRewardClaim: new Date()
        });
      } else {
        user.stakedTokens[stakeIndex].amount += amount;
      }

      // Update governance votes (1 token = 1 vote)
      user.governanceVotes = user.stakedTokens.reduce((total, stake) => total + stake.amount, 0);

      // Update token holdings
      userTokens.amount -= amount;

      await user.save();

      // Calculate and return APY
      const stakingInfo = await this.calculateStakingAPY(propertyId);

      return {
        stakedAmount: amount,
        totalStaked: user.stakedTokens.reduce((total, stake) => total + stake.amount, 0),
        governanceVotes: user.governanceVotes,
        apy: stakingInfo.apy
      };
    } catch (error) {
      console.error('Staking Error:', error);
      throw error;
    }
  }

  async unstakeTokens(user, propertyId, amount) {
    try {
      const property = await Property.findById(propertyId);
      if (!property) throw new Error('Property not found');

      // Check if user has enough staked tokens
      const stakedTokens = user.stakedTokens.find(
        s => s.property.toString() === propertyId
      );
      if (!stakedTokens || stakedTokens.amount < amount) {
        throw new Error('Insufficient staked balance');
      }

      // Claim any pending rewards first
      await this.claimRewards(user, propertyId);

      // Call smart contract to unstake tokens
      const tx = await blockchain.unstakeTokens(
        property.contractAddress,
        ethers.parseEther(amount.toString())
      );
      await tx.wait();

      // Update user's staking balance
      stakedTokens.amount -= amount;
      if (stakedTokens.amount === 0) {
        user.stakedTokens = user.stakedTokens.filter(
          s => s.property.toString() !== propertyId
        );
      }

      // Update governance votes
      user.governanceVotes = user.stakedTokens.reduce((total, stake) => total + stake.amount, 0);

      // Return tokens to user's holdings
      const tokenHolding = user.tokensHeld.find(t => t.property.toString() === propertyId);
      if (tokenHolding) {
        tokenHolding.amount += amount;
      } else {
        user.tokensHeld.push({
          property: propertyId,
          amount: amount,
          purchasePrice: property.tokenPrice,
          purchaseDate: new Date()
        });
      }

      await user.save();

      return {
        unstakedAmount: amount,
        remainingStaked: stakedTokens.amount,
        governanceVotes: user.governanceVotes
      };
    } catch (error) {
      console.error('Unstaking Error:', error);
      throw error;
    }
  }

  async claimRewards(user, propertyId) {
    try {
      const property = await Property.findById(propertyId);
      if (!property) throw new Error('Property not found');

      const stakedTokens = user.stakedTokens.find(
        s => s.property.toString() === propertyId
      );
      if (!stakedTokens || stakedTokens.amount === 0) {
        throw new Error('No staked balance');
      }

      // Call smart contract to claim rewards
      const tx = await blockchain.claimStakingRewards(property.contractAddress);
      const receipt = await tx.wait();

      // Parse reward amount from transaction receipt
      const rewardAmount = ethers.formatEther(receipt.logs[0].args.amount);

      // Update user's reward balance
      user.stakingRewards += parseFloat(rewardAmount);
      stakedTokens.lastRewardClaim = new Date();
      await user.save();

      return {
        claimedAmount: rewardAmount,
        totalRewards: user.stakingRewards
      };
    } catch (error) {
      console.error('Claim Rewards Error:', error);
      throw error;
    }
  }

  async vote(user, proposalId, voteType) {
    try {
      if (user.governanceVotes === 0) {
        throw new Error('No governance votes available');
      }

      // Call smart contract to vote
      const tx = await blockchain.vote(proposalId, voteType === 'YES');
      await tx.wait();

      return {
        proposalId,
        vote: voteType,
        votingPower: user.governanceVotes
      };
    } catch (error) {
      console.error('Voting Error:', error);
      throw error;
    }
  }
}

module.exports = new StakingService();
