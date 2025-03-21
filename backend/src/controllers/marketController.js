const Property = require('../models/Property');
const marketPrediction = require('../services/marketPrediction');
const blockchain = require('../config/blockchain');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// Helper methods
const hasVolumeIncreased = (property) => {
  const recentTransactions = property.priceHistory?.slice(-5) || [];
  if (recentTransactions.length < 2) return false;
  
  const avgVolumeBefore = recentTransactions.slice(0, -2).reduce((sum, tx) => sum + tx.volume, 0) / (recentTransactions.length - 2);
  const avgVolumeRecent = recentTransactions.slice(-2).reduce((sum, tx) => sum + tx.volume, 0) / 2;
  
  return avgVolumeRecent > avgVolumeBefore;
};

const hasStakingIncreased = (property) => {
  const stakingHistory = property.stakingHistory?.slice(-5) || [];
  if (stakingHistory.length < 2) return false;
  return stakingHistory[stakingHistory.length - 1].amount > stakingHistory[stakingHistory.length - 2].amount;
};

const hasSupplyIncreased = (property) => {
  return property.totalTokens > property.initialTokenSupply;
};

const generateRecommendation = (property, predictedPrice, roi) => {
  if (predictedPrice > property.tokenPrice * 1.05 && roi > 10) {
    return 'Buy';
  } else if (predictedPrice < property.tokenPrice * 0.95 || roi < 5) {
    return 'Sell';
  }
  return 'Hold';
};

exports.getMarketInsights = async (req, res) => {
  try {
    const { propertyId } = req.query;
    
    const property = await Property.findById(propertyId);
    if (!property) {
      return errorResponse(res, 'Property not found', 404);
    }

    // Get AI predictions
    const prediction = await marketPrediction.predictPrice({
      location: property.location,
      historicalPrices: property.historicalPrices || [],
      transactionVolume: property.totalTokens - property.tokensAvailable,
      rentalYield: (property.rentalIncome * 12) / (property.tokenPrice * property.totalTokens) * 100,
      marketDemand: property.marketDemandScore || 0
    });

    const marketTrend = await marketPrediction.getMarketDemand(property);
    const recommendation = generateRecommendation(property, prediction.price, prediction.roi);

    return successResponse(res, {
      predictedPrice: prediction.price,
      confidence: prediction.confidence,
      marketTrend,
      recommendation,
      responseTime: Date.now() - req._startTime
    });
  } catch (error) {
    console.error('Market Insights Error:', error);
    if (error.message.includes('AI model')) {
      return errorResponse(res, 'Prediction failure', 500);
    }
    return errorResponse(res, 'Error fetching market insights', 500);
  }
};

exports.adjustTokenPrice = async (req, res) => {
  try {
    const { propertyId, newPrice } = req.body;
    const property = await Property.findById(propertyId);
    if (!property) {
      return errorResponse(res, 'Property not found', 404);
    }

    // Get market conditions
    const marketConditions = {
      volumeIncrease: hasVolumeIncreased(property),
      stakingIncrease: hasStakingIncreased(property),
      supplyIncrease: hasSupplyIncreased(property)
    };

    // Calculate new price using AI
    const adjustment = await marketPrediction.adjustTokenPrice(property, marketConditions);

    // Update price on blockchain
    const tx = await blockchain.setTokenPrice(
      property.contractAddress,
      adjustment.price
    );
    await tx.wait();

    // Update price in MongoDB
    property.tokenPrice = newPrice || adjustment.price;
    property.lastPriceUpdate = new Date();
    property.priceHistory.push({
      price: adjustment.price,
      reason: adjustment.reason,
      timestamp: new Date()
    });
    property.historicalPrices.push({
      price: adjustment.price,
      timestamp: new Date()
    });

    await property.save();

    return successResponse(res, {
      tokenPrice: newPrice || adjustment.price,
      adjustmentReason: adjustment.reason,
      aiConfidence: adjustment.confidence || 0.8,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Price Adjustment Error:', error);
    if (error.message.includes('Market cap exceeded')) {
      return errorResponse(res, 'Market cap exceeded', 400);
    }
    if (error.message.includes('Gas fee')) {
      return errorResponse(res, 'Gas fee too high', 400);
    }
    return errorResponse(res, 'Error adjusting token price', 500);
  }
};

exports.getMarketDemand = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const property = await Property.findById(propertyId);

    if (!property) {
      return errorResponse(res, 'Property not found', 404);
    }

    const demand = await marketPrediction.getMarketDemand(property);
    return successResponse(res, {
      data: {
        demandScore: demand.score || 50,
        buyPressure: demand.buyPressure || 0.6,
        sellPressure: demand.sellPressure || 0.4,
        predictionTime: Date.now() - req._startTime
      }
    });
  } catch (error) {
    console.error('Market Demand Error:', error);
    return errorResponse(res, error);
  }
};

exports.analyzeLiquidity = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const property = await Property.findById(propertyId);

    if (!property) {
      return errorResponse(res, 'Property not found', 404);
    }

    const liquidity = {
      tokenSupply: property.totalTokens,
      availableTokens: property.tokensAvailable,
      circulatingTokens: property.totalTokens - property.tokensAvailable,
      stakingRatio: property.stakedTokens / property.totalTokens,
      tradeVolume24h: await blockchain.get24hTradeVolume(property.contractAddress),
      liquidityScore: (property.totalTokens - property.tokensAvailable) / property.totalTokens
    };

    return successResponse(res, {
      data: {
        liquidityScore: liquidity.liquidityScore || 0.75,
        averageDailyVolume: liquidity.tradeVolume24h || 1000,
        priceImpact: 0.02 * (1 - liquidity.liquidityScore)
      }
    });
  } catch (error) {
    console.error('Liquidity Analysis Error:', error);
    return errorResponse(res, error);
  }
};
