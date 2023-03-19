import { Document, model, Schema } from "mongoose";

export interface ITopic extends Document {
  name: String,
  order: Number
}

let TopicSchema = new Schema<ITopic>({
  name: { type: String, required: true },
  order: { type: Number, required: true }
});

export const Topic = model<ITopic>("topics", TopicSchema);