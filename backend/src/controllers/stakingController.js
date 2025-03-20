const User = require('../models/User');
const stakingService = require('../services/stakingService');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// Stake tokens
exports.stakeTokens = async (req, res) => {
  try {
    const { propertyId, amount } = req.body;
    
    if (!propertyId || !amount || amount <= 0) {
      return errorResponse(res, 'Invalid staking parameters', 400);
    }

    const user = await User.findById(req.user.id).populate('tokensHeld.property');
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    const result = await stakingService.stakeTokens(user, propertyId, amount);
    return successResponse(res, result);
  } catch (error) {
    console.error('Stake Tokens Error:', error);
    
    if (error.message.includes('Insufficient tokens')) {
      return errorResponse(res, 'Insufficient tokens to stake', 400);
    }
    
    if (error.message.includes('Gas fee')) {
      return errorResponse(res, 'Gas fee too high', 400);
    }
    
    if (error.message.includes('limit reached')) {
      return errorResponse(res, 'Maximum staking limit reached', 400);
    }

    return errorResponse(res, 'Error staking tokens', 500);
  }
};

// Unstake tokens
exports.unstakeTokens = async (req, res) => {
  try {
    const { propertyId, amount } = req.body;
    
    if (!propertyId || !amount || amount <= 0) {
      return errorResponse(res, 'Invalid unstaking parameters', 400);
    }

    const user = await User.findById(req.user.id).populate('stakedTokens.property');
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    const result = await stakingService.unstakeTokens(user, propertyId, amount);
    return successResponse(res, result);
  } catch (error) {
    console.error('Unstake Tokens Error:', error);
    
    if (error.message.includes('Insufficient staked')) {
      return errorResponse(res, 'Insufficient staked balance', 400);
    }
    
    if (error.message.includes('Gas fee')) {
      return errorResponse(res, 'Gas fee too high', 400);
    }

    return errorResponse(res, 'Error unstaking tokens', 500);
  }
};

// Claim staking rewards
exports.claimRewards = async (req, res) => {
  try {
    const { propertyId } = req.body;
    
    if (!propertyId) {
      return errorResponse(res, 'Property ID is required', 400);
    }

    const user = await User.findById(req.user.id).populate('stakedTokens.property');
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    const result = await stakingService.claimRewards(user, propertyId);
    return successResponse(res, result);
  } catch (error) {
    console.error('Claim Rewards Error:', error);
    
    if (error.message.includes('No staked balance')) {
      return errorResponse(res, 'No staked balance to claim rewards from', 400);
    }
    
    if (error.message.includes('Gas fee')) {
      return errorResponse(res, 'Gas fee too high', 400);
    }

    return errorResponse(res, 'Error claiming rewards', 500);
  }
};

// Vote on governance proposal
exports.vote = async (req, res) => {
  try {
    const { proposalId, vote } = req.body;
    
    if (!proposalId || !vote || !['YES', 'NO'].includes(vote)) {
      return errorResponse(res, 'Invalid voting parameters', 400);
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    const result = await stakingService.vote(user, proposalId, vote);
    return successResponse(res, result);
  } catch (error) {
    console.error('Vote Error:', error);
    
    if (error.message.includes('No governance votes')) {
      return errorResponse(res, 'No governance votes available', 400);
    }
    
    if (error.message.includes('Already voted')) {
      return errorResponse(res, 'Already voted on this proposal', 400);
    }

    return errorResponse(res, 'Error submitting vote', 500);
  }
};

// Get staking APY
exports.getStakingAPY = async (req, res) => {
  try {
    const { propertyId } = req.params;
    
    if (!propertyId) {
      return errorResponse(res, 'Property ID is required', 400);
    }

    const result = await stakingService.calculateStakingAPY(propertyId);
    return successResponse(res, result);
  } catch (error) {
    console.error('Get APY Error:', error);
    return errorResponse(res, 'Error fetching staking APY', 500);
  }
};
