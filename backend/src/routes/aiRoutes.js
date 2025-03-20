const express = require('express');
const { getMarketInsights } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Protected AI routes
router.get('/market-insights/:propertyId', protect, getMarketInsights);

module.exports = router;
