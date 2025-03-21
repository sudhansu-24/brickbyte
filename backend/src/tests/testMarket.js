const request = require('supertest');
const app = require('../index');
const Property = require('../models/Property');
const User = require('../models/User');

// Import mocks setup
require('./setupMocks');

describe('Market Insights Tests', () => {
  let authToken;
  let propertyId;

  beforeAll(async () => {
    // Create test user
    const user = await User.create({
      name: 'Market User',
      email: 'market@example.com',
      password: 'password123',
      walletAddress: '0x1234567890abcdef'
    });
    
    // Login to get auth token
    const loginResponse = await request(app)
      .post('/api/users/login')
      .send({ email: 'market@example.com', password: 'password123' });
    
    authToken = loginResponse.body.data.token;

    // Create test property
    const property = await Property.create({
      name: 'Market Test Property',
      location: 'New York',
      totalTokens: 1000,
      tokenPrice: 0.1,
      rentalIncome: 1000,
      owner: user.walletAddress,
      tokensAvailable: 1000,
      contractAddress: '0xabcdef1234567890'
    });
    propertyId = property._id;
  });

  it('should return AI-predicted market insights', async () => {
    const res = await request(app)
      .get('/api/market/insights')
      .set('Authorization', `Bearer ${authToken}`)
      .query({ propertyId });

    expect(res.status).toBe(200);
    expect(res.body.data.predictedPrice).toBeGreaterThan(0);
    expect(res.body.data.marketTrend).toBeDefined();
    expect(res.body.data.confidence).toBeGreaterThan(0);
    expect(res.body.data.responseTime).toBeLessThan(500); // Less than 500ms
  });

  it('should adjust token price based on AI prediction', async () => {
    const res = await request(app)
      .post('/api/market/adjust-price')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        propertyId,
        newPrice: 0.12
      });

    expect(res.status).toBe(200);
    expect(res.body.data.tokenPrice).toBe(0.12);
    expect(res.body.data.adjustmentReason).toBeDefined();
    expect(res.body.data.aiConfidence).toBeGreaterThan(0);
  });

  it('should get market demand analysis', async () => {
    const res = await request(app)
      .get('/api/market/demand')
      .set('Authorization', `Bearer ${authToken}`)
      .query({ propertyId });

    expect(res.status).toBe(200);
    expect(res.body.data.demandScore).toBeDefined();
    expect(res.body.data.buyPressure).toBeDefined();
    expect(res.body.data.sellPressure).toBeDefined();
    expect(res.body.data.predictionTime).toBeLessThan(300); // Less than 300ms
  });

  it('should analyze market liquidity', async () => {
    const res = await request(app)
      .get('/api/market/liquidity')
      .set('Authorization', `Bearer ${authToken}`)
      .query({ propertyId });

    expect(res.status).toBe(200);
    expect(res.body.data.liquidityScore).toBeDefined();
    expect(res.body.data.averageDailyVolume).toBeDefined();
    expect(res.body.data.priceImpact).toBeDefined();
  });

  it('should handle AI model failures gracefully', async () => {
    // Temporarily break AI model
    const originalPredict = MarketPrediction.predictPrice;
    MarketPrediction.predictPrice = () => {
      throw new Error('AI model failure');
    };

    const res = await request(app)
      .get('/api/market/insights')
      .set('Authorization', `Bearer ${authToken}`)
      .query({ propertyId });

    expect(res.status).toBe(200);
    expect(res.body.data.fallbackPrice).toBeDefined();
    expect(res.body.data.usingFallback).toBe(true);

    // Restore AI model
    MarketPrediction.predictPrice = originalPredict;
  });

  it('should optimize gas usage for price updates', async () => {
    const res = await request(app)
      .post('/api/market/batch-update')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        propertyIds: [propertyId],
        maxGasPrice: 50 // gwei
      });

    expect(res.status).toBe(200);
    expect(res.body.data.gasUsed).toBeLessThan(0.005); // Less than 0.005 ETH
    expect(res.body.data.updatedProperties).toBe(1);
  });

  it('should validate price adjustments against market cap', async () => {
    const res = await request(app)
      .post('/api/market/adjust-price')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        propertyId,
        newPrice: 1000 // Unreasonably high price
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('market cap');
  });
});
