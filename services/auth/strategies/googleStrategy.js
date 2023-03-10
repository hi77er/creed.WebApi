require('dotenv').config();
const mongoose = require("mongoose");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = mongoose.model('users');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((email, done) => {
  User
    .findOne({ email })
    .then((user) => {
      done(null, user);
    });
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.AUTH_GOOGLE_CLIENT_ID,
      clientSecret: process.env.AUTH_GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.AUTH_GOOGLE_CALLBACK,
      proxy: true
    },
    async (accessToken, refreshToken, profile, done) => {
      if (!profile || !profile.emails || !profile.emails[0] || !profile.emails[0].value)
        done('Unauthorized', null);

      const existingUser = await User.findOne({ email: profile.emails[0].value });

      if (existingUser) {
        await existingUser.update(
          {
            $set: {
              sessions: [
                { authStrategy: 'google', refreshToken: 'no token' },
                ...existingUser.sessions.filter(x => x.authStrategy != 'google')
              ],
              externalOAuth: [
                {
                  provider: 'google',
                  email: profile.emails[0].value,
                  externalProfileId: profile.id
                },
                ...existingUser.externalOAuth.filter(x => x.provider != 'google')
              ]
            }
          }
        );

        done(null, existingUser);
      } else {
        const savedUser = await new User({
          email: profile.emails[0].value,
          firstName: profile.name?.givenName,
          lastName: profile.name?.familyName,
          gender: profile.gender,
          sessions: [{ authStrategy: 'google', refreshToken: 'no token' }],
          photos: profile.photos,
          externalOAuth: [{ provider: 'google', email: profile.emails[0].value, externalProfileId: profile.id }]
        }).save();

        done(null, savedUser);
      }
    }
  )
);
