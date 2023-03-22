const { default: mongoose } = require("mongoose");
import express from "express";
import 'express-async-errors';
import cors from "cors";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import passport from "passport";
import {
  AUTH_ACCESS_TOKEN_SECRET,
  AUTH_REFRESH_TOKEN_SECRET,
  CORS_WHITELISTED_DOMAINS
} from './keys';
import { errorHandler } from "./middlewares";
import authRouter from "./routes/authRoutes";
import dashboardRouter from "./routes/dashboardRoutes";
import facebookOAuthRouter from "./routes/facebookOAuthRoutes";
import googleOAuthRouter from "./routes/googleOAuthRoutes";
import githubOAuthRouter from "./routes/githubOAuthRoutes";
import userRouter from "./routes/userRoutes";


// Configure App
const app = express();
app.use(
  cookieParser([
    AUTH_ACCESS_TOKEN_SECRET || '',
    AUTH_REFRESH_TOKEN_SECRET || ''
  ])
);
app.use(bodyParser.json());
app.use(passport.initialize());

const whitelist = CORS_WHITELISTED_DOMAINS
  ? CORS_WHITELISTED_DOMAINS.split(",")
  : [];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || whitelist.indexOf(origin) !== -1)
      callback(null, true)
    else
      callback(new Error("Not allowed by CORS."))
  },
  credentials: true,
};

app.use(cors(corsOptions))

// Configuring routs

app.use("/", dashboardRouter);
app.use("/auth", authRouter);
app.use("/oauth/facebook", facebookOAuthRouter);
app.use("/oauth/github", githubOAuthRouter);
app.use("/oauth/google", googleOAuthRouter);
app.use("/api/user", userRouter);

app.use(errorHandler);

export default app;
