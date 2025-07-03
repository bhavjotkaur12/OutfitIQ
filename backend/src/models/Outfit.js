const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const outfitSchema = new Schema({
  _id: Schema.Types.ObjectId,
  prompt: String,
  image_url: String,
  outfit_items: Object,
  weather: String,
  activity: String,
  formality: String,
  gender: String
}, { 
  collection: 'outfits'  // This tells Mongoose to use your existing 'outfits' collection
});

module.exports = mongoose.model('Outfit', outfitSchema);
