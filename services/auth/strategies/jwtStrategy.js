require('dotenv').config();
const passport = require("passport");
const mongoose = require("mongoose");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const User = mongoose.model('users');

const getBearerFromAuthHeader = (req) => {
  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
    return req.headers.authorization.split(' ')[1];
  }
  return null;
}

const jwtExtractor = (req) => {
  const { signedCookies = {} } = req;
  const accessToken = signedCookies[process.env.AUTH_ACCESS_COOKIE_KEY] || getBearerFromAuthHeader(req);
  return accessToken;
}

// INFO: The JWT Strategy checks both:
//    - the Signed cookies for cookie AUTH_ACCESS_COOKIE_KEY
//    - and the request body for 'accessToken' parameter
const opts = {
  jwtFromRequest: jwtExtractor,
  secretOrKey: process.env.AUTH_ACCESS_TOKEN_SECRET
};

// Used by the authenticated requests to deserialize the user,
// i.e., to fetch user details from the JWT.
passport.use(
  new JwtStrategy(
    opts,
    (decodedJwtPayload, done) => {
      if (Date.now() > (decodedJwtPayload.exp * 1000))
        done('Unauthorized', false);

      User
        .findOne({ _id: decodedJwtPayload._id })
        .then((user) => {
          return user ? done(null, user) : done(null, false)
        });
    })
)