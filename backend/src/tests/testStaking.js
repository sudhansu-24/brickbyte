const request = require('supertest');
const app = require('../index');
const User = require('../models/User');
const Property = require('../models/Property');

describe('Staking Tests', () => {
  let authToken;
  let propertyId;

  beforeAll(async () => {
    // Create test user
    const userRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Staking User',
        email: 'staker@example.com',
        password: 'password123',
        walletAddress: '0x1234567890abcdef'
      });
    authToken = userRes.body.token;

    // Create test property
    const propertyRes = await request(app)
      .post('/api/properties')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Staking Property',
        location: 'Test Location',
        totalTokens: 1000,
        tokenPrice: 0.1,
        rentalIncome: 1000
      });
    propertyId = propertyRes.body.data._id;

    // Buy tokens to stake
    await request(app)
      .post('/api/properties/buy')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        propertyId,
        amount: 200
      });
  });

  it('should allow user to stake tokens', async () => {
    const res = await request(app)
      .post('/api/staking/stake')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        propertyId,
        amount: 100
      });

    expect(res.status).toBe(200);
    expect(res.body.data.stakedBalance).toBe(100);
    expect(res.body.data.transaction).toBeDefined();
  });

  it('should not allow staking more than owned tokens', async () => {
    const res = await request(app)
      .post('/api/staking/stake')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        propertyId,
        amount: 1000
      });

    expect(res.status).toBe(400);
  });

  it('should calculate staking rewards correctly', async () => {
    // Wait for some time to accrue rewards
    await new Promise(resolve => setTimeout(resolve, 1000));

    const res = await request(app)
      .get('/api/staking/rewards')
      .set('Authorization', `Bearer ${authToken}`)
      .query({ propertyId });

    expect(res.status).toBe(200);
    expect(res.body.data.rewardsEarned).toBeGreaterThan(0);
    expect(res.body.data.apy).toBeGreaterThan(0);
  });

  it('should allow user to unstake tokens', async () => {
    const res = await request(app)
      .post('/api/staking/unstake')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        propertyId,
        amount: 50
      });

    expect(res.status).toBe(200);
    expect(res.body.data.stakedBalance).toBe(50);
    expect(res.body.data.transaction).toBeDefined();
  });

  it('should claim rewards', async () => {
    const res = await request(app)
      .post('/api/staking/claim-rewards')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        propertyId
      });

    expect(res.status).toBe(200);
    expect(res.body.data.claimedAmount).toBeGreaterThan(0);
    expect(res.body.data.transaction).toBeDefined();
  });

  it('should get staking statistics', async () => {
    const res = await request(app)
      .get('/api/staking/stats')
      .set('Authorization', `Bearer ${authToken}`)
      .query({ propertyId });

    expect(res.status).toBe(200);
    expect(res.body.data.totalStaked).toBeGreaterThan(0);
    expect(res.body.data.stakingRatio).toBeDefined();
    expect(res.body.data.averageStakingPeriod).toBeDefined();
  });

  it('should handle gas fee limits for staking', async () => {
    const res = await request(app)
      .post('/api/staking/stake')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        propertyId,
        amount: 10,
        maxGasFee: 0.001 // 0.001 ETH
      });

    expect(res.status).toBe(200);
    expect(res.body.data.gasUsed).toBeLessThan(0.001);
  });
});
