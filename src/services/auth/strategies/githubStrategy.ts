import { model } from "mongoose";
import { serializeUser, deserializeUser, use } from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import { User } from "../../../models";
import {
  AUTH_GITHUB_CLIENT_ID,
  AUTH_GITHUB_CLIENT_SECRET,
  AUTH_GITHUB_CALLBACK,
} from "../../../keys";

serializeUser((user, done) => {
  done(null, user._id);
});

deserializeUser((email, done) => {
  User
    .findOne({ email })
    .then((user) => {
      done(null, user);
    });
});

use(
  new GitHubStrategy(
    {
      clientID: AUTH_GITHUB_CLIENT_ID || '',
      clientSecret: AUTH_GITHUB_CLIENT_SECRET || '',
      callbackURL: AUTH_GITHUB_CALLBACK || '',
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
                ...existingUser?.sessions?.filter(x => x.authStrategy != 'github') || []
              ],
              externalOAuth: [
                {
                  provider: 'github',
                  email: profile.emails[0].value,
                  externalProfileId: profile.id
                },
                ...existingUser?.externalOAuths?.filter(x => x.provider != 'github') || []
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
