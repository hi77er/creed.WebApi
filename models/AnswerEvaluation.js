const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let AnswerEvaluationSchema = new Schema({
  question: { type: Schema.Types.ObjectId, ref: 'questions', required: true },
  answerEvaluationResult: { type: Number, required: true },
});

module.exports = AnswerEvaluation = mongoose.model("answerEvaluations", AnswerEvaluationSchema);