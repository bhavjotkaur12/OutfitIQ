const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const session = require('express-session');
const passport = require('passport');
require('./config/passport'); // Make sure to require your passport config

const app = express();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

app.use(session({ secret: 'your_secret', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));