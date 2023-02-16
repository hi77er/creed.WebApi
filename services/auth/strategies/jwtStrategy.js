require('dotenv').config();
const passport = require("passport");
const mongoose = require("mongoose");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const User = mongoose.model('users');

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.AUTH_JWT_TOKEN_SECRET
};

// Used by the authenticated requests to deserialize the user,
// i.e., to fetch user details from the JWT.
passport.use(
  new JwtStrategy(
    opts,
    (jwt_payload, done) => {
      // Check against the DB only if necessary.
      // This can be avoided if you don't want to fetch user details in each request.
      console.log(10)
      console.log('jwt_payload');
      console.log(jwt_payload);
      User
        .findOne({ _id: jwt_payload._id })
        .then((user) => {
          if (user) {
            return done(null, user)
          } else {
            return done(null, false)
            // or you could create a new account
          }
        });
    })
)