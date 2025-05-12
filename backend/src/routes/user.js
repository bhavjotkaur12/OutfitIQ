const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth'); // If you want to require login
const User = require('../models/User');

router.post('/style-quiz', authMiddleware, userController.saveStyleQuiz);
router.post('/outfit-test', authMiddleware, async (req, res) => {
    try {
      const userId = req.user.id;
      const { responses } = req.body;
      await User.findByIdAndUpdate(userId, { outfitTest: responses });
      res.json({ message: 'Outfit test saved!' });
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  });

router.post('/profile-info', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { firstName, lastName, age, gender } = req.body;
    await User.findByIdAndUpdate(userId, { firstName, lastName, age, gender });
    res.json({ message: 'Profile info saved!' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
