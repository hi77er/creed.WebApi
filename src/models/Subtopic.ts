import { Document, model, Schema } from "mongoose";

interface ISubtopic extends Document {
  topicId: Schema.Types.ObjectId,
  name: String,
  orderInTopic: Number,
};

const subtopicSchema = new Schema<ISubtopic>({
  topicId: { type: Schema.Types.ObjectId, required: true },
  name: { type: String, required: true },
  orderInTopic: { type: Number, required: true },
});

export const Subtopic = model<ISubtopic>("subtopics", subtopicSchema);