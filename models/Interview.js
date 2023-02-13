const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let InterviewSchema = new Schema({
  candidateId: { type: Schema.Types.ObjectId, ref: 'users', required: true },
  strategy: { type: Number, required: true },
  orderdurationMinutes: { type: Number, required: true },
  topics: [{ type: Schema.Types.ObjectId, ref: 'topics', required: true }],
  questionsAsked: [{ type: Schema.Types.ObjectId, ref: 'questions', required: false }],
});

module.exports = Interview = mongoose.model("interviews", InterviewSchema);