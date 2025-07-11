// backend/src/cron/weatherBoost.js
const cron = require('node-cron');
const WeatherBoostService = require('../services/weatherBoostService');

// Check weather every 3 hours
cron.schedule('0 */3 * * *', async () => {
  await WeatherBoostService.checkAndSendWeatherAlerts();
});

// Early morning weather check for daily outfit planning
cron.schedule('0 6 * * *', async () => {
  await WeatherBoostService.checkAndSendWeatherAlerts();
});