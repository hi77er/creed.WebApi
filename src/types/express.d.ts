declare namespace Express {
  export interface Request {
    user: IUser
  }

  export interface User {
    _id: string,
    email: string,
    emailVerified: boolean,
    firstName: string,
    lastName: string,
    username?: string,
    gender?: Gender,
    photos?: string[],
    salt?: string,
    hash?: string,
    roles?: IRole[],
    sessions?: ISessionDocument[],
    externalOAuths?: IExternalOAuth[],
  }

  export interface AuthInfo {
    errorMessage: string
  }
}