const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let TopicSchema = new Schema({
  name: { type: String, required: true },
  order: { type: Number, required: true },
});

module.exports = Topic = mongoose.model("topics", TopicSchema);