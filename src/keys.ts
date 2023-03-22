import dotenv from 'dotenv'

dotenv.config();

export const NODE_ENV: string | undefined = process.env.NODE_ENV
export const PORT: string | undefined = process.env.PORT
export const CORS_WHITELISTED_DOMAINS: string | undefined = process.env.CORS_WHITELISTED_DOMAINS
export const MONGO_DB_CONNECTION_STRING: string | undefined = process.env.MONGO_DB_CONNECTION_STRING

export const AUTH_FACEBOOK_CLIENT_ID: string | undefined = process.env.AUTH_FACEBOOK_CLIENT_ID
export const AUTH_FACEBOOK_CLIENT_SECRET: string | undefined = process.env.AUTH_FACEBOOK_CLIENT_SECRET
export const AUTH_FACEBOOK_CALLBACK: string | undefined = process.env.AUTH_FACEBOOK_CALLBACK

export const AUTH_GITHUB_CLIENT_ID: string | undefined = process.env.AUTH_GITHUB_CLIENT_ID
export const AUTH_GITHUB_CLIENT_SECRET: string | undefined = process.env.AUTH_GITHUB_CLIENT_SECRET
export const AUTH_GITHUB_CALLBACK: string | undefined = process.env.AUTH_GITHUB_CALLBACK

export const AUTH_GOOGLE_CLIENT_ID: string | undefined = process.env.AUTH_GOOGLE_CLIENT_ID
export const AUTH_GOOGLE_CLIENT_SECRET: string | undefined = process.env.AUTH_GOOGLE_CLIENT_SECRET
export const AUTH_GOOGLE_CALLBACK = process.env.AUTH_GOOGLE_CALLBACK

export const AUTH_ACCESS_COOKIE_KEY: string | undefined = process.env.AUTH_ACCESS_COOKIE_KEY
export const AUTH_ACCESS_TOKEN_SECRET: string | undefined = process.env.AUTH_ACCESS_TOKEN_SECRET
export const AUTH_ACCESS_TOKEN_EXPIRY_SECONDS: string | undefined = process.env.AUTH_ACCESS_TOKEN_EXPIRY_SECONDS

export const AUTH_REFRESH_COOKIE_KEY: string | undefined = process.env.AUTH_REFRESH_COOKIE_KEY
export const AUTH_REFRESH_TOKEN_SECRET: string | undefined = process.env.AUTH_REFRESH_TOKEN_SECRET
export const AUTH_REFRESH_TOKEN_EXPIRY_SECONDS: string | undefined = process.env.AUTH_REFRESH_TOKEN_EXPIRY_SECONDS
