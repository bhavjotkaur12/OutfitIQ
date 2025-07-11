// backend/src/controllers/styleBoostController.js
const StyleBoost = require('../models/StyleBoost');
const User = require('../models/User');

exports.generateDailyBoost = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    // Get user's style preferences
    const styleTypes = user.styleQuiz?.styleTypes || [];
    const preferredColors = user.styleQuiz?.preferredColors || [];
    
    // Generate personalized boost based on user preferences
    const boost = await generatePersonalizedBoost(styleTypes, preferredColors);
    
    // Save the boost
    const styleBoost = new StyleBoost({
      userId,
      text: boost.text,
      imageUrl: boost.imageUrl,
      category: boost.category
    });
    
    await styleBoost.save();
    res.json(styleBoost);
  } catch (error) {
    res.status(500).json({ message: 'Error generating style boost' });
  }
};

// Helper function to generate personalized boosts
const generatePersonalizedBoost = async (styleTypes, preferredColors) => {
  const boostTemplates = {
    Minimalist: [
      "Try adding a statement piece to your neutral outfit today",
      "Experiment with monochromatic layering using different textures",
    ],
    Casual: [
      "Elevate your casual look with a structured blazer",
      "Mix comfort with style by pairing sneakers with a dress",
    ],
    // Add more templates based on style types
  };

  // Select appropriate template based on user's style
  const userStyle = styleTypes[0] || 'Casual';
  const templates = boostTemplates[userStyle] || boostTemplates.Casual;
  
  return {
    text: templates[Math.floor(Math.random() * templates.length)],
    category: 'Styling Tips',
    imageUrl: null // Add relevant image URL
  };
};

// Export functions that will be used as route handlers
exports.getDailyBoost = async (req, res) => {
  try {
    // Get today's date boundaries
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Find today's boost for the user
    let boost = await StyleBoost.findOne({
      userId: req.user._id,
      date: {
        $gte: today,
        $lt: tomorrow
      }
    });

    // If no boost exists for today, create a new one
    if (!boost) {
      boost = await StyleBoost.create({
        userId: req.user._id,
        text: generateDailyBoost(req.query.weather), // Access weather from query params
        weatherContext: req.query.weather ? {
          temperature: req.query.weather.temp,
          condition: req.query.weather.description,
          recommendation: generateWeatherRecommendation(req.query.weather)
        } : null
      });
    }

    res.json(boost);
  } catch (error) {
    console.error('Error in getDailyBoost:', error);
    res.status(500).json({ message: 'Error fetching daily boost' });
  }
};

exports.markComplete = async (req, res) => {
  try {
    const boost = await StyleBoost.findOne({
      _id: req.params.boostId,
      userId: req.user._id
    });

    if (!boost) {
      return res.status(404).json({ message: 'Boost not found' });
    }

    boost.completed = true;
    boost.completedAt = new Date();
    await boost.save();

    res.json(boost);
  } catch (error) {
    console.error('Error in markComplete:', error);
    res.status(500).json({ message: 'Error marking boost as complete' });
  }
};

exports.rateBoost = async (req, res) => {
  try {
    const boost = await StyleBoost.findOne({
      _id: req.params.boostId,
      userId: req.user._id
    });

    if (!boost) {
      return res.status(404).json({ message: 'Boost not found' });
    }

    boost.rating = req.body.rating;
    await boost.save();

    res.json(boost);
  } catch (error) {
    console.error('Error in rateBoost:', error);
    res.status(500).json({ message: 'Error rating boost' });
  }
};

exports.toggleFavorite = async (req, res) => {
  try {
    const boostId = req.params.id;
    const boost = await StyleBoost.findById(boostId);
    boost.favorite = !boost.favorite;
    await boost.save();
    res.json(boost);
  } catch (error) {
    res.status(500).json({ message: 'Error toggling favorite status' });
  }
};

// Helper functions
function generateDailyBoost(weather) {
  const boosts = {
    casual: [
      "Mix comfort with style by pairing sneakers with a dress",
      "Layer a denim jacket over a summer dress for a casual-cool vibe",
      "Try high-waisted jeans with a tucked-in graphic tee",
      "Add white sneakers to elevate any casual outfit",
      "Roll up your sleeves for an effortlessly casual look"
    ],
    formal: [
      "Add a structured blazer to instantly elevate any outfit",
      "Try monochromatic dressing for a sophisticated look",
      "Incorporate a silk scarf for elegant touch",
      "Swap casual shoes for pointed flats or low heels",
      "Add pearl or metallic accessories for refinement"
    ],
    experimental: [
      "Mix patterns: try stripes with florals",
      "Combine unexpected colors like purple and yellow",
      "Layer different textures for visual interest",
      "Try color blocking with bold, contrasting shades",
      "Mix feminine and masculine pieces for edge"
    ],
    accessories: [
      "Add a statement necklace to transform a basic outfit",
      "Try layering different length necklaces",
      "Use a belt to define your waist and add interest",
      "Mix metals in your jewelry for modern style",
      "Add a patterned scarf as a pop of color"
    ],
    seasonal: [
      "Layer thin knits for transitional weather",
      "Try a midi skirt with boots for season mixing",
      "Add a light scarf for variable temperatures",
      "Roll up pants or sleeves for warmer moments",
      "Layer with pieces that are easy to remove"
    ]
  };

  // Randomly select a category and then a boost from that category
  const categories = Object.keys(boosts);
  const selectedCategory = categories[Math.floor(Math.random() * categories.length)];
  const categoryBoosts = boosts[selectedCategory];
  return categoryBoosts[Math.floor(Math.random() * categoryBoosts.length)];
}

function generateWeatherRecommendation(weather) {
  if (!weather) return "Dress comfortably for today!";
  
  const temp = weather.temp;
  const condition = weather.description.toLowerCase();

  // Temperature ranges
  const tempRanges = {
    freezing: temp <= 0,
    veryCold: temp > 0 && temp <= 5,
    cold: temp > 5 && temp <= 10,
    mild: temp > 10 && temp <= 18,
    warm: temp > 18 && temp <= 25,
    hot: temp > 25 && temp <= 30,
    veryHot: temp > 30
  };

  // Weather conditions
  if (condition.includes('rain')) {
    if (temp <= 10) {
      return "Cold and rainy - layer a waterproof coat over warm sweater, don't forget waterproof boots!";
    } else if (temp <= 20) {
      return "Mild and rainy - a lightweight rain jacket with breathable layers is perfect. Consider water-resistant footwear.";
    } else {
      return "Warm and rainy - opt for a light rain jacket or umbrella. Choose quick-drying fabrics.";
    }
  }

  if (condition.includes('snow')) {
    return "Snowy conditions - wear waterproof boots, insulated coat, and warm accessories (hat, gloves, scarf).";
  }

  if (condition.includes('wind') || condition.includes('breezy')) {
    return "Windy weather - secure loose items, consider a light windbreaker or structured jacket.";
  }

  if (condition.includes('storm')) {
    return "Stormy weather - wear water-resistant clothing and sturdy shoes. Bring an umbrella!";
  }

  // Temperature-based recommendations
  if (tempRanges.freezing) {
    return "Freezing temperatures - layer thermal underwear under warm clothes, wear insulated boots and winter accessories.";
  }

  if (tempRanges.veryCold) {
    return "Very cold - wear multiple warm layers, insulated coat, and don't forget hat and gloves.";
  }

  if (tempRanges.cold) {
    return "Chilly day - layer with a warm sweater and light coat. Consider a scarf for extra warmth.";
  }

  if (tempRanges.mild) {
    return "Mild temperature - perfect for light layers like a cardigan or light jacket that you can remove if needed.";
  }

  if (tempRanges.warm) {
    return "Warm weather - opt for breathable fabrics and light colors. A light layer might be useful for air-conditioned spaces.";
  }

  if (tempRanges.hot) {
    return "Hot day - choose loose-fitting, light-colored clothing in breathable fabrics. Consider a hat for sun protection.";
  }

  if (tempRanges.veryHot) {
    return "Very hot - wear light, loose clothing in natural fabrics. Don't forget sun protection and stay hydrated!";
  }

  // Specific weather conditions
  if (condition.includes('clear')) {
    return "Clear skies - perfect weather for showcasing your favorite outfit! Don't forget sunglasses.";
  }

  if (condition.includes('cloud')) {
    return "Cloudy day - versatile weather for most outfit choices. Consider layers for changing temperatures.";
  }

  if (condition.includes('fog') || condition.includes('mist')) {
    return "Foggy conditions - wear visible colors and bring an extra layer for the moisture.";
  }

  if (condition.includes('humid')) {
    return "Humid weather - choose lightweight, loose-fitting clothes in natural, breathable fabrics.";
  }

  // Default recommendation
  return "Perfect weather for a versatile outfit! Consider light layers that you can adjust throughout the day.";
}

module.exports = exports;


