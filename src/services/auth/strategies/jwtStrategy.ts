import passport from "passport";
import { Strategy as JwtStrategy, StrategyOptions } from "passport-jwt";
import { User } from "../../../models";
import {
  AUTH_ACCESS_COOKIE_KEY,
  AUTH_ACCESS_TOKEN_SECRET,
} from "../../../keys";

const getBearerFromAuthHeader = (req) => {
  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
    return req.headers.authorization.split(' ')[1];
  }
  return null;
};

const jwtExtractor = (req) => {
  const { signedCookies = {} } = req;
  const accessToken = signedCookies[AUTH_ACCESS_COOKIE_KEY || ''] || getBearerFromAuthHeader(req);
  return accessToken;
};

// INFO: The JWT Strategy checks both:
//    - the Signed cookies for cookie AUTH_ACCESS_COOKIE_KEY
//    - and the request body for 'accessToken' parameter
const opts: StrategyOptions = {
  jwtFromRequest: jwtExtractor,
  secretOrKey: AUTH_ACCESS_TOKEN_SECRET
};

// Used by the authenticated requests to deserialize the user,
// i.e., to fetch user details from the JWT.
passport.use(
  new JwtStrategy(
    opts,
    (decodedJwtPayload, done) => {
      if (Date.now() > (decodedJwtPayload.exp * 1000)) {
        done('Unauthorized', false, { errorMessage: 'expired' });
      }

      User
        .findOne({ _id: decodedJwtPayload._id })
        .then((user) => {
          return user ? done(null, user) : done(null, false)
        });
    })
);