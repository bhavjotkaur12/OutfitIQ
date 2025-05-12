const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth'); // If you want to require login

router.post('/style-quiz', authMiddleware, userController.saveStyleQuiz);

module.exports = router;
