// backend/src/services/weatherBoostService.js
const axios = require('axios');
const User = require('../models/User');
const StyleBoost = require('../models/StyleBoost');
const notificationService = require('./notificationService');

class WeatherBoostService {
  static async getWeatherData(location) {
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&appid=${process.env.WEATHER_API_KEY}`
      );
      return {
        temperature: response.data.main.temp,
        condition: response.data.weather[0].main.toLowerCase(),
        description: response.data.weather[0].description
      };
    } catch (error) {
      console.error('Error fetching weather:', error);
      return null;
    }
  }

  static getWeatherBasedRecommendation(weather, userStyle) {
    const recommendations = {
      rain: {
        items: ['raincoat', 'waterproof boots', 'umbrella'],
        tips: {
          Minimalist: "A sleek waterproof trench coat keeps you dry while maintaining your minimal aesthetic",
          Casual: "Layer a waterproof jacket over your casual outfit",
          Elegant: "Opt for a sophisticated umbrella and water-resistant boots"
        }
      },
      cold: {
        items: ['warm coat', 'scarf', 'gloves', 'boots'],
        tips: {
          Minimalist: "Layer neutral-colored thermal pieces for warmth without bulk",
          Casual: "Add a cozy oversized sweater to your everyday look",
          Elegant: "A well-tailored wool coat elevates your winter wardrobe"
        }
      },
      hot: {
        items: ['light fabrics', 'breathable materials', 'sun protection'],
        tips: {
          Minimalist: "Choose lightweight, breathable fabrics in neutral tones",
          Casual: "Opt for loose-fitting cotton pieces to stay cool",
          Elegant: "Select airy, flowing materials that maintain sophistication"
        }
      }
    };

    let weatherType;
    if (weather.condition === 'rain' || weather.condition === 'drizzle') {
      weatherType = 'rain';
    } else if (weather.temperature < 15) {
      weatherType = 'cold';
    } else if (weather.temperature > 25) {
      weatherType = 'hot';
    }

    if (!weatherType) return null;

    const styleType = userStyle || 'Casual';
    return {
      items: recommendations[weatherType].items,
      tip: recommendations[weatherType].tips[styleType]
    };
  }

  static async generateWeatherBoost(userId) {
    try {
      const user = await User.findById(userId);
      const location = user.location || 'London'; // Default location
      const weather = await this.getWeatherData(location);
      
      if (!weather) return null;

      const styleType = user.styleQuiz?.styleTypes?.[0] || 'Casual';
      const recommendation = this.getWeatherBasedRecommendation(weather, styleType);

      if (!recommendation) return null;

      const boost = new StyleBoost({
        userId,
        text: recommendation.tip,
        boostType: 'WEATHER_ALERT',
        weatherContext: {
          temperature: weather.temperature,
          condition: weather.condition,
          recommendation: recommendation.items.join(', ')
        }
      });

      await boost.save();
      return boost;
    } catch (error) {
      console.error('Error generating weather boost:', error);
      return null;
    }
  }

  static async checkAndSendWeatherAlerts() {
    try {
      const users = await User.find();
      for (const user of users) {
        const boost = await this.generateWeatherBoost(user._id);
        if (boost) {
          await notificationService.sendWeatherBoostNotification(user._id, boost);
        }
      }
    } catch (error) {
      console.error('Error in weather alerts:', error);
    }
  }
}

module.exports = WeatherBoostService;