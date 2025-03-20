const express = require('express');
const {
  getPortfolio,
  rebalancePortfolio,
  getHistoricalPerformance
} = require('../controllers/portfolioController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All portfolio routes are protected
router.use(protect);

router.get('/', getPortfolio);
router.post('/rebalance', rebalancePortfolio);
router.get('/history', getHistoricalPerformance);

module.exports = router;
