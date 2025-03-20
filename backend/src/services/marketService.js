const Property = require('../models/Property');
const MarketPrediction = require('./marketPrediction');

class MarketService {
  async getMarketInsights(propertyId) {
    try {
      const property = await Property.findById(propertyId);
      if (!property) {
        throw new Error('Property not found');
      }

      // Get AI predictions
      const predictions = await MarketPrediction.predictPrice({
        location: property.location,
        historicalPrices: property.historicalPrices,
        transactionVolume: property.totalTokens - property.tokensAvailable,
        rentalYield: property.rentalYield,
        marketDemand: property.marketDemandScore
      });

      // Calculate ROI
      const roi = await MarketPrediction.calculateROI(property);

      // Get market demand score
      const marketDemand = MarketPrediction.calculateMarketDemand(property);

      return {
        currentPrice: property.tokenPrice,
        predictedPrice: predictions,
        roi,
        marketDemand,
        historicalPrices: property.historicalPrices,
        transactionVolume: property.totalTokens - property.tokensAvailable,
        stakingRatio: property.stakedTokens / property.totalTokens,
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('Market insights error:', error);
      throw error;
    }
  }

  async updateMarketConditions(propertyId) {
    try {
      const property = await Property.findById(propertyId);
      if (!property) {
        throw new Error('Property not found');
      }

      const marketConditions = {
        volumeIncrease: this.checkVolumeIncrease(property),
        stakingIncrease: this.checkStakingIncrease(property),
        supplyIncrease: this.checkSupplyIncrease(property)
      };

      const priceAdjustment = await MarketPrediction.adjustTokenPrice(property, marketConditions);

      // Update property with new price
      property.tokenPrice = priceAdjustment.price;
      property.historicalPrices.push({
        price: priceAdjustment.price,
        timestamp: new Date(),
        reason: priceAdjustment.reason
      });

      await property.save();

      return {
        newPrice: priceAdjustment.price,
        adjustment: priceAdjustment.adjustment,
        reason: priceAdjustment.reason
      };
    } catch (error) {
      console.error('Market conditions update error:', error);
      throw error;
    }
  }

  // Helper methods
  checkVolumeIncrease(property) {
    const recentTransactions = property.historicalPrices.slice(-2);
    if (recentTransactions.length < 2) return false;
    return recentTransactions[1].volume > recentTransactions[0].volume;
  }

  checkStakingIncrease(property) {
    return property.stakedTokens > property.previousStakedTokens;
  }

  checkSupplyIncrease(property) {
    return property.tokensAvailable > property.previousTokensAvailable;
  }
}

module.exports = new MarketService();
