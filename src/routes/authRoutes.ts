import { Router } from "express";
import { body, Result, ValidationError, validationResult } from 'express-validator';
import User, { IUserDocument } from "../models/user";
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
import { InvalidInputError } from "../errors";
import { DuplicatedUserError } from "../errors/duplicated-user-error";
import {
  REQUIRED_EMAIL_ERR_MSG,
  REQUIRED_PASSWORD_ERR_MSG,
  REQUIRED_FIRST_NAME_ERR_MSG,
  REQUIRED_LAST_NAME_ERR_MSG,
} from "../errors";
import { UserSignedUp } from "../events";

const router = Router();

const returnUnauthorized = (res) => {
  res.statusCode = 401;
  res.send("Unauthorized");
};

router.post("/signup", [
  body('email').isEmail().withMessage(REQUIRED_EMAIL_ERR_MSG),
  body('password').isStrongPassword().withMessage(REQUIRED_PASSWORD_ERR_MSG),
  body('firstName').notEmpty().withMessage(REQUIRED_FIRST_NAME_ERR_MSG),
  body('lastName').notEmpty().withMessage(REQUIRED_LAST_NAME_ERR_MSG)
], async (req, res) => {
  const errors: Result<ValidationError> = validationResult(req);

  if (!errors.isEmpty()) throw new InvalidInputError(errors.array());

  const newUser = new User({
    email: req.body.email,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    gender: req.body.gender
  });

  try {
    const created: IUserDocument = await User.register(newUser, req.body.password);
    const event = new UserSignedUp(created);
    return res.status(event.statusCode).send(event.serializeRest());
  } catch (err) {
    throw new DuplicatedUserError();
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

    res.status(422).send({ success: true, message: "Bad request." });
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