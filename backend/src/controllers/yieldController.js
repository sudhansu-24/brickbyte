const User = require('../models/User');
const yieldService = require('../services/yieldService');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// Update rental income using AI prediction
exports.updateRentalIncome = async (req, res) => {
  try {
    const { propertyId } = req.body;
    
    if (!propertyId) {
      return errorResponse(res, 'Property ID is required', 400);
    }

    const result = await yieldService.updateRentalIncome(propertyId);
    return successResponse(res, { data: result });
  } catch (error) {
    console.error('Update Rental Income Error:', error);
    
    if (error.message.includes('Gas fee')) {
      return errorResponse(res, 'Gas fee too high', 400);
    }

    return errorResponse(res, 'Error updating rental income', 500);
  }
};

// Distribute yield to token holders
exports.distributeYield = async (req, res) => {
  try {
    const { propertyId } = req.body;
    
    if (!propertyId) {
      return errorResponse(res, 'Property ID is required', 400);
    }

    const result = await yieldService.distributeYield(propertyId);
    return successResponse(res, { data: result });
  } catch (error) {
    console.error('Distribute Yield Error:', error);
    
    if (error.message.includes('Gas fee')) {
      return errorResponse(res, 'Gas fee too high', 400);
    }
    
    if (error.message.includes('Too early')) {
      return errorResponse(res, 'Too early for next distribution', 400);
    }

    return errorResponse(res, 'Error distributing yield', 500);
  }
};

// Withdraw earned yield
exports.withdrawYield = async (req, res) => {
  try {
    const { propertyId } = req.body;
    
    if (!propertyId) {
      return errorResponse(res, 'Property ID is required', 400);
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    const result = await yieldService.withdrawYield(user, propertyId);
    return successResponse(res, { data: result });
  } catch (error) {
    console.error('Withdraw Yield Error:', error);
    
    if (error.message.includes('No yield available')) {
      return errorResponse(res, 'No yield available for withdrawal', 400);
    }
    
    if (error.message.includes('Gas fee')) {
      return errorResponse(res, 'Gas fee too high', 400);
    }

    return errorResponse(res, 'Error withdrawing yield', 500);
  }
};

// Get yield statistics
exports.getYieldStats = async (req, res) => {
  try {
    const { propertyId } = req.params;
    
    if (!propertyId) {
      return errorResponse(res, 'Property ID is required', 400);
    }

    const user = await User.findById(req.user.id)
      .populate('yieldHistory.property');
      
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    const propertyYields = user.yieldHistory.filter(
      y => y.property._id.toString() === propertyId
    );

    const monthlyYield = propertyYields.reduce((sum, y) => sum + y.amount, 0) / propertyYields.length || 0;
    
    const stats = {
      annualYield: monthlyYield * 12,
      monthlyYield: monthlyYield,
      nextDistribution: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    };

    return successResponse(res, { data: stats });
  } catch (error) {
    console.error('Get Yield Stats Error:', error);
    return errorResponse(res, 'Error fetching yield statistics', 500);
  }
};
