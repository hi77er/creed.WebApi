require('dotenv').config();
const passport = require("passport");
const jwt = require("jsonwebtoken");
const dev = process.env.NODE_ENV !== "production";

exports.COOKIE_OPTIONS = {
  httpOnly: true,
  // Since localhost is not having https protocol,
  // secure cookies do not work correctly (in postman)
  secure: !dev,
  signed: true,
  maxAge: eval(process.env.AUTH_REFRESH_TOKEN_EXPIRY_SECONDS) * 1000,
  sameSite: "none",
};

exports.getToken = (user) => {
  const accessToken = jwt
    .sign(user, process.env.AUTH_JWT_TOKEN_SECRET, {
      expiresIn: eval(process.env.AUTH_SESSION_EXPIRY_SECONDS),
    });

  return accessToken;
};

exports.getRefreshToken = (user) => {
  const refreshToken = jwt
    .sign(user, process.env.AUTH_REFRESH_TOKEN_SECRET, {
      expiresIn: eval(process.env.AUTH_REFRESH_TOKEN_EXPIRY_SECONDS),
    });

  return refreshToken;
};

exports.verifyUser = passport.authenticate("jwt", { session: false });