// Mock services for testing
const mockBlockchain = {
  deployContract: jest.fn().mockImplementation((name, symbol, totalTokens, tokenPrice) => {
    console.log(`Mock deployContract called with: ${name}, ${symbol}, ${totalTokens}, ${tokenPrice}`);
    return Promise.resolve('0x1234567890abcdef');
  }),
  mintTokens: jest.fn().mockImplementation((contractAddress, amount) => {
    console.log(`Mock mintTokens called with: ${contractAddress}, ${amount}`);
    return Promise.resolve({
      hash: '0xabcdef1234567890',
      status: 'success'
    });
  }),
  transferTokens: jest.fn().mockImplementation((contractAddress, to, amount) => {
    console.log(`Mock transferTokens called with: ${contractAddress}, ${to}, ${amount}`);
    return Promise.resolve({
      hash: '0xabcdef1234567890',
      status: 'success'
    });
  }),
  getBalance: jest.fn().mockImplementation((address) => {
    console.log(`Mock getBalance called with: ${address}`);
    return Promise.resolve('1000');
  }),
  getTokenBalance: jest.fn().mockImplementation((contractAddress, address) => {
    console.log(`Mock getTokenBalance called with: ${contractAddress}, ${address}`);
    return Promise.resolve(500);
  }),
  estimateGas: jest.fn().mockImplementation(() => {
    return Promise.resolve('50000');
  }),
  getTokenPrice: jest.fn().mockImplementation((contractAddress) => {
    console.log(`Mock getTokenPrice called with: ${contractAddress}`);
    return Promise.resolve(0.12);
  }),
  buyTokens: jest.fn().mockImplementation((contractAddress, amount, walletAddress) => {
    console.log(`Mock buyTokens called with: ${contractAddress}, ${amount}, ${walletAddress || 'no wallet'}`);
    return Promise.resolve({
      hash: '0xabcdef1234567890',
      newBalance: 100,
      status: 'success'
    });
  }),
  sellTokens: jest.fn().mockImplementation((contractAddress, amount) => {
    console.log(`Mock sellTokens called with: ${contractAddress}, ${amount}`);
    return Promise.resolve({
      hash: '0xabcdef1234567890',
      newBalance: 50,
      status: 'success'
    });
  }),
  getMarketStats: jest.fn().mockImplementation((contractAddress) => {
    console.log(`Mock getMarketStats called with: ${contractAddress}`);
    return Promise.resolve({
      volume: 10000,
      marketCap: 5000000,
      holders: 120
    });
  })
};

const mockAI = {
  predictPrice: jest.fn().mockImplementation((propertyData) => {
    console.log(`Mock predictPrice called with:`, JSON.stringify(propertyData));
    return Promise.resolve({
      predictedPrice: 0.15,
      confidence: 0.85,
      recommendation: 'Buy',
      marketDemand: 8.5
    });
  }),
  getPrediction: jest.fn().mockImplementation((propertyId) => {
    console.log(`Mock getPrediction called with: ${propertyId}`);
    return Promise.resolve({
      predictedPrice: 0.15,
      confidence: 0.85,
      recommendation: 'Buy',
      marketDemand: 8.5
    });
  }),
  aiSuggestStrategy: jest.fn().mockImplementation((userData, marketData) => {
    console.log(`Mock aiSuggestStrategy called with:`, JSON.stringify({ userData, marketData }));
    return Promise.resolve({
      action: 'BUY',
      amount: 50,
      reason: 'Market is trending upward'
    });
  }),
  calculateROI: jest.fn().mockImplementation((propertyData) => {
    console.log(`Mock calculateROI called with:`, JSON.stringify(propertyData));
    return Promise.resolve({
      roi: 12.5,
      confidence: 0.9
    });
  }),
  getMarketDemand: jest.fn().mockImplementation((location) => {
    console.log(`Mock getMarketDemand called with: ${location}`);
    return Promise.resolve({
      demandScore: 0.75,
      buyPressure: 0.8,
      sellPressure: 0.2
    });
  }),
  optimizePortfolio: jest.fn().mockResolvedValue({
    suggestedTrades: [
      { action: 'buy', amount: 100, propertyId: '123' }
    ],
    expectedReturn: 15.5
  }),
  generateMockData: jest.fn().mockResolvedValue([
    { price: 0.10, volume: 500, timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    { price: 0.11, volume: 600, timestamp: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000) },
    { price: 0.12, volume: 700, timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
    { price: 0.14, volume: 800, timestamp: new Date() }
  ]),
  trainModel: jest.fn().mockResolvedValue(true),
  adjustTokenPrice: jest.fn().mockResolvedValue(0.16)
};

// Mock Trading Service
const mockTradingService = {
  validatePurchase: jest.fn().mockResolvedValue({
    prediction: { predictedPrice: 0.15, confidence: 0.85 },
    totalCost: '15000000000000000'
  }),
  validateSale: jest.fn().mockResolvedValue({
    prediction: { predictedPrice: 0.15, confidence: 0.85 },
    totalAmount: '15000000000000000'
  }),
  executePurchase: jest.fn().mockResolvedValue({
    success: true,
    transaction: {
      id: '0xabc123',
      amount: 100,
      status: 'completed'
    }
  }),
  executeSale: jest.fn().mockResolvedValue({
    success: true,
    transaction: {
      id: '0xdef456',
      amount: 50,
      status: 'completed'
    }
  })
};

// Mock Portfolio Service
const mockPortfolioService = {
  calculatePortfolioValue: jest.fn().mockResolvedValue({
    totalValue: 5000,
    rentalIncome: 300,
    holdings: [{
      property: { _id: '123', name: 'Test Property' },
      amount: 100,
      value: 1500,
      monthlyRental: 50
    }],
    suggestion: ['HOLD']
  }),
  getPortfolio: jest.fn().mockResolvedValue({
    totalValue: 5000,
    rentalIncome: 300,
    holdings: [{
      property: { _id: '123', name: 'Test Property' },
      amount: 100,
      value: 1500,
      monthlyRental: 50
    }],
    recommendation: 'HOLD'
  })
};

// Mock Yield Service
const mockYieldService = {
  calculateRentalYield: jest.fn().mockResolvedValue({
    monthlyYield: 0.0025,
    annualYieldRate: 3.0,
    confidence: 0.85,
    marketDemand: 8.5
  }),
  distributeYield: jest.fn().mockResolvedValue({
    totalYieldDistributed: 500,
    distributionDetails: {
      propertyId: '123',
      timestamp: new Date(),
      amount: 500
    }
  }),
  withdrawYield: jest.fn().mockResolvedValue({
    userYield: 150,
    withdrawalDetails: {
      userId: '456',
      timestamp: new Date(),
      amount: 150
    }
  })
};

// Test helper functions
const testBlockchainMock = () => {
  return mockBlockchain.deployContract('Test', 'TST', 1000, 0.1)
    .then(result => {
      console.log('Test blockchain mock result:', result);
      return result;
    });
};

const testAIMock = () => {
  return mockAI.predictPrice({ location: 'Test' })
    .then(result => {
      console.log('Test AI mock result:', result);
      return result;
    });
};

module.exports = {
  mockBlockchain,
  mockAI,
  mockTradingService,
  mockPortfolioService,
  mockYieldService
};
