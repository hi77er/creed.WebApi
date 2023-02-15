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

const whitelist = process.env.WHITELISTED_DOMAINS
  ? process.env.WHITELISTED_DOMAINS.split(",")
  : []

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error("Not allowed by CORS"))
    }
  },

  credentials: true,
}

app.use(cors(corsOptions))

// Configuring routs
require('./routes/authRoutеs')(app);
require('./routes/dashboardRoutеs')(app);

const PORT = process.env.PORT || 80;
app.listen(PORT);