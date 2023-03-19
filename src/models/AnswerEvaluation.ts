import { Document, model, Schema } from "mongoose";
import { AnswerEvaluationResult } from "./enums/AnswerEvaluationResult";

interface IAnswerEvaluation extends Document {
  questionId: Schema.Types.ObjectId,
  answerEvaluationResult: AnswerEvaluationResult,
}

const answerEvaluationSchema = new Schema<IAnswerEvaluation>({
  questionId: { type: Schema.Types.ObjectId, required: true },
  answerEvaluationResult: { type: AnswerEvaluationResult, required: true },
});

export const AnswerEvaluation = model<IAnswerEvaluation>("AnswerEvaluation", answerEvaluationSchema);