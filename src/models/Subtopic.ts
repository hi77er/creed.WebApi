import mongoose from "mongoose";
import { ITopic, topicSchema } from "./topic";

export interface ISubtopic extends mongoose.Document {
  topic: ITopic,
  name: String,
  orderInTopic: Number,
};

export const subtopicSchema = new mongoose.Schema<ISubtopic>({
  topic: topicSchema,
  name: { type: String, required: true },
  orderInTopic: { type: Number, required: true },
});

const Subtopic = mongoose.model<ISubtopic>("subtopics", subtopicSchema);

export default Subtopic;