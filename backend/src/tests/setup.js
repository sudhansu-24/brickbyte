const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { mockBlockchain, mockAI } = require('./mocks/mockServices');
const { mockAuthMiddleware } = require('./mocks/mockMiddleware');

let mongoServer;

// Set up environment variables for testing
process.env.JWT_SECRET = 'test-secret';

// Mock blockchain and AI services
jest.mock('../config/blockchain', () => mockBlockchain);
jest.mock('../services/marketPrediction', () => mockAI);
jest.mock('../middleware/authMiddleware', () => ({
  protect: mockAuthMiddleware
}));

// Connect to the in-memory database before running tests
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

// Clear all test data after each test
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany();
  }
  
  // Clear all mock data
  jest.clearAllMocks();
});

// Disconnect and stop the in-memory server
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Test Setup', () => {
  it('should connect to in-memory database', () => {
    expect(mongoose.connection.readyState).toBe(1);
  });

  it('should set up environment variables', () => {
    expect(process.env.JWT_SECRET).toBe('test-secret');
  });
});
