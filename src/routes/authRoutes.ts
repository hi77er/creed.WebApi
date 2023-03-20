import { Router } from "express";
import { body, validationResult } from 'express-validator';
import User from "../models/user";
import passport from "passport";
import jwt, { JwtPayload } from "jsonwebtoken";
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

const returnUnauthorized = (res) => {
  res.statusCode = 401;
  res.send("Unauthorized");
};

router.post("/signup", [
  body('email').isEmail().withMessage({ name: "MissingEmailError", message: "The 'Email' is required." }),
  body('password').isStrongPassword().withMessage({ name: "MissingPasswordError", message: "The 'Password' is required." }),
  body('firstName').notEmpty().withMessage({ name: "MissingFirstNameError", message: "The 'First name' is required." }),
  body('lastName').notEmpty().withMessage({ name: "MissingLastNameError", message: "The 'Last name' is required." })
], (req, res) => {
  const errors = validationResult(req);
  // Verify that first name is not empty
  if (!errors.isEmpty()) {
    return res.status(400).send({ errors: errors.array() });
  } else {
    User
      .findOne({ email: req.body.email })
      .then(async (existingUser) => {
        if (existingUser) {
          return res.status(400).send([{ name: "ExistingUserError", message: "User with such 'Email' already exists." }]);
        }
        else {
          const newUser = new User({
            email: req.body.email,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            gender: req.body.gender
          });

          const registeredUser = await User.register(newUser, req.body.password);
          const userDoc = await User.findOne({ email: registeredUser.email });

          if (userDoc) {
            const accessToken: string = getAccessToken({ _id: userDoc._id });
            const refreshToken: string = getRefreshToken({ _id: userDoc._id });

            await userDoc.update({
              $set: {
                sessions: [
                  { authStrategy: 'jwt', refreshToken },
                  ...userDoc.sessions?.filter(x => x.authStrategy != 'jwt') || []
                ]
              }
            });

            res.cookie(AUTH_REFRESH_COOKIE_KEY || '', refreshToken, refreshTokenCookieOptions);
            res.cookie(AUTH_ACCESS_COOKIE_KEY || '', accessToken, accessTokenCookieOptions);
            return res.status(201).send({ success: true, accessToken });
          }

          return res.status(500).send([{ success: false, message: "Something went wrong!" }]);
        }
      });
  }
});

router.post(
  "/signin",
  passport.authenticate("local"),
  async (req, res) => {
    const existingUser = await User.findOne({ email: req.body.email });

    if (existingUser) {
      const accessToken = getAccessToken({ _id: req.user._id });
      const refreshToken = getRefreshToken({ _id: req.user._id });

      await existingUser.update({
        $set: {
          sessions: [
            { authStrategy: 'jwt', refreshToken },
            ...existingUser.sessions?.filter(x => x.authStrategy != 'jwt') || []
          ]
        }
      });

      res.cookie(AUTH_REFRESH_COOKIE_KEY || '', refreshToken, refreshTokenCookieOptions);
      res.cookie(AUTH_ACCESS_COOKIE_KEY || '', accessToken, accessTokenCookieOptions);
      // INFO: Configure usage of Access and Refresh tokens:
      // Response data: accessToken, refreshToken
      res.send({ success: true, accessToken });
    }

    res.status(400).send({ success: true, message: "Bad request." });
  });

router.post(
  "/refresh",
  async (req, res) => {
    const { signedCookies = {} } = req;
    // INFO: An alternative to getting refresh token from the (refresh) session is
    // passing it in the body of the refresh token request. Then we'll not need the session. 

    const refreshToken = req.body.refreshToken || signedCookies[AUTH_REFRESH_COOKIE_KEY || ''];
    if (refreshToken) {
      try {
        const payload = jwt.verify(refreshToken, process.env.AUTH_REFRESH_TOKEN_SECRET || '') as JwtPayload;
        const userId = payload._id;

        const user = await User.findOne({ _id: userId });
        if (user) {
          // Find the refresh token against the user record in database
          const tokenIndex = user
            .sessions
            ?.findIndex((session) => session.refreshToken === refreshToken) || -1;

          if (tokenIndex === -1) {
            returnUnauthorized(res);
          } else {
            const newAccessToken = getAccessToken({ _id: userId });
            const newRefreshToken = getRefreshToken({ _id: userId });

            user.sessions = user
              .sessions
              ?.map((session) => {
                if (session && user.sessions && session._id === user.sessions[tokenIndex]._id)
                  session.refreshToken = newRefreshToken;
                return session;
              }) || [];

            await user.save();

            res.cookie(AUTH_REFRESH_COOKIE_KEY || '', newRefreshToken, refreshTokenCookieOptions);
            res.cookie(AUTH_ACCESS_COOKIE_KEY || '', newAccessToken, accessTokenCookieOptions);
            // INFO: Configure usage of Access and Refresh tokens:
            // Response data: accessToken, refreshToken
            res.send({ success: true });
          }
        } else {
          returnUnauthorized(res);
        }
      } catch (err) {
        returnUnauthorized(res);
      }
    } else {
      returnUnauthorized(res);
    }
  });

router.get(
  '/signout',
  (req, res) => {
    req.logout({}, () => { });

    res.clearCookie(AUTH_ACCESS_COOKIE_KEY || '', { httpOnly: true, signed: true, path: '/' });
    res.clearCookie(AUTH_REFRESH_COOKIE_KEY || '', { httpOnly: true, signed: true, path: '/' });

    res.status(200).send({ success: true });
  }
);

export default router;