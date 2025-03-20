// Setup mocks for all services
const { mockBlockchain, mockAI, mockTradingService, mockPortfolioService, mockYieldService } = require('./mocks/mockServices');

// Force debugging on all mocks for better tracing
Object.keys(mockBlockchain).forEach(key => {
  if (typeof mockBlockchain[key] === 'function') {
    const original = mockBlockchain[key];
    mockBlockchain[key] = jest.fn().mockImplementation((...args) => {
      console.log(`Mock blockchain.${key} called with:`, JSON.stringify(args));
      return original(...args);
    });
  }
});

Object.keys(mockAI).forEach(key => {
  if (typeof mockAI[key] === 'function') {
    const original = mockAI[key];
    mockAI[key] = jest.fn().mockImplementation((...args) => {
      console.log(`Mock AI.${key} called with:`, JSON.stringify(args));
      return original(...args);
    });
  }
});

// Direct mock overrides - this is more reliable than jest.mock
// Blockchain service
const blockchainModule = require('../config/blockchain');
Object.keys(mockBlockchain).forEach(key => {
  if (typeof mockBlockchain[key] === 'function') {
    blockchainModule[key] = mockBlockchain[key];
  }
});

// Market prediction service
const marketPredictionModule = require('../services/marketPrediction');
Object.keys(mockAI).forEach(key => {
  if (typeof mockAI[key] === 'function') {
    marketPredictionModule[key] = mockAI[key];
  }
});

// Trading service
const tradingServiceModule = require('../services/tradingService');
Object.keys(mockTradingService).forEach(key => {
  if (typeof tradingServiceModule[key] === 'function' && typeof mockTradingService[key] === 'function') {
    tradingServiceModule[key] = mockTradingService[key];
  }
});

// Portfolio service
const portfolioServiceModule = require('../services/portfolioService');
Object.keys(mockPortfolioService).forEach(key => {
  if (typeof portfolioServiceModule[key] === 'function' && typeof mockPortfolioService[key] === 'function') {
    portfolioServiceModule[key] = mockPortfolioService[key];
  }
});

// Yield service
const yieldServiceModule = require('../services/yieldService');
Object.keys(mockYieldService).forEach(key => {
  if (typeof yieldServiceModule[key] === 'function' && typeof mockYieldService[key] === 'function') {
    yieldServiceModule[key] = mockYieldService[key];
  }
});

// Export mocks for convenience
module.exports = {
  mockBlockchain,
  mockAI,
  mockTradingService,
  mockPortfolioService,
  mockYieldService
};
