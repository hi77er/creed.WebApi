require('dotenv').config();
const mongoose = require("mongoose");
const passport = require("passport");
const GitHubStrategy = require("passport-github2").Strategy;
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
  new GitHubStrategy(
    {
      clientID: process.env.AUTH_GITHUB_CLIENT_ID,
      clientSecret: process.env.AUTH_GITHUB_CLIENT_SECRET,
      callbackURL: process.env.AUTH_GITHUB_CALLBACK,
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
                { authStrategy: 'github', refreshToken: 'no token' },
                ...existingUser.sessions.filter(x => x.authStrategy != 'github')
              ],
              externalOAuth: [
                {
                  provider: 'github',
                  email: profile.emails[0].value,
                  externalProfileId: profile.id
                },
                ...existingUser.externalOAuth.filter(x => x.provider != 'github')
              ]
            }
          }
        );

        done(null, existingUser);
      } else {
        const savedUser = await new User({
          email: profile.emails[0].value,
          username: profile.username,
          gender: profile.gender,
          sessions: [{ authStrategy: 'github', refreshToken: 'no token' }],
          photos: profile.photos,
          externalOAuth: [{ provider: 'github', email: profile.emails[0].value, externalProfileId: profile.id }]
        }).save();

        done(null, savedUser);
      }
    }
  )
);
