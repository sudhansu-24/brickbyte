const dotenv = require('dotenv');

// Load env vars
dotenv.config();

module.exports = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  ethPrivateKey: process.env.ETH_PRIVATE_KEY,
  infuraProjectId: process.env.INFURA_PROJECT_ID,
  nodeEnv: process.env.NODE_ENV || 'development'
};
