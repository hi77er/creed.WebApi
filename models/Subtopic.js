const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let SubtopicSchema = new Schema({
  topic: { type: Schema.Types.ObjectId, ref: 'topics', required: true },
  name: { type: String, required: true },
  orderInTopic: { type: Number, required: true },
});

module.exports = Subtopic = mongoose.model("subtopics", SubtopicSchema);