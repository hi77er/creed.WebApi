import { serializeUser, use } from "passport";
import { model } from "mongoose";
import { Strategy as LocalStrategy } from "passport-local";
import { IUser } from "../../../models/User";

const User = model<IUser>('User');

//Called during login/sign up.
use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password'
    },
    User.authenticate()
  )
);

//called while after logging in / signing up to set user details in req.user
serializeUser(User.serializeUser);