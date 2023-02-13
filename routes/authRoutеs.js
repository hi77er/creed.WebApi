const passport = require("passport");

module.exports = (app) => {
  app.get(
    '/oauth/google',
    passport.authenticate(
      'google',
      { scope: ['profile', 'email'] }
    )
  );

  // INFO: 
  // This time while calling the callback from Google side, the request will contain
  // information for the code that Google oauth returns\. Passport will detect this 
  // request parameter and will execute another overwritten version of passport.authenticate.
  // Calling this overwritten passport.authenticate method will call the GoogleStrategy's
  // callback with the actual Access Token, that Google generates for us.
  app.get(
    '/oauth/google/callback',
    passport.authenticate('google')
  );

  app.get(
    '/api/logout',
    (req, res) => {
      req.logout();
      res.send(req.user);
    }
  );

  app.get(
    '/api/user/current',
    (req, res) => {
      console.log(req.user)
      res.send(req.user);
    }
  );

};