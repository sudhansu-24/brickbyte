const User = require('../models/User');
const Property = require('../models/Property');
const marketPrediction = require('./marketPrediction');
const blockchain = require('../config/blockchain');
const ethers = require('ethers');

class YieldService {
  constructor() {
    this.minYieldRate = 0.02; // 2% minimum yield
    this.maxYieldRate = 0.12; // 12% maximum yield
    this.adjustmentRate = 0.005; // 0.5% adjustment step
  }

  async calculateRentalYield(propertyId) {
    try {
      const property = await Property.findById(propertyId);
      if (!property) throw new Error('Property not found');

      // Get AI prediction for rental yield
      const prediction = await marketPrediction.getPrediction({
        location: property.location,
        historicalPrices: [property.tokenPrice],
        transactionVolume: property.totalTokens - property.tokensAvailable,
        rentalYield: (property.rentalIncome * 12) / (property.tokenPrice * property.totalTokens) * 100,
        marketDemand: 8.5 // Mock demand score
      });

      // Base yield calculation
      let yieldRate = this.minYieldRate;

      // Adjust yield based on market conditions
      if (prediction.confidence > 0.7) {
        if (prediction.marketDemand > 7.5) {
          yieldRate = Math.min(this.maxYieldRate, yieldRate + this.adjustmentRate);
        } else if (prediction.marketDemand < 5.0) {
          yieldRate = Math.max(this.minYieldRate, yieldRate - this.adjustmentRate);
        }
      }

      const monthlyYield = property.tokenPrice * yieldRate / 12;

      return {
        monthlyYield,
        annualYieldRate: yieldRate * 100,
        confidence: prediction.confidence,
        marketDemand: prediction.marketDemand
      };
    } catch (error) {
      console.error('Rental Yield Calculation Error:', error);
      throw error;
    }
  }

  async updateRentalIncome(propertyId) {
    try {
      const property = await Property.findById(propertyId);
      if (!property) throw new Error('Property not found');

      const yieldInfo = await this.calculateRentalYield(propertyId);
      const monthlyYield = ethers.parseEther(yieldInfo.monthlyYield.toString());

      // Update rental income in smart contract
      const currentMonth = Math.floor(Date.now() / (30 * 24 * 60 * 60 * 1000));
      const tx = await blockchain.updateRentalIncome(
        property.contractAddress,
        currentMonth,
        monthlyYield
      );
      await tx.wait();

      // Update property in MongoDB
      property.rentalIncome = yieldInfo.monthlyYield;
      await property.save();

      return {
        propertyId,
        monthlyYield: yieldInfo.monthlyYield,
        annualYieldRate: yieldInfo.annualYieldRate,
        nextDistribution: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      };
    } catch (error) {
      console.error('Update Rental Income Error:', error);
      throw error;
    }
  }

  async distributeYield(propertyId) {
    try {
      const property = await Property.findById(propertyId);
      if (!property) throw new Error('Property not found');

      // Call smart contract to distribute yield
      const tx = await blockchain.distributeYield(property.contractAddress);
      const receipt = await tx.wait();

      // Get total yield distributed from event logs
      const yieldDistributed = ethers.formatEther(receipt.logs[0].args.amount);

      // Update all token holders in MongoDB
      const users = await User.find({
        'tokensHeld.property': propertyId
      });

      for (const user of users) {
        const tokenHolding = user.tokensHeld.find(
          t => t.property.toString() === propertyId
        );

        if (tokenHolding) {
          const userYield = (tokenHolding.amount / property.totalTokens) * yieldDistributed;
          
          user.yieldEarned += userYield;
          user.lastYieldPaid = new Date();
          user.yieldHistory.push({
            property: propertyId,
            amount: userYield,
            timestamp: new Date()
          });

          await user.save();
        }
      }

      return {
        propertyId,
        totalYieldDistributed: yieldDistributed,
        distributionDate: new Date(),
        nextDistribution: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      };
    } catch (error) {
      console.error('Yield Distribution Error:', error);
      throw error;
    }
  }

  async withdrawYield(user, propertyId) {
    try {
      const property = await Property.findById(propertyId);
      if (!property) throw new Error('Property not found');

      // Get pending yield from smart contract
      const pendingYield = await blockchain.calculatePendingYield(
        property.contractAddress,
        user.walletAddress
      );

      if (pendingYield.lte(0)) {
        throw new Error('No yield available for withdrawal');
      }

      // Call smart contract to withdraw yield
      const tx = await blockchain.withdrawYield(property.contractAddress);
      const receipt = await tx.wait();

      // Get withdrawn amount from event logs
      const withdrawnAmount = ethers.formatEther(receipt.logs[0].args.amount);

      // Update user's yield record in MongoDB
      const yieldRecord = user.yieldHistory.find(
        y => y.property.toString() === propertyId &&
        y.timestamp > user.lastYieldPaid
      );

      if (yieldRecord) {
        yieldRecord.withdrawn = true;
        yieldRecord.withdrawnAt = new Date();
      }

      await user.save();

      return {
        propertyId,
        withdrawnAmount,
        withdrawalDate: new Date(),
        remainingYield: user.yieldEarned - withdrawnAmount
      };
    } catch (error) {
      console.error('Yield Withdrawal Error:', error);
      throw error;
    }
  }
}

module.exports = new YieldService();
