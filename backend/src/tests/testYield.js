const request = require('supertest');
const app = require('../index');
const User = require('../models/User');
const Property = require('../models/Property');

describe('Yield Distribution Tests', () => {
  let authToken;
  let propertyId;

  beforeAll(async () => {
    // Create test user
    const userRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Yield User',
        email: 'yield@example.com',
        password: 'password123',
        walletAddress: '0x1234567890abcdef'
      });
    authToken = userRes.body.token;

    // Create test property
    const propertyRes = await request(app)
      .post('/api/properties')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Yield Property',
        location: 'Test Location',
        totalTokens: 1000,
        tokenPrice: 0.1,
        rentalIncome: 1000
      });
    propertyId = propertyRes.body.data._id;

    // Buy tokens
    await request(app)
      .post('/api/properties/buy')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        propertyId,
        amount: 100
      });
  });

  it('should calculate yield correctly', async () => {
    const res = await request(app)
      .get('/api/yield/stats/' + propertyId)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.annualYield).toBeGreaterThan(0);
    expect(res.body.data.monthlyYield).toBeGreaterThan(0);
    expect(res.body.data.nextDistribution).toBeDefined();
  });

  it('should distribute yield to token holders', async () => {
    const res = await request(app)
      .post('/api/yield/distribute')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ propertyId });

    expect(res.status).toBe(200);
    expect(res.body.data.distributedAmount).toBeGreaterThan(0);
    expect(res.body.data.transaction).toBeDefined();
  });

  it('should update rental income', async () => {
    const res = await request(app)
      .post('/api/yield/update')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ propertyId });

    expect(res.status).toBe(200);
    expect(res.body.data.monthlyYield).toBeGreaterThan(0);
    expect(res.body.data.annualYieldRate).toBeGreaterThan(0);
    expect(res.body.data.nextDistribution).toBeDefined();
  });

  it('should withdraw yield', async () => {
    const res = await request(app)
      .post('/api/yield/withdraw')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ propertyId });

    expect(res.status).toBe(200);
    expect(res.body.data.amount).toBeGreaterThan(0);
    expect(res.body.data.transaction).toBeDefined();
  });

  it('should get yield stats', async () => {
    const res = await request(app)
      .get('/api/yield/stats/' + propertyId)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.annualYield).toBeGreaterThan(0);
    expect(res.body.data.monthlyYield).toBeGreaterThan(0);
    expect(res.body.data.nextDistribution).toBeDefined();
  });

});
