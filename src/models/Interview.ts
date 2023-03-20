import mongoose from "mongoose";
import { InterviewStrategy } from "./enums/interviewStrategy";

export interface IInterview {
  candidateId: mongoose.Schema.Types.ObjectId,
  strategy: InterviewStrategy,
  orderdurationMinutes: Number,
  topicIds: mongoose.Schema.Types.ObjectId[],
  questionsAskedIds: mongoose.Schema.Types.ObjectId[],
}

export interface IInterviewDocument extends IInterview, mongoose.Document { }
export interface IInterviewModel extends mongoose.Model<IInterviewDocument> {
  buildUser(args: IInterview): IInterviewDocument;
}

const interviewSchema = new mongoose.Schema<IInterview>({
  candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
  strategy: { type: Number, enum: [1, 2], required: false },
  orderdurationMinutes: { type: Number, required: true },
  topicIds: [{ type: mongoose.Schema.Types.ObjectId, required: true }],
  questionsAskedIds: [{ type: mongoose.Schema.Types.ObjectId, required: false }],
});

const Interview = mongoose.model<IInterview>("interviews", interviewSchema);

export default Interview;