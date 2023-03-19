import { Document, model, Model, PassportLocalModel, Schema } from "mongoose";

export interface ISession {
  authStrategy: string,
  refreshToken: string
};
export interface ISessionDocument extends ISession, Document { }
export interface ISessionModel extends Model<ISessionDocument> { }

export const SessionSchema = new Schema<ISessionDocument>({
  authStrategy: { type: String, required: true },
  refreshToken: { type: String, required: true }
});

export default model<ISessionDocument, ISessionModel>("sessions", SessionSchema);