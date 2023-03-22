import { User } from "../../../models";
import passport from "passport";
import { Strategy as FacebookStrategy, StrategyOption } from "passport-facebook";
import {
  AUTH_FACEBOOK_CLIENT_ID,
  AUTH_FACEBOOK_CLIENT_SECRET,
  AUTH_FACEBOOK_CALLBACK
} from '../../../keys';

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

const opts: StrategyOption = {
  clientID: AUTH_FACEBOOK_CLIENT_ID || '',
  clientSecret: AUTH_FACEBOOK_CLIENT_SECRET || '',
  callbackURL: AUTH_FACEBOOK_CALLBACK || '',
  profileFields: ["email", "name"],
  enableProof: true
};

passport.use(
  new FacebookStrategy(
    opts,
    async (accessToken, refreshToken, profile, done) => {
      if (!profile || !profile.emails || !profile.emails[0] || !profile.emails[0].value) {
        done('Unauthorized', null);
      } else {
        const existingUser = await User.findOne({ email: profile.emails[0].value });

        if (existingUser) {
          await existingUser.update(
            {
              $set: {
                sessions: [
                  { authStrategy: 'facebook', refreshToken: 'no token' },
                  ...existingUser?.sessions?.filter(x => x.authStrategy != 'facebook') || []
                ],
                externalOAuth: [
                  {
                    provider: 'facebook',
                    email: profile.emails[0].value,
                    externalProfileId: profile.id,
                  },
                  ...existingUser?.externalOAuths?.filter(x => x.provider != 'facebook') || []
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
    }
  )
);