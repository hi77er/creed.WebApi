import passport from "passport";
import { Strategy as GoogleStrategy, StrategyOptions } from "passport-google-oauth20";
import { User } from "../../../models";
import {
  AUTH_GOOGLE_CLIENT_ID,
  AUTH_GOOGLE_CLIENT_SECRET,
  AUTH_GOOGLE_CALLBACK,
} from "../../../keys";

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser((email, done) => {
  User
    .findOne({ email })
    .then((user) => {
      done(null, user);
    });
});

const opts: StrategyOptions = {
  clientID: AUTH_GOOGLE_CLIENT_ID || '',
  clientSecret: AUTH_GOOGLE_CLIENT_SECRET || '',
  callbackURL: AUTH_GOOGLE_CALLBACK,
  proxy: true
};

passport.use(
  new GoogleStrategy(
    opts,
    async (accessToken, refreshToken, profile, done) => {
      if (!profile || !profile.emails || !profile.emails[0] || !profile.emails[0].value) {
        done('Unauthorized', undefined);
      } else {
        const existingUser = await User.findOne({ email: profile.emails[0].value });

        if (existingUser) {
          await existingUser.update(
            {
              $set: {
                sessions: [
                  { authStrategy: 'google', refreshToken: 'no token' },
                  ...existingUser?.sessions?.filter(x => x.authStrategy != 'google') || []
                ],
                externalOAuth: [
                  {
                    provider: 'google',
                    email: profile.emails[0].value,
                    externalProfileId: profile.id
                  },
                  ...existingUser?.externalOAuths?.filter(x => x.provider != 'google') || []
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
            sessions: [{ authStrategy: 'google', refreshToken: 'no token' }],
            photos: profile.photos,
            externalOAuth: [{ provider: 'google', email: profile.emails[0].value, externalProfileId: profile.id }]
          }).save();

          done(null, savedUser);
        }
      }
    }
  )
);