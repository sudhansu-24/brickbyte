const request = require('supertest');
const app = require('../index');
const Property = require('../models/Property');
const User = require('../models/User');
const MarketPrediction = require('../services/marketPrediction');

describe('Trading Tests', () => {
  let authToken;
  let propertyId;
  let buyerToken;

  beforeAll(async () => {
    // Create seller
    const sellerRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Token Seller',
        email: 'seller@example.com',
        password: 'password123',
        walletAddress: '0x1234567890abcdef'
      });
    authToken = sellerRes.body.token;

    // Create buyer
    const buyerRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Token Buyer',
        email: 'buyer@example.com',
        password: 'password123',
        walletAddress: '0xabcdef1234567890'
      });
    buyerToken = buyerRes.body.token;

    // Create property
    const propertyRes = await request(app)
      .post('/api/properties')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Trade Test Property',
        location: 'New York',
        totalTokens: 1000,
        tokenPrice: 0.1,
        rentalIncome: 1000
      });
    propertyId = propertyRes.body.data._id;
  });

  it('should create a sell order', async () => {
    const res = await request(app)
      .post('/api/trade/sell')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        propertyId,
        amount: 100,
        price: 0.12
      });

    expect(res.status).toBe(200);
    expect(res.body.data.amount).toBe(100);
    expect(res.body.data.price).toBe(0.12);
    expect(res.body.data.status).toBe('active');
  });

  it('should list all active sell orders', async () => {
    const res = await request(app)
      .get('/api/trade/orders')
      .set('Authorization', `Bearer ${buyerToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('should execute buy order with AI price check', async () => {
    const res = await request(app)
      .post('/api/trade/buy')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({
        propertyId,
        amount: 50,
        maxPrice: 0.15
      });

    expect(res.status).toBe(200);
    expect(res.body.data.transaction).toBeDefined();
    expect(res.body.data.newPrice).toBeDefined();
    expect(res.body.data.aiRecommendation).toBeDefined();
  });

  it('should not execute buy order above max price', async () => {
    const res = await request(app)
      .post('/api/trade/buy')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({
        propertyId,
        amount: 50,
        maxPrice: 0.05 // Too low
      });

    expect(res.status).toBe(400);
  });

  it('should update token price based on AI prediction', async () => {
    const res = await request(app)
      .post('/api/trade/update-price')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        propertyId
      });

    expect(res.status).toBe(200);
    expect(res.body.data.newPrice).toBeDefined();
    expect(res.body.data.aiPrediction).toBeDefined();
    expect(res.body.data.confidence).toBeGreaterThan(0);
  });

  it('should handle gas fee estimation', async () => {
    const res = await request(app)
      .get('/api/trade/gas-estimate')
      .set('Authorization', `Bearer ${buyerToken}`)
      .query({
        propertyId,
        amount: 50
      });

    expect(res.status).toBe(200);
    expect(res.body.data.gasEstimate).toBeDefined();
    expect(res.body.data.gasEstimate).toBeLessThan(0.005); // Less than 0.005 ETH
  });
});
