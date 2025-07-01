const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// Add outfit to virtual closet
router.post('/add', auth, async (req, res) => {
  try {
    console.log('Received add to closet request:', req.body);
    const { outfit } = req.body;
    
    if (!outfit || !outfit._id) {
      return res.status(400).json({ message: 'Invalid outfit data' });
    }

    // Find user
    const user = await User.findById(req.user.id);
    console.log('Found user:', user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Initialize virtualCloset if it doesn't exist
    if (!user.virtualCloset) {
      user.virtualCloset = [];
    }

    // Check if outfit already exists in user's closet
    const outfitExists = user.virtualCloset.some(
      existingOutfit => existingOutfit.outfitId === outfit._id
    );

    if (!outfitExists) {
      // Add outfit to user's virtual closet
      const newOutfit = {
        outfitId: outfit._id,
        prompt: outfit.prompt || '',
        image_url: outfit.image_url || '',
        outfit_items: outfit.outfit_items || {},
        weather: outfit.weather || '',
        activity: outfit.activity || '',
        formality: outfit.formality || '',
        gender: outfit.gender || '',
        dateAdded: new Date()
      };

      user.virtualCloset.push(newOutfit);
      console.log('Added outfit to closet:', newOutfit);

      await user.save();
      res.json({ 
        message: 'Outfit added to virtual closet', 
        outfit: newOutfit,
        closetCount: user.virtualCloset.length 
      });
    } else {
      res.status(400).json({ message: 'Outfit already in closet' });
    }
  } catch (error) {
    console.error('Error adding to closet:', error);
    res.status(500).json({ 
      message: 'Error adding to closet',
      error: error.message 
    });
  }
});

// Get user's virtual closet
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ outfits: user.virtualCloset });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove outfit from virtual closet
router.delete('/remove/:outfitId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.virtualCloset = user.virtualCloset.filter(
      outfit => outfit.outfitId !== req.params.outfitId
    );

    await user.save();
    res.json({ 
      message: 'Outfit removed from closet',
      closetCount: user.virtualCloset.length 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
