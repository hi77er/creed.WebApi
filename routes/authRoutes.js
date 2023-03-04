require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const router = express.Router();
const User = mongoose.model('users');
const {
  AUTH_ACCESS_COOKIE_KEY,
  ACCESS_TOKEN_COOKIE_OPTIONS,
  AUTH_REFRESH_COOKIE_KEY,
  REFRESH_TOKEN_COOKIE_OPTIONS,
  getAccessToken,
  getRefreshToken
} = require("../services/auth/authenticate");

const returnUnauthorized = (res) => {
  res.statusCode = 401;
  res.send("Unauthorized");
};

router.post("/signup", (req, res) => {
  // Verify that first name is not empty
  if (!req.body.email)
    res.send({ name: "MissingEmailError", message: "The 'Email' is required." });
  else if (!req.body.password)
    res.send({ name: "MissingPasswordError", message: "The 'Password' is required." });
  else if (!req.body.firstName)
    res.send({ name: "MissingFirstNameError", message: "The 'First name' is required." });
  else if (!req.body.lastName)
    res.send({ name: "MissingLastNameError", message: "The 'Last name' is required." });
  else {
    User
      .findOne({ email: req.body.email })
      .then(async (existingUser) => {
        if (existingUser)
          res.send({ name: "ExistingUserError", message: "User with such 'Email' already exists." });
        else {
          const newUser = new User({
            email: req.body.email,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            gender: req.body.gender
          });

          const registeredUser = await User.register(newUser, req.body.password);
          const accessToken = getAccessToken({ _id: registeredUser._id });
          const refreshToken = getRefreshToken({ _id: registeredUser._id });

          registeredUser.sessions = [
            { authStrategy: 'jwt', refreshToken },
            ...registeredUser.sessions.filter(x => x.authStrategy != 'jwt')
          ];

          await registeredUser.save();
          res.cookie(AUTH_REFRESH_COOKIE_KEY, refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);
          res.cookie(AUTH_ACCESS_COOKIE_KEY, accessToken, ACCESS_TOKEN_COOKIE_OPTIONS);
          res.send({ success: true, accessToken });
        }
      });
  }
});

router.post(
  "/signin",
  passport.authenticate("local"),
  async (req, res) => {
    const existingUser = await User.findOne({ email: req.body.email });

    const accessToken = getAccessToken({ _id: req.user._id });
    const refreshToken = getRefreshToken({ _id: req.user._id });

    await existingUser.update({
      $set: {
        sessions: [
          { authStrategy: 'jwt', refreshToken },
          ...existingUser.sessions.filter(x => x.authStrategy != 'jwt')
        ]
      }
    });

    res.cookie(AUTH_REFRESH_COOKIE_KEY, refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);
    res.cookie(AUTH_ACCESS_COOKIE_KEY, accessToken, ACCESS_TOKEN_COOKIE_OPTIONS);
    // INFO: Configure usage of Access and Refresh tokens:
    // Response data: accessToken, refreshToken
    res.send({ success: true, accessToken });
  });

router.post(
  "/refresh",
  async (req, res) => {
    const { signedCookies = {} } = req;
    // INFO: An alternative to getting refresh token from the (refresh) session is
    // passing it in the body of the refresh token request. Then we'll not need the session. 

    const refreshToken = req.body.refreshToken || signedCookies[AUTH_REFRESH_COOKIE_KEY];

    if (refreshToken) {
      try {
        const payload = jwt.verify(refreshToken, process.env.AUTH_REFRESH_TOKEN_SECRET);
        const userId = payload._id;

        const user = await User.findOne({ _id: userId });
        if (user) {
          // Find the refresh token against the user record in database
          const tokenIndex = user
            .sessions
            .findIndex((session) => session.refreshToken === refreshToken);

          if (tokenIndex === -1) {
            returnUnauthorized(res);
          } else {
            const newAccessToken = getAccessToken({ _id: userId });
            const newRefreshToken = getRefreshToken({ _id: userId });

            user.sessions = user
              .sessions
              .map((session) => {
                if (session._id === user.sessions[tokenIndex]._id)
                  session.refreshToken = newRefreshToken;
                return session;
              });

            await user.save();

            res.cookie(AUTH_REFRESH_COOKIE_KEY, newRefreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);
            res.cookie(AUTH_ACCESS_COOKIE_KEY, newAccessToken, ACCESS_TOKEN_COOKIE_OPTIONS);
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
    req.logout();

    res.clearCookie(process.env.AUTH_ACCESS_COOKIE_KEY, { httpOnly: true, signed: true, path: '/' });
    res.clearCookie(process.env.AUTH_REFRESH_COOKIE_KEY, { httpOnly: true, signed: true, path: '/' });

    res
      .status(200)
      .send({ success: true });
  }
);

module.exports = router;