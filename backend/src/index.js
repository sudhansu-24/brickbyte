const express = require('express');
const cors = require('cors');
const { errorHandler } = require('./utils/errorHandler');
const connectDB = require('./config/database');
const env = require('./config/env');

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Import routes
const userRoutes = require('./routes/userRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const aiRoutes = require('./routes/aiRoutes');
const tradeRoutes = require('./routes/tradeRoutes');
const portfolioRoutes = require('./routes/portfolioRoutes');
const stakingRoutes = require('./routes/stakingRoutes');
const yieldRoutes = require('./routes/yieldRoutes');
const marketRoutes = require('./routes/marketRoutes');

// Basic status route
app.get('/api/status', (req, res) => {
  res.json({ status: "Backend connected successfully" });
});

// Mount routes
app.use('/api/auth', userRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/trade', tradeRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/staking', stakingRoutes);
app.use('/api/yield', yieldRoutes);
app.use('/api/market', marketRoutes);

// Error handling middleware
app.use(errorHandler);

// Only start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  app.listen(env.port, () => {
    console.log(`Server running in ${env.nodeEnv} mode on port ${env.port}`);
  });
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process if not in test environment
  if (process.env.NODE_ENV !== 'test') {
    process.exit(1);
  }
});

module.exports = app;
