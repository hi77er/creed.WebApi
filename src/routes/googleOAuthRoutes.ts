import { Router } from "express";
import { model } from "mongoose";
import passport from "passport";
import User from "../models/User";
import Session from "../models/Session";
import {
  AUTH_ACCESS_COOKIE_KEY,
  AUTH_REFRESH_COOKIE_KEY,
} from "../keys";
import {
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
  getAccessToken,
  getRefreshToken
} from "../services/auth/authenticate";

const router = Router();

router.get(
  '/',
  passport.authenticate(
    'google',
    {
      accessType: 'offline',
      prompt: 'consent',
      scope: ['profile', 'email']
    }
  )
);

// INFO: 
// This time while calling the callback from Google side, the request will contain
// information for the code that Google oauth returns\. Passport will detect this 
// request parameter and will execute another overwritten version of passport.authenticate.
// Calling this overwritten passport.authenticate method will call the GoogleStrategy's
// callback with the actual Access Token, that Google generates for us.
// passport.authenticate will set 'req.user'
router.get(
  '/callback',
  passport.authenticate('google'),
  async (req, res) => {
    const userDoc = await User.findOne({ _id: req.user._id });

    if (userDoc) {
      const accessToken = getAccessToken({ _id: userDoc._id });
      const refreshToken = getRefreshToken({ _id: userDoc._id });

      await userDoc.update({
        $set: {
          sessions: [
            { authStrategy: 'google', refreshToken },
            ...userDoc.sessions?.filter(x => x.authStrategy != 'google') || []
          ]
        }
      });

      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      res.cookie(AUTH_REFRESH_COOKIE_KEY || '', refreshToken, refreshTokenCookieOptions);
      res.cookie(AUTH_ACCESS_COOKIE_KEY || '', accessToken, accessTokenCookieOptions);
      res.redirect('http://localhost:3000/user');
    }

    res.status(400).send({ success: false, message: "Bad request." })
  }
);

export default router;