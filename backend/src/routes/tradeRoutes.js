const express = require('express');
const { buyTokens, sellTokens } = require('../controllers/tradeController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/buy', protect, buyTokens);
router.post('/sell', protect, sellTokens);

module.exports = router;
