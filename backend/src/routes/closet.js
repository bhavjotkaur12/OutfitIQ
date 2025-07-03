const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const Outfit = require('../models/Outfit');
const mongoose = require('mongoose');

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

    // Add debug logging
    console.log('Debug - User closet data:', {
      closetSize: user.virtualCloset.length,
      firstOutfit: user.virtualCloset[0]
    });

    // Ensure outfit_items are properly included
    const outfits = user.virtualCloset.map(outfit => ({
      outfitId: outfit.outfitId,
      image_url: outfit.image_url,
      outfit_items: outfit.outfit_items || {}, // Ensure it's at least an empty object
      activity: outfit.activity,
      formality: outfit.formality,
      weather: outfit.weather,
      gender: outfit.gender,
      lastWorn: outfit.lastWorn
    }));

    res.json({ outfits });
  } catch (error) {
    console.error('Error fetching closet:', error);
    res.status(500).json({ error: error.message });
  }
});

// Remove outfit from virtual closet
router.delete('/:outfitId', auth, async (req, res) => {
  try {
    console.log('Debug - Delete request:', {
      outfitId: req.params.outfitId
    });

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find the outfit index
    const outfitIndex = user.virtualCloset.findIndex(
      outfit => outfit.outfitId === req.params.outfitId
    );

    if (outfitIndex === -1) {
      return res.status(404).json({ message: 'Outfit not found' });
    }

    // Remove the outfit
    user.virtualCloset.splice(outfitIndex, 1);
    
    // Mark as modified to ensure save catches the change
    user.markModified('virtualCloset');

    console.log('Debug - Before save:', {
      closetSize: user.virtualCloset.length
    });

    await user.save();

    console.log('Debug - After save:', {
      closetSize: user.virtualCloset.length
    });

    res.json({ 
      message: 'Outfit removed from closet',
      closetCount: user.virtualCloset.length 
    });
  } catch (error) {
    console.error('Error deleting outfit:', error);
    res.status(500).json({ 
      message: 'Error deleting outfit',
      error: error.message 
    });
  }
});

// Update item in an outfit
router.put('/:outfitId/:itemKey', auth, async (req, res) => {
  try {
    const { outfitId, itemKey } = req.params;
    const { updates } = req.body;

    console.log('Debug - Received update request:', { outfitId, itemKey, updates });

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const outfitIndex = user.virtualCloset.findIndex(o => o.outfitId === outfitId);
    if (outfitIndex === -1) {
      return res.status(404).json({ message: 'Outfit not found' });
    }

    // Initialize outfit_items if it doesn't exist
    if (!user.virtualCloset[outfitIndex].outfit_items) {
      user.virtualCloset[outfitIndex].outfit_items = {};
    }

    // Store the full item details as a regular object
    const updatedItem = {
      name: updates.name || '',
      color: updates.color || '',
      fit: updates.fit || '',
      notes: updates.notes || '',
      lastWorn: updates.lastWorn || null
    };

    // Update the item
    user.virtualCloset[outfitIndex].outfit_items[itemKey] = updatedItem;

    // Mark the outfit_items field as modified
    user.markModified(`virtualCloset.${outfitIndex}.outfit_items`);

    console.log('Debug - Before save:', {
      outfitId,
      itemKey,
      updatedItem,
      currentOutfit: user.virtualCloset[outfitIndex]
    });

    await user.save();

    console.log('Debug - After save:', {
      savedOutfit: user.virtualCloset[outfitIndex]
    });

    res.json({ 
      message: 'Item updated successfully',
      outfit: user.virtualCloset[outfitIndex]
    });

  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ message: 'Error updating item' });
  }
});

// Toggle outfit like status
router.post('/like/:outfitId', auth, async (req, res) => {
  try {
    const { outfitId } = req.params;
    console.log('Received like/unlike request for outfitId:', outfitId);

    // Validate outfitId
    if (!mongoose.Types.ObjectId.isValid(outfitId)) {
      console.error('Invalid outfitId format:', outfitId);
      return res.status(400).json({
        success: false,
        message: 'Invalid outfit ID format'
      });
    }

    const user = await User.findById(req.user.id);
    console.log('Found user:', user?._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Initialize likedOutfits if it doesn't exist
    if (!user.likedOutfits) {
      user.likedOutfits = [];
    }

    // Convert outfitId to string for comparison
    const likedIndex = user.likedOutfits.findIndex(
      item => item.outfitId.toString() === outfitId
    );
    console.log('Current liked status:', likedIndex === -1 ? 'not liked' : 'liked');

    if (likedIndex === -1) {
      // Verify outfit exists before adding to liked
      const outfitExists = await Outfit.exists({ _id: outfitId });
      if (!outfitExists) {
        return res.status(404).json({
          success: false,
          message: 'Outfit not found'
        });
      }

      // Add to liked outfits
      user.likedOutfits.push({
        outfitId: new mongoose.Types.ObjectId(outfitId),
        likedAt: new Date()
      });
    } else {
      // Remove from liked outfits
      user.likedOutfits.splice(likedIndex, 1);
    }

    await user.save();
    console.log('Successfully updated like status');

    res.json({
      success: true,
      message: likedIndex === -1 ? 'Outfit liked' : 'Outfit unliked',
      liked: likedIndex === -1,
      likedOutfits: user.likedOutfits
    });
  } catch (error) {
    console.error('Error in like/unlike operation:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error updating like status',
      error: error.message 
    });
  }
});

// Get liked outfits
router.get('/liked', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate({
        path: 'likedOutfits',
        populate: {
          path: 'outfitId',  // This should match the field name in your schema
          model: 'Outfit',   // This should match your Outfit model name
          select: 'image_url outfit_items prompt activity formality gender weather' // Select the fields you need
        }
      });

    // Transform the data to match the expected format
    const likedOutfits = user.likedOutfits.map(liked => ({
      outfitId: liked.outfitId._id,
      image_url: liked.outfitId.image_url,
      outfit_items: liked.outfitId.outfit_items,
      likedAt: liked.likedAt,
      // Include other fields as needed
      activity: liked.outfitId.activity,
      formality: liked.outfitId.formality,
      weather: liked.outfitId.weather
    }));

    res.json({ likedOutfits });
  } catch (error) {
    console.error('Error fetching liked outfits:', error);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
