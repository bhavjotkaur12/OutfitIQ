const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  styleQuiz: mongoose.Schema.Types.Mixed,
  // Add more fields as needed (name, etc.)
});

module.exports = mongoose.model('User', userSchema);