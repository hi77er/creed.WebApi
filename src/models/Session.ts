import mongoose from "mongoose";

export interface ISession {
  authStrategy: string,
  refreshToken: string
};
export interface ISessionDocument extends ISession, mongoose.Document { }
export interface ISessionModel extends mongoose.Model<ISessionDocument> { }

export const SessionSchema = new mongoose.Schema<ISessionDocument>({
  authStrategy: { type: String, required: true },
  refreshToken: { type: String, required: true }
});

const Session = mongoose.model<ISessionDocument, ISessionModel>("sessions", SessionSchema);

export default Session;