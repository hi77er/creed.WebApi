require('dotenv').config();
const mongoose = require("mongoose");
const passport = require("passport");
const FacebookStrategy = require("passport-facebook").Strategy;
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
  new FacebookStrategy(
    {
      clientID: process.env.AUTH_FACEBOOK_CLIENT_ID,
      clientSecret: process.env.AUTH_FACEBOOK_CLIENT_SECRET,
      callbackURL: process.env.AUTH_FACEBOOK_CALLBACK,
      profileFields: ["email", "name"],
      enableProof: true
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
                { authStrategy: 'facebook', refreshToken: 'no token' },
                ...existingUser.sessions.filter(x => x.authStrategy != 'facebook')
              ],
              externalOAuth: [
                {
                  provider: 'facebook',
                  email: profile.emails[0].value,
                  externalProfileId: profile.id,
                },
                ...existingUser.externalOAuth.filter(x => x.provider != 'facebook')
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
          username: profile.username,
          gender: profile.gender,
          sessions: [{ authStrategy: 'facebook', refreshToken: 'no token' }],
          photos: profile.photos,
          externalOAuth: [{ provider: 'facebook', email: profile.emails[0].value, externalProfileId: profile.id }]
        }).save();

        done(null, savedUser);
      }
    }
  )
);
