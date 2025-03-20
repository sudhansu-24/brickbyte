const express = require('express');
const {
  getMarketInsights,
  adjustTokenPrice
} = require('../controllers/marketController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All market routes are protected
router.use(protect);

// Market insight endpoints
router.get('/insights/:propertyId', getMarketInsights);
router.post('/adjust-price/:propertyId', adjustTokenPrice);

module.exports = router;
