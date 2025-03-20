const tf = require('@tensorflow/tfjs-node');
const Property = require('../models/Property');
const moment = require('moment');

class MarketPredictionService {
  constructor() {
    this.model = null;
    this.initialized = false;
    this.initializeModel();
  }

  async initializeModel() {
    try {
      this.model = tf.sequential();
      this.model.add(tf.layers.dense({ units: 64, inputShape: [5], activation: 'relu' }));
      this.model.add(tf.layers.dense({ units: 32, activation: 'relu' }));
      this.model.add(tf.layers.dense({ units: 1 }));

      this.model.compile({
        optimizer: 'adam',
        loss: 'meanSquaredError',
        metrics: ['mse']
      });

      this.initialized = true;
    } catch (error) {
      console.error('Model initialization error:', error);
      throw new Error('Failed to initialize AI model');
    }
  }

  async predictPrice(propertyData) {
    try {
      if (!this.initialized) {
        throw new Error('AI model not initialized');
      }

      // Normalize input data
      const input = tf.tensor2d([[
        this.normalizeLocation(propertyData.location),
        this.normalizePrice(propertyData.historicalPrices[0] || 0),
        this.normalizeVolume(propertyData.transactionVolume),
        propertyData.rentalYield / 100,
        propertyData.marketDemand
      ]]);

      const prediction = this.model.predict(input);
      const price = prediction.dataSync()[0];
      const confidence = 0.85; // Mock confidence score
      
      input.dispose();
      prediction.dispose();

      return { price, confidence };

      return this.denormalizePrice(predictedPrice);
    } catch (error) {
      console.error('Price prediction error:', error);
      // Fallback to last known price
      return propertyData.historicalPrices[propertyData.historicalPrices.length - 1];
    }
  }

  async calculateROI(property) {
    try {
      const rentalYield = (property.rentalIncome * 12) / (property.tokenPrice * property.totalTokens) * 100;
      const predictedPrice = await this.predictPrice({
        location: property.location,
        historicalPrices: property.historicalPrices.map(h => h.price),
        transactionVolume: property.totalTokens - property.tokensAvailable,
        rentalYield,
        marketDemand: property.marketDemandScore / 10
      });

      const potentialGain = ((predictedPrice - property.tokenPrice) / property.tokenPrice) * 100;
      return rentalYield + potentialGain;
    } catch (error) {
      console.error('ROI calculation error:', error);
      return null;
    }
  }

  calculateMarketDemand(property) {
    try {
      const factors = {
        transactionVolume: this.normalizeVolume(property.totalTokens - property.tokensAvailable) * 30,
        priceGrowth: this.calculatePriceGrowth(property.historicalPrices) * 25,
        stakingRatio: (property.stakedTokens / property.totalTokens) * 25,
        rentalYield: (property.rentalIncome * 12 / (property.tokenPrice * property.totalTokens)) * 20
      };

      let score = Object.values(factors).reduce((sum, value) => sum + value, 0);
      return Math.min(Math.max(Math.round(score), 0), 100);
    } catch (error) {
      console.error('Market demand calculation error:', error);
      return 50; // Default neutral score
    }
  }

  async getMarketDemand(property) {
    try {
      // Mock market demand calculation
      return {
        demandScore: 0.75,
        buyPressure: 0.8,
        sellPressure: 0.2,
        confidence: 0.9
      };
    } catch (error) {
      console.error('Market demand calculation error:', error);
      throw error;
    }
  }

  async adjustTokenPrice(property, marketConditions) {
    try {
      const currentPrice = property.tokenPrice;
      let adjustment = 0;

      // Transaction volume impact
      if (marketConditions.volumeIncrease) {
        adjustment += 0.005; // +0.5%
      }

      // Staking activity impact
      if (marketConditions.stakingIncrease) {
        adjustment += 0.002; // +0.2%
      }

      // Supply impact
      if (marketConditions.supplyIncrease) {
        adjustment -= 0.003; // -0.3%
      }

      // Market demand impact
      const demandImpact = (property.marketDemandScore - 50) / 1000; // ±0.05% per point from neutral
      adjustment += demandImpact;

      // Calculate new price
      const newPrice = currentPrice * (1 + adjustment);

      // Validate against market cap
      const marketCap = property.totalTokens * newPrice;
      if (marketCap > property.maxMarketCap) {
        throw new Error('Market cap exceeded');
      }

      return {
        price: newPrice,
        adjustment: adjustment * 100, // Convert to percentage
        reason: this.getAdjustmentReason(adjustment)
      };
    } catch (error) {
      console.error('Price adjustment error:', error);
      throw error;
    }
  }

  // Helper methods
  normalizeLocation(location) {
    // Simple location score based on predefined tiers
    const locationTiers = {
      'New York': 1.0,
      'California': 0.9,
      'Texas': 0.8,
      // Add more locations as needed
    };
    return locationTiers[location] || 0.5;
  }

  normalizePrice(price) {
    return price / 1000; // Assuming max price is 1000
  }

  denormalizePrice(normalizedPrice) {
    return normalizedPrice * 1000;
  }

  normalizeVolume(volume) {
    return Math.min(volume / 10000, 1); // Assuming max volume is 10000
  }

  calculatePriceGrowth(historicalPrices) {
    if (historicalPrices.length < 2) return 0;
    const prices = historicalPrices.map(h => h.price);
    const oldestPrice = prices[0];
    const newestPrice = prices[prices.length - 1];
    return (newestPrice - oldestPrice) / oldestPrice;
  }

  getAdjustmentReason(adjustment) {
    if (adjustment > 0) {
      return 'Positive market sentiment and increased demand';
    } else if (adjustment < 0) {
      return 'Market correction due to increased supply';
    }
    return 'Market stability maintained';
  }
}

module.exports = new MarketPredictionService();
