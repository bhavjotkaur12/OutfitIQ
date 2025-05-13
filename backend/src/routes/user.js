const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth'); // If you want to require login
const User = require('../models/User');
const path = require('path');
const outfits = require('../../data/outfits.json'); // adjust path as needed

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

// Helper: Generate style profile from quiz & outfit test
function generateStyleProfile(user) {
  const quiz = user.styleQuiz || {};
  const outfitTest = user.outfitTest || {};

  // Style summary: use the first style type, or fallback
  const styleSummary = quiz.styleTypes?.[0] || 'Classic Chic';

  // Categories: use all selected style types, or fallback
  const categories = quiz.styleTypes || ['Casual', 'Chic'];

  // Colors: use preferredColors, or fallback
  const colors = quiz.preferredColors || ['Black', 'White', 'Blue'];

  // Brands: use brands (string or array), or fallback
  let brands = [];
  if (Array.isArray(quiz.brands)) {
    brands = quiz.brands;
  } else if (typeof quiz.brands === 'string') {
    brands = quiz.brands.split(',').map(b => b.trim());
  } else {
    brands = ['Zara', 'Uniqlo'];
  }

  // You can also analyze outfitTest for more personalization if you want

  return {
    name: user.firstName ? `${user.firstName} ${user.lastName}` : user.email,
    avatarUrl: user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.firstName || user.email)}`,
    styleSummary,
    categories,
    colors,
    brands,
  };
}

// GET /api/user/profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const profile = generateStyleProfile(user);
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Filtering function
function filterOutfitsForUser(userQuiz, userGender) {
  return outfits.filter(outfit =>
    outfit.styles.some(style => userQuiz.styleTypes.includes(style)) &&
    (outfit.gender === userGender || outfit.gender === 'Unisex')
  );
}

// API endpoint
router.get('/visual-test-outfits', authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.id);
  const userQuiz = user.styleQuiz; // or wherever you store quiz answers
  const userGender = user.gender;

  let filtered = filterOutfitsForUser(userQuiz, userGender);

  // Add randoms for diversity if needed
  if (filtered.length < 10) {
    const randoms = outfits.filter(o => !filtered.includes(o));
    while (filtered.length < 10 && randoms.length) {
      filtered.push(randoms.pop());
    }
  }

  res.json(filtered.slice(0, 10));
});

module.exports = router;
