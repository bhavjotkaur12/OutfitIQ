const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  styleQuiz: mongoose.Schema.Types.Mixed,
  outfitTest: mongoose.Schema.Types.Mixed,
  firstName: String,
  lastName: String,
  age: Number,
  gender: String,
  avatarUrl: String,
  styleProfile: mongoose.Schema.Types.Mixed,
  virtualCloset: {
    type: [{
      outfitId: String,
      prompt: String,
      image_url: String,
      outfit_items: {
        top: String,
        bottom: String,
        shoes: String,
        accessory: String,
        dress: String
      },
      weather: String,
      activity: String,
      formality: String,
      gender: String,
      dateAdded: {
        type: Date,
        default: Date.now
      }
    }],
    default: []  // Initialize as empty array
  },

  // Add more fields as needed (name, etc.)
});

module.exports = mongoose.model('User', userSchema);