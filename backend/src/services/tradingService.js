const ethers = require('ethers');
const marketPrediction = require('./marketPrediction');
const blockchainService = require('../config/blockchain');
const Property = require('../models/Property');

class TradingService {
  constructor() {
    this.blockchainService = blockchainService;
  }

  async validatePurchase(property, amount, user) {
    if (amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }

    if (amount > property.tokensAvailable) {
      throw new Error('Not enough tokens available');
    }

    // Get AI prediction for price validation
    const prediction = await marketPrediction.getPrediction({
      location: property.location,
      historicalPrices: [property.tokenPrice],
      transactionVolume: property.totalTokens - property.tokensAvailable,
      rentalYield: (property.rentalIncome * 12) / (property.tokenPrice * property.totalTokens) * 100,
      marketDemand: 8.5 // Mock demand score
    });

    // Calculate total cost with AI-adjusted price
    const totalCost = (prediction.predictedPrice * amount).toFixed(18);
    
    // In a real app, check user's wallet balance here
    // For now, we'll assume they have enough balance
    
    return {
      prediction,
      totalCost: ethers.parseEther(totalCost)
    };
  }

  async validateSale(property, amount, user) {
    // Get user's token balance
    const balance = await this.blockchainService.getTokenBalance(
      property.contractAddress,
      user.walletAddress
    );

    if (amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }

    if (amount > parseFloat(balance)) {
      throw new Error('Not enough tokens owned');
    }

    // Get AI prediction for price validation
    const prediction = await marketPrediction.getPrediction({
      location: property.location,
      historicalPrices: [property.tokenPrice],
      transactionVolume: property.totalTokens - property.tokensAvailable,
      rentalYield: (property.rentalIncome * 12) / (property.tokenPrice * property.totalTokens) * 100,
      marketDemand: 8.5
    });

    return {
      prediction,
      totalValue: ethers.parseEther((prediction.predictedPrice * amount).toString())
    };
  }

  async executePurchase(property, amount, user) {
    try {
      const { prediction, totalCost } = await this.validatePurchase(property, amount, user);

      // Execute purchase on blockchain
      await this.blockchainService.buyTokens(
        property.contractAddress,
        amount,
        totalCost
      );

      // Update property token availability
      property.tokensAvailable -= amount;
      
      // Adjust token price based on AI prediction if confidence is high
      if (prediction.confidence > 0.7) {
        property.tokenPrice = prediction.predictedPrice;
      }

      await property.save();

      // Get updated balance
      const newBalance = await this.blockchainService.getTokenBalance(
        property.contractAddress,
        user.walletAddress
      );

      return {
        transaction: {
          amount,
          price: prediction.predictedPrice,
          status: 'completed'
        },
        newPrice: prediction.predictedPrice,
        aiRecommendation: {
          confidence: prediction.confidence,
          roi: prediction.roi
        }
      };
    } catch (error) {
      if (error.message.includes('gas')) {
        throw new Error('Gas fee too high');
      }
      throw error;
    }
  }

  async executeSale(property, amount, user) {
    try {
      const { prediction, totalValue } = await this.validateSale(property, amount, user);

      // Execute sale on blockchain
      await this.blockchainService.sellTokens(
        property.contractAddress,
        amount,
        user.walletAddress
      );

      // Update property token availability
      property.tokensAvailable += amount;
      
      // Adjust token price based on AI prediction if confidence is high
      if (prediction.confidence > 0.7) {
        property.tokenPrice = prediction.predictedPrice;
      }

      await property.save();

      // Get updated balance
      const newBalance = await this.blockchainService.getTokenBalance(
        property.contractAddress,
        user.walletAddress
      );

      return {
        transaction: {
          amount,
          price: prediction.predictedPrice,
          status: 'completed'
        },
        newPrice: prediction.predictedPrice,
        aiRecommendation: {
          confidence: prediction.confidence,
          roi: prediction.roi
        }
      };
    } catch (error) {
      if (error.message.includes('gas')) {
        throw new Error('Gas fee too high');
      }
      throw error;
    }
  }
}

module.exports = new TradingService();
