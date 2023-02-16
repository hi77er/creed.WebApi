const passport = require("passport");
const mongoose = require("mongoose");
const LocalStrategy = require("passport-local").Strategy;
const User = mongoose.model('users');

//Called during login/sign up.
passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password'
    },
    User.authenticate()
  )
);

//called while after logging in / signing up to set user details in req.user
passport.serializeUser(User.serializeUser());