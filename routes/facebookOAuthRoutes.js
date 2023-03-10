const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
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

router.get(
  '/',
  passport.authenticate(
    'facebook',
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
  passport.authenticate('facebook'),
  async (req, res) => {
    const signedUser = await User.findOne({ _id: req.user._id });
    const accessToken = getAccessToken({ _id: signedUser._id });
    const refreshToken = getRefreshToken({ _id: signedUser._id });

    signedUser.sessions = [
      { authStrategy: 'facebook', refreshToken },
      ...signedUser.sessions.filter(x => x.authStrategy != 'facebook')
    ];

    await signedUser.save();

    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.cookie(AUTH_REFRESH_COOKIE_KEY, refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);
    res.cookie(AUTH_ACCESS_COOKIE_KEY, accessToken, ACCESS_TOKEN_COOKIE_OPTIONS);
    res.redirect('http://localhost:3000/user');
  }
);

module.exports = router;