require('dotenv').config();
const mongoose = require("mongoose");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const User = mongoose.model('users');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id).then((user) => { done(null, user); });
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.AUTH_GOOGLE_CLIENT_ID,
      clientSecret: process.env.AUTH_GOOGLE_CLIENT_SECRET,
      callbackURL: '/oauth/google/callback',
      proxy: true
    },
    (accessToken, refreshToken, profile, done) => {
      User
        .findOne({ googleId: profile.id })
        .then(async (existingUser) => {
          if (existingUser) {
            done(null, existingUser);
          } else {
            new User({
              emails: profile.emails.map(x => { x.value, verified = false }),
              firstName: profile.name.givenName,
              lastName: profile.name.familyName,
              gender: profile.gender,
              googleId: profile.id,
              googleRefreshToken: refreshToken,
              googlePhotos: profile.photos
            })
              .save()
              .then((savedUser) => done(null, savedUser));
          }
        });
    }
  )
);
