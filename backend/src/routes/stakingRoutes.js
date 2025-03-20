const express = require('express');
const {
  stakeTokens,
  unstakeTokens,
  claimRewards,
  vote,
  getStakingAPY
} = require('../controllers/stakingController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All staking routes are protected
router.use(protect);

// Staking endpoints
router.post('/stake', stakeTokens);
router.post('/unstake', unstakeTokens);
router.post('/claim-rewards', claimRewards);
router.post('/vote', vote);
router.get('/apy/:propertyId', getStakingAPY);

module.exports = router;
