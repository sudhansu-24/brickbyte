const request = require('supertest');
const app = require('../index');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

describe('User Authentication Tests', () => {
  beforeAll(async () => {
    // Clear users collection before tests
    await User.deleteMany({});
  });

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        walletAddress: '0x1234567890abcdef'
      });
    expect(res.status).toBe(201);
    expect(res.body.data.email).toBe('john@example.com');
    expect(res.body.token).toBeDefined();
  });

  it('should not register user with existing email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        walletAddress: '0x1234567890abcdef'
      });
    expect(res.status).toBe(400);
  });

  it('should login an existing user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'john@example.com',
        password: 'password123'
      });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('should not login with wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'john@example.com',
        password: 'wrongpassword'
      });
    expect(res.status).toBe(401);
  });

  it('should get user profile with valid token', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'john@example.com',
        password: 'password123'
      });

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${loginRes.body.token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe('john@example.com');
  });

  it('should not get profile without token', async () => {
    const res = await request(app)
      .get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});
