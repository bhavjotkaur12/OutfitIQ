const User = require('../models/User');

exports.saveStyleQuiz = async (req, res) => {
  try {
    // req.user.id is available if using authMiddleware, otherwise use req.body.userId or similar
    const userId = req.user ? req.user.id : req.body.userId;
    const quizData = req.body;

    // Save quiz data to user profile
    const user = await User.findByIdAndUpdate(
      userId,
      { styleQuiz: quizData },
      { new: true, upsert: true }
    );

    res.json({ message: 'Style quiz saved', user });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
