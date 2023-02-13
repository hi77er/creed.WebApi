const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let QuestionSchema = new Schema({
  subtopic: { type: Schema.Types.ObjectId, ref: 'subtopic', required: true },
  proficiencyLevels: [{ type: Number, required: true }],
  title: { type: String, required: true },
  text: { type: String, required: true },
});

module.exports = Question = mongoose.model("questions", QuestionSchema);