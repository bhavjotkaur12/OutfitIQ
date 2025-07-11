// backend/src/cron/styleBoost.js
const cron = require('node-cron');
const User = require('../models/User');
const styleBoostController = require('../controllers/styleBoostController');
const notificationService = require('../services/notificationService');

// Run at 9 AM every day
cron.schedule('0 9 * * *', async () => {
  try {
    const users = await User.find();
    for (const user of users) {
      const boost = await styleBoostController.generateDailyBoost(user._id);
      await notificationService.sendDailyBoostNotification(user._id, boost);
    }
  } catch (error) {
    console.error('Error in style boost cron job:', error);
  }
});