const marketPrediction = require('../services/marketPrediction');
const Property = require('../models/Property');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// Get market insights for a property
exports.getMarketInsights = async (req, res) => {
  try {
    const { propertyId } = req.params;
    
    // Get property data
    const property = await Property.findById(propertyId);
    if (!property) {
      return errorResponse(res, 'Property not found', 404);
    }

    // Get historical data (last 30 days)
    const historicalPrices = await marketPrediction.generateMockData(propertyId);
    const prices = historicalPrices.map(h => h.price);

    // Prepare input for AI model
    const input = {
      location: property.location,
      historicalPrices: prices,
      transactionVolume: historicalPrices[historicalPrices.length - 1].volume,
      rentalYield: (property.rentalIncome * 12) / (property.tokenPrice * property.totalTokens) * 100,
      marketDemand: 8.5 // Mock demand score (1-10)
    };

    // Train model if needed (in production, this would be done separately)
    await marketPrediction.trainModel(propertyId);

    // Get prediction
    const prediction = await marketPrediction.getPrediction(input);

    // If recommendation is "Buy" and confidence is high, adjust token price
    if (prediction.recommendation === 'Buy' && prediction.confidence > 0.7) {
      const newPrice = await marketPrediction.adjustTokenPrice(
        property.tokenPrice,
        input.marketDemand,
        input.rentalYield
      );
      
      // Update property token price
      property.tokenPrice = newPrice;
      await property.save();
    }

    return successResponse(res, {
      propertyId: property._id,
      currentPrice: property.tokenPrice,
      prediction,
      marketMetrics: {
        rentalYield: input.rentalYield,
        marketDemand: input.marketDemand,
        liquidityScore: historicalPrices[historicalPrices.length - 1].volume / property.totalTokens,
        historicalPerformance: historicalPrices
      }
    });
  } catch (error) {
    console.error('AI Prediction Error:', error);
    return errorResponse(res, 'Error generating market insights', 500);
  }
};
