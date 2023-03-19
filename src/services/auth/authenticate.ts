import { CookieOptions } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import {
  AUTH_ACCESS_TOKEN_EXPIRY_SECONDS,
  AUTH_REFRESH_TOKEN_EXPIRY_SECONDS,
  NODE_ENV
} from '../../keys';

const production = NODE_ENV === "production";

export const accessTokenCookieOptions: CookieOptions = {
  httpOnly: true,
  signed: true,
  maxAge: 1000 * eval(AUTH_ACCESS_TOKEN_EXPIRY_SECONDS || ''),
  sameSite: 'lax',
  // Since localhost is not having https protocol,
  // secure cookies do not work correctly (in postman)
  secure: production,
};

export const refreshTokenCookieOptions: CookieOptions = {
  httpOnly: true,
  signed: true,
  maxAge: 1000 * eval(AUTH_REFRESH_TOKEN_EXPIRY_SECONDS || ''),
  sameSite: 'lax',
  // Since localhost is not having https protocol,
  // secure cookies do not work correctly (in postman)
  secure: production,
  expires: undefined,
  path: undefined,
  domain: undefined,
  encode: undefined
};

export const getAccessToken = (user) => {
  const accessToken = jwt
    .sign(user, process.env.AUTH_ACCESS_TOKEN_SECRET || '', {
      expiresIn: eval(process.env.AUTH_ACCESS_TOKEN_EXPIRY_SECONDS || '')
    });

  return accessToken;
};

export const getRefreshToken = (user) => {
  const refreshToken = jwt
    .sign(user, process.env.AUTH_REFRESH_TOKEN_SECRET || '', {
      expiresIn: eval(process.env.AUTH_REFRESH_TOKEN_EXPIRY_SECONDS || '')
    });

  return refreshToken;
};

export const verifyUser = passport.authenticate("jwt", { session: false });