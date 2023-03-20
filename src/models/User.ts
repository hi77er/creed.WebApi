import { Document, model, PassportLocalModel, Schema } from "mongoose";
import passportLocalMongoose from "passport-local-mongoose";
import { DuplicatedUserError } from "../errors";
import { Gender } from "./enums/gender";
import { ISessionDocument, SessionSchema } from "./session";

export interface IExternalOAuth extends Document {
  provider: string,
  externalProfileId: string,
  email: string
};

export interface IRole extends Document {
  name: string
};

export interface IUser {
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
export interface IUserDocument extends IUser, Document { }
export interface IUserModel extends PassportLocalModel<IUserDocument> {
  buildUser(args: IUser): IUserDocument;
}

const ExternalOAuthSchema = new Schema<IExternalOAuth>({
  provider: { type: String, required: true },
  externalProfileId: { type: String, required: true },
  email: { type: String, required: true }
});

const RoleSchema = new Schema<IRole>({
  name: { type: String, required: true },
});

// Schema
const userSchema = new Schema<IUserDocument>({
  email: { type: String, required: true, unique: true },
  emailVerified: { type: Boolean },
  firstName: { type: String, required: false },
  lastName: { type: String, required: false },
  username: { type: String, required: false, unique: false },
  gender: { type: Number, enum: [1, 2, 3], required: false },
  photos: [{ type: { value: String } }],
  salt: { type: String },
  hash: { type: String },
  roles: [RoleSchema],
  sessions: [SessionSchema],
  externalOAuths: [ExternalOAuthSchema],
});

userSchema.plugin(passportLocalMongoose, { usernameField: 'email' });

userSchema.pre('save', async function preSaveFunction(this: IUserDocument, next) {
  const existing = await User.findOne({ email: this.email });
  if (existing)
    throw new DuplicatedUserError();
  next();
});

const User = model<IUserDocument, IUserModel>("users", userSchema);

export default User;