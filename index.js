const { default: mongoose } = require("mongoose");
const express = require('express');
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const passport = require('passport');

const cookieSession = require('cookie-session');

// Configure mongo data model
require('./models/User');

// Configuring GoogleStrategy for passport
require('./services/passport');

// Configure mongodb connection 
require('./services/mongodb');

// Configure App
const app = express();
app.use(bodyParser.json());
app.use(cookieParser(process.env.AUTH_COOKIE_KEY));

app.use(
  cookieSession({
    maxAge: 30 * 24 * 60 * 60 * 1000,
    keys: [process.env.AUTH_COOKIE_KEY]
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Configuring routs
require('./routes/authRoutеs')(app);
require('./routes/dashboardRoutеs')(app);

const PORT = process.env.PORT || 80;
app.listen(PORT);