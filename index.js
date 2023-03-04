require('dotenv').config();
const { default: mongoose } = require("mongoose");
const express = require('express');
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const passport = require('passport');

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
app.use(
  cookieParser([
    process.env.AUTH_ACCESS_TOKEN_SECRET,
    process.env.AUTH_REFRESH_TOKEN_SECRET
  ])
);
app.use(bodyParser.json());

// INFO: Configure Http Cookie Session:
// Don't forget to add the following environment variables:
//  AUTH_SESSION_NAME="auth_session"
//  AUTH_SESSION_EXPIRY_SECONDS = 60 * 15
// const session = require('express-session');
// app.use(
//   session({
//     secret: process.env.AUTH_ACCESS_COOKIE_KEY,
//     name: process.env.AUTH_SESSION_NAME,
//     resave: true,
//     saveUninitialized: true,
//     rolling: true,
//     cookie: {
//       httpOnly: true,
//       maxAge: 300 * 1000 // process.env.AUTH_SESSION_EXPIRY_SECONDS,
//     }
//   })
// );
// app.use(passport.session());

app.use(passport.initialize());

const whitelist = process.env.CORS_WHITELISTED_DOMAINS
  ? process.env.CORS_WHITELISTED_DOMAINS.split(",")
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