const mongoose = require('mongoose');

// Define a schema for outfit items
const OutfitItemSchema = new mongoose.Schema({
  name: String,
  color: String,
  fit: String,
  notes: String,
  lastWorn: Date
}, { _id: false, strict: false }); // Disable _id and allow flexible fields

const likedOutfitSchema = new mongoose.Schema({
  outfitId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Outfit'  // This should reference your Outfit model
  },
  likedAt: {
    type: Date,
    default: Date.now
  }
});

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
        type: Object,    // Keep it as Object type
        default: {}      // Default empty object
      },
      weather: String,
      activities: [String],
      formality: String,
      gender: String,
      dateAdded: {
        type: Date,
        default: Date.now
      },
      lastWorn: {
        type: Date,
        default: null
      }
    }],
    default: []
  },
  likedOutfits: [likedOutfitSchema],

  // Add more fields as needed (name, etc.)
}, { minimize: false }); // Prevent Mongoose from removing empty objects

// Add a pre-save middleware to ensure outfit_items is always an object
userSchema.pre('save', function(next) {
  if (this.virtualCloset) {
    this.virtualCloset.forEach(outfit => {
      if (!outfit.outfit_items) {
        outfit.outfit_items = {};
      }
    });
  }
  next();
});

module.exports = mongoose.model('User', userSchema);