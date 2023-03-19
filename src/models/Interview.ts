import { Document, model, Schema } from "mongoose";
import { InterviewStrategy } from "./enums/InterviewStrategy";

interface IInterview extends Document {
  candidateId: Schema.Types.ObjectId,
  strategy: InterviewStrategy,
  orderdurationMinutes: Number,
  topicIds: Schema.Types.ObjectId[],
  questionsAskedIds: Schema.Types.ObjectId[],
}

const interviewSchema = new Schema<IInterview>({
  candidateId: { type: Schema.Types.ObjectId, ref: 'users', required: true },
  strategy: { type: InterviewStrategy, required: true },
  orderdurationMinutes: { type: Number, required: true },
  topicIds: [{ type: Schema.Types.ObjectId, required: true }],
  questionsAskedIds: [{ type: Schema.Types.ObjectId, required: false }],
});

export const Interview = model<IInterview>("interviews", interviewSchema);