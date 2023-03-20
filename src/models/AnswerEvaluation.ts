import mongoose from "mongoose";
import { AnswerEvaluationResult } from "./enums/answerEvaluationResult";

export interface IAnswerEvaluation {
  questionId: mongoose.Schema.Types.ObjectId,
  answerEvaluationResult: AnswerEvaluationResult,
}

export interface IAnswerEvaluationDocument extends IAnswerEvaluation, mongoose.Document { }
export interface IAnswerEvaluationModel extends mongoose.Model<IAnswerEvaluationDocument> {
  buildUser(args: IAnswerEvaluation): IAnswerEvaluationDocument;
}

const answerEvaluationSchema = new mongoose.Schema<IAnswerEvaluationDocument>({
  questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
  answerEvaluationResult: { type: Number, enum: [1, 2, 3, 4], required: false },
});

const AnswerEvaluation = mongoose
  .model<IAnswerEvaluationDocument, IAnswerEvaluationModel>("answerevaluations", answerEvaluationSchema);
export default AnswerEvaluation;