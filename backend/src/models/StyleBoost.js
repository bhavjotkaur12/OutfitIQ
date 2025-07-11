


// backend/src/models/StyleBoost.js
const mongoose = require('mongoose');

const styleBoostSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: String,
  date: {
    type: Date,
    default: Date.now
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: Date,
  rating: Number,
  weatherContext: {
    temperature: Number,
    condition: String,
    recommendation: String
  }
});

// Add method to check if boost is completed for today
styleBoostSchema.methods.isCompletedToday = function() {
  if (!this.completedAt) return false;
  const today = new Date();
  const completedDate = new Date(this.completedAt);
  return (
    completedDate.getDate() === today.getDate() &&
    completedDate.getMonth() === today.getMonth() &&
    completedDate.getFullYear() === today.getFullYear()
  );
};

module.exports = mongoose.model('StyleBoost', styleBoostSchema);