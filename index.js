const express = require("express");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const keys = require("./config/keys");
const app = express();

passport.use(
  new GoogleStrategy(
    {
      clientID: keys.googleClientID,
      clientSecret: keys.googleClientSecret,
      callbackURL: '/oauth/google/callback'
    },
    (accessToken, refreshToken, profile, done) => {
      console.log(accessToken);
      console.log(refreshToken);
      console.log(profile);
      console.log(done);
    }
  )
);

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

app.get('/', (req, res) => {
  res.send(
    {
      version: "1.0.9",
      message: 'Hello from a serverless containerized and continuously deployed Servey Maker!'
    }
  );
})

const PORT = process.env.PORT || 5000;
app.listen(PORT);