const express = require("express");
const passport = require("passport");

const router = express.Router();

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
  passport.authenticate('google')
);

module.exports = router;