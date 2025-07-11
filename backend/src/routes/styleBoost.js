// backend/src/routes/styleBoost.js
const express = require('express');
const router = express.Router();
const styleBoostController = require('../controllers/styleBoostController');
const authMiddleware = require('../middleware/auth');

// Make sure to use the controller functions as route handlers
router.get('/daily', authMiddleware, styleBoostController.getDailyBoost);
router.post('/:boostId/complete', authMiddleware, styleBoostController.markComplete);
router.post('/:boostId/rate', authMiddleware, styleBoostController.rateBoost);

module.exports = router;