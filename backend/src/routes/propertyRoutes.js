const express = require('express');
const { createProperty, getProperties, buyTokens } = require('../controllers/propertyController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, createProperty);
router.get('/', getProperties);
router.post('/buy', protect, buyTokens);

module.exports = router;
