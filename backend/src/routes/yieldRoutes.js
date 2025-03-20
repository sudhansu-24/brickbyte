const express = require('express');
const {
  updateRentalIncome,
  distributeYield,
  withdrawYield,
  getYieldStats
} = require('../controllers/yieldController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All yield routes are protected
router.use(protect);

// Yield management endpoints
router.post('/update', updateRentalIncome);
router.post('/distribute', distributeYield);
router.post('/withdraw', withdrawYield);
router.get('/stats/:propertyId', getYieldStats);

module.exports = router;
