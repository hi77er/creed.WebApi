const { default: mongoose } = require("mongoose");
const express = require('express');
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const passport = require('passport');

const cookieSession = require('cookie-session');

// Configure mongo data model
require('./models/User');

require("./services/auth/authenticate");
// Configuring Local Auth Strategy for passport
require("./services/auth/strategies/localStrategy");
// Configuring JWT Auth Strategy for passport
require("./services/auth/strategies/jwtStrategy");
// Configuring Google OAuth Strategy for passport
require('./services/auth/strategies/googleStrategy');

// Configure mongodb connection 
require('./services/mongodb');

// Configure App
const app = express();
app.use(bodyParser.json());
app.use(cookieParser(process.env.AUTH_COOKIE_KEY));

// app.use(
//   cookieSession({
//     maxAge: 30 * 24 * 60 * 60 * 1000,
//     keys: [process.env.AUTH_COOKIE_KEY]
//   })
// );

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

app.use(passport.initialize());
// app.use(passport.session());

// Configuring routs

const authRouter = require("./routes/authRoutes");
const dashboardRouter = require("./routes/dashboardRoutes");
const googleOAuthRouter = require("./routes/googleOAuthRoutes");
const userRouter = require("./routes/userRoutes");

app.use("/auth", authRouter);
app.use("/oauth/google", googleOAuthRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/user", userRouter);

const PORT = process.env.PORT || 80;
app.listen(PORT);