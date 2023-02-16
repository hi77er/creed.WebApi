const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const router = express.Router();
const User = mongoose.model('users');
const { getAccessToken, COOKIE_OPTIONS, getRefreshToken } = require("../services/auth/authenticate");

router.get(
  '/',
  passport.authorize(
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
    const signedUser = await User.findOne({ _id: req.user._id });
    const accessToken = getAccessToken({ _id: signedUser._id });
    const refreshToken = getRefreshToken({ _id: signedUser._id });

    signedUser.sessions = [
      { authStrategy: 'google', refreshToken },
      ...signedUser.sessions.filter(x => x.authStrategy != 'google')
    ];

    await signedUser.save();

    res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);
    res.send({ success: true, accessToken });
  }
);

module.exports = router;