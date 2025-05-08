require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail', // or another email provider
  auth: {
    user: process.env.EMAIL_USER, // your email address
    pass: process.env.EMAIL_PASS, // your email password or app password
  },
});

const sendWelcomeEmail = async (to, name = '') => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: 'Welcome to OutfitIQ!',
    text: `Hi${name ? ' ' + name : ''},\n\nWelcome to OutfitIQ! We're excited to help you discover your style.\n\nBest,\nThe OutfitIQ Team`,
    // You can also add html: '<b>Welcome!</b>' for HTML emails
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendWelcomeEmail;