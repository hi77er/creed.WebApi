require('dotenv').config();
const { signedCookie } = require("cookie-parser");
const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const jwt = require("jsonwebtoken");

const { getToken, COOKIE_OPTIONS, getRefreshToken } = require("../services/auth/authenticate");
const User = mongoose.model('users');
const router = express.Router();

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

          User
            .register(newUser, req.body.password)
            .then((registeredUser) => {
              const token = getToken({ _id: registeredUser._id });
              const refreshToken = getRefreshToken({ _id: registeredUser._id });
              registeredUser.sessions.push({ authStrategy: 'jwt', refreshToken });

              registeredUser
                .save()
                .then((savedUser) => {
                  res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);
                  res.send({ success: true, token });
                });
            });
        }
      });
  }
});

router.post(
  "/signin",
  passport.authenticate("local"),
  async (req, res, next) => {
    const token = getToken({ _id: req.user._id });
    const refreshToken = getRefreshToken({ _id: req.user._id });

    const existingUser = await User.findOne({ _id: req.user._id });

    await existingUser.update({
      $set: {
        sessions: [
          { authStrategy: 'jwt', refreshToken },
          ...existingUser.sessions.filter(x => x.authStrategy != 'jwt')
        ]
      }
    });

    res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);
    res.send({ success: true, token });
  });

router.post(
  "/refresh",
  async (req, res, next) => {
    const { signedCookies = {} } = req;
    const { refreshToken } = signedCookies;

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
            const token = getToken({ _id: userId });
            // If the refresh token exists, then create new one and replace it.
            const newRefreshToken = getRefreshToken({ _id: userId });

            user.sessions = user
              .sessions
              .map((session) => {
                if (session._id === user.sessions[tokenIndex]._id)
                  session.refreshToken = newRefreshToken;
                return session;
              });

            await user.save();

            res.cookie("refreshToken", newRefreshToken, COOKIE_OPTIONS);
            res.send({ success: true, token });
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
    res.send(req.user);
  }
);

module.exports = router;