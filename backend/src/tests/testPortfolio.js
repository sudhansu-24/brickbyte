const request = require('supertest');
const app = require('../index');
const User = require('../models/User');
const Property = require('../models/Property');

describe('Portfolio Tests', () => {
  let authToken;
  let propertyIds = [];

  beforeAll(async () => {
    // Create test user
    const userRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Portfolio Owner',
        email: 'portfolio@example.com',
        password: 'password123',
        walletAddress: '0x1234567890abcdef'
      });
    authToken = userRes.body.token;

    // Create test properties
    for (let i = 0; i < 3; i++) {
      const propertyRes = await request(app)
        .post('/api/properties')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: `Test Property ${i + 1}`,
          location: 'Test Location',
          totalTokens: 1000,
          tokenPrice: 0.1 * (i + 1),
          rentalIncome: 100 * (i + 1)
        });
      propertyIds.push(propertyRes.body.data._id);

      // Buy tokens for each property
      await request(app)
        .post('/api/properties/buy')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          propertyId: propertyIds[i],
          amount: 100
        });
    }
  });

  it('should return correct portfolio details', async () => {
    const res = await request(app)
      .get('/api/portfolio')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.totalValue).toBeGreaterThan(0);
    expect(res.body.data.totalTokens).toBe(300); // 100 tokens each from 3 properties
    expect(res.body.data.properties.length).toBe(3);
    expect(res.body.data.roi).toBeDefined();
  });

  it('should return AI-based portfolio recommendations', async () => {
    const res = await request(app)
      .get('/api/portfolio/recommendations')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.recommendations)).toBe(true);
    expect(res.body.data.recommendations[0]).toHaveProperty('action');
    expect(res.body.data.recommendations[0]).toHaveProperty('confidence');
  });

  it('should calculate portfolio performance metrics', async () => {
    const res = await request(app)
      .get('/api/portfolio/performance')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.totalReturn).toBeDefined();
    expect(res.body.data.annualizedReturn).toBeDefined();
    expect(res.body.data.yieldReturn).toBeDefined();
    expect(res.body.data.capitalGains).toBeDefined();
  });

  it('should get portfolio diversification analysis', async () => {
    const res = await request(app)
      .get('/api/portfolio/diversification')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.locationDistribution).toBeDefined();
    expect(res.body.data.riskScore).toBeDefined();
    expect(res.body.data.diversificationScore).toBeGreaterThan(0);
  });

  it('should optimize portfolio based on AI suggestions', async () => {
    const res = await request(app)
      .post('/api/portfolio/optimize')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        riskTolerance: 'moderate',
        yieldPreference: 'high'
      });

    expect(res.status).toBe(200);
    expect(res.body.data.suggestedTrades).toBeDefined();
    expect(res.body.data.expectedReturn).toBeGreaterThan(0);
    expect(res.body.data.riskReduction).toBeDefined();
  });

  it('should track portfolio value history', async () => {
    const res = await request(app)
      .get('/api/portfolio/history')
      .set('Authorization', `Bearer ${authToken}`)
      .query({
        timeframe: '1month'
      });

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.history)).toBe(true);
    expect(res.body.data.history[0]).toHaveProperty('date');
    expect(res.body.data.history[0]).toHaveProperty('value');
  });
});
