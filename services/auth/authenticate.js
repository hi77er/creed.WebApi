require('dotenv').config();
const passport = require("passport");
const jwt = require("jsonwebtoken");
const production = process.env.NODE_ENV === "production";

exports.AUTH_ACCESS_COOKIE_KEY = process.env.AUTH_ACCESS_COOKIE_KEY
exports.AUTH_REFRESH_COOKIE_KEY = process.env.AUTH_REFRESH_COOKIE_KEY

exports.ACCESS_TOKEN_COOKIE_OPTIONS = {
  httpOnly: true,
  signed: true,
  maxAge: 1000 * eval(process.env.AUTH_ACCESS_TOKEN_EXPIRY_SECONDS),
  sameSite: 'lax',
  // Since localhost is not having https protocol,
  // secure cookies do not work correctly (in postman)
  secure: production,
};

exports.REFRESH_TOKEN_COOKIE_OPTIONS = {
  httpOnly: true,
  httpOnly: true,
  signed: true,
  maxAge: 1000 * eval(process.env.AUTH_REFRESH_TOKEN_EXPIRY_SECONDS),
  sameSite: 'lax',
  // Since localhost is not having https protocol,
  // secure cookies do not work correctly (in postman)
  secure: production,
};

exports.getAccessToken = (user) => {
  const accessToken = jwt
    .sign(user, process.env.AUTH_ACCESS_TOKEN_SECRET, {
      expiresIn: eval(process.env.AUTH_ACCESS_TOKEN_EXPIRY_SECONDS)
    });

  return accessToken;
};

exports.getRefreshToken = (user) => {
  const refreshToken = jwt
    .sign(user, process.env.AUTH_REFRESH_TOKEN_SECRET, {
      expiresIn: eval(process.env.AUTH_REFRESH_TOKEN_EXPIRY_SECONDS)
    });

  return refreshToken;
};

exports.verifyUser = passport.authenticate("jwt", { session: false });