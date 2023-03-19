declare namespace Express {
  export interface Request {
    user: IUser
  }

  export interface User {
    _id: string,
    email: string,
    emailVerified: Boolean,
    firstName: string,
    lastName: string,
    username: string,
    gender: string,
    photos: string[],
    salt: string,
    hash: string,
    roles: IRole[],
    sessions: ISession[],
    externalOAuth: IExternamOAuth[]
  }

  export interface AuthInfo {
    errorMessage: string
  }
}