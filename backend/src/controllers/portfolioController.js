const User = require('../models/User');
const portfolioService = require('../services/portfolioService');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// Get user's portfolio
exports.getPortfolio = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    const portfolio = await portfolioService.calculatePortfolioValue(user);
    return successResponse(res, portfolio);
  } catch (error) {
    console.error('Get Portfolio Error:', error);
    return errorResponse(res, 'Error fetching portfolio', 500);
  }
};

// Rebalance portfolio based on AI suggestions
exports.rebalancePortfolio = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    const result = await portfolioService.rebalancePortfolio(user);
    return successResponse(res, result);
  } catch (error) {
    console.error('Rebalance Portfolio Error:', error);
    
    if (error.message.includes('enough tokens')) {
      return errorResponse(res, 'Insufficient tokens for rebalancing', 400);
    }
    
    if (error.message.includes('Gas fee')) {
      return errorResponse(res, 'Gas fee too high for rebalancing', 400);
    }

    return errorResponse(res, 'Error rebalancing portfolio', 500);
  }
};

// Get historical performance
exports.getHistoricalPerformance = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    const performance = await portfolioService.getHistoricalPerformance(user);
    return successResponse(res, performance);
  } catch (error) {
    console.error('Historical Performance Error:', error);
    return errorResponse(res, 'Error fetching historical performance', 500);
  }
};
