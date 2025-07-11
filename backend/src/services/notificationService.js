// backend/src/services/notificationService.js
const admin = require('firebase-admin');
const User = require('../models/User');

exports.sendDailyBoostNotification = async (userId, boost) => {
  try {
    const user = await User.findById(userId);
    if (!user.fcmToken) return;

    await admin.messaging().send({
      token: user.fcmToken,
      notification: {
        title: "Today's Style Boost",
        body: boost.text
      },
      data: {
        type: 'style_boost',
        boostId: boost._id.toString()
      }
    });
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};

exports.sendWeatherBoostNotification = async (userId, boost) => {
  try {
    const user = await User.findById(userId);
    if (!user.fcmToken) return;

    const weatherEmoji = {
      rain: '🌧️',
      cold: '❄️',
      hot: '☀️'
    };

    const condition = boost.weatherContext.temperature < 15 ? 'cold' : 
                     boost.weatherContext.temperature > 25 ? 'hot' : 
                     boost.weatherContext.condition === 'rain' ? 'rain' : null;

    if (!condition) return;

    const emoji = weatherEmoji[condition];
    
    await admin.messaging().send({
      token: user.fcmToken,
      notification: {
        title: `${emoji} Weather Style Alert`,
        body: boost.text
      },
      data: {
        type: 'weather_boost',
        boostId: boost._id.toString(),
        temperature: boost.weatherContext.temperature.toString(),
        condition: boost.weatherContext.condition
      }
    });
  } catch (error) {
    console.error('Error sending weather notification:', error);
  }
};