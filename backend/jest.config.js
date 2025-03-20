module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.js'],
  setupFilesAfterEnv: ['./src/tests/setup.js'],
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  testTimeout: 30000,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/dist/'
  ]
};
