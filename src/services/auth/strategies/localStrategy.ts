import passport from "passport";
import { Strategy as LocalStrategy, IStrategyOptions } from "passport-local";
import { User } from "../../../models";

const opts: IStrategyOptions = {
  usernameField: 'email',
  passwordField: 'password'
};

//Called during login/sign up.
passport.use(
  new LocalStrategy(opts, User.authenticate())
);

//called while after logging in / signing up to set user details in req.user
passport.serializeUser(User.serializeUser);