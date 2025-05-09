const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const passport = require('passport');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Google OAuth login
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
// Google OAuth callback
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    // You can generate a JWT here and send it to the frontend
    res.send('Google authentication successful!');
  }
);

module.exports = router;