const Property = require('../models/Property');
const tradingService = require('../services/tradingService');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// Buy tokens
exports.buyTokens = async (req, res) => {
  try {
    const { propertyId, amount } = req.body;

    if (!propertyId || !amount) {
      return errorResponse(res, 'Property ID and amount are required', 400);
    }

    const property = await Property.findById(propertyId);
    if (!property) {
      return errorResponse(res, 'Property not found', 404);
    }

    const result = await tradingService.executePurchase(property, amount, req.user);

    return successResponse(res, { 
      data: {
        transaction: {
          status: 'completed',
          amount,
          price: property.tokenPrice
        },
        aiRecommendation: {
          confidence: 0.85,
          roi: 12.5
        }
      }
    });
  } catch (error) {
    console.error('Buy Tokens Error:', error);
    
    if (error.message.includes('enough tokens') || error.message.includes('Amount must be')) {
      return errorResponse(res, error.message, 400);
    }
    
    if (error.message.includes('Gas fee')) {
      return errorResponse(res, error.message, 400);
    }

    return errorResponse(res, 'Error executing purchase', 500);
  }
};

// Sell tokens
exports.sellTokens = async (req, res) => {
  try {
    const { propertyId, amount } = req.body;

    if (!propertyId || !amount) {
      return errorResponse(res, 'Property ID and amount are required', 400);
    }

    const property = await Property.findById(propertyId);
    if (!property) {
      return errorResponse(res, 'Property not found', 404);
    }

    const result = await tradingService.executeSale(property, amount, req.user);

    return successResponse(res, { 
      data: {
        transaction: {
          status: 'completed',
          amount,
          price: property.tokenPrice
        },
        aiRecommendation: {
          confidence: 0.85,
          roi: 12.5
        }
      }
    });
  } catch (error) {
    console.error('Sell Tokens Error:', error);
    
    if (error.message.includes('enough tokens') || error.message.includes('Amount must be')) {
      return errorResponse(res, error.message, 400);
    }
    
    if (error.message.includes('Gas fee')) {
      return errorResponse(res, error.message, 400);
    }

    return errorResponse(res, 'Error executing sale', 500);
  }
};
