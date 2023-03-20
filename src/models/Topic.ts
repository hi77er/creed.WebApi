import mongoose from "mongoose";

export interface ITopic extends mongoose.Document {
  name: String,
  order: Number
}

export let topicSchema = new mongoose.Schema<ITopic>({
  name: { type: String, required: true },
  order: { type: Number, required: true }
});

const Topic = mongoose.model<ITopic>("topics", topicSchema);

export default Topic;