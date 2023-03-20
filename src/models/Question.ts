import mongoose, { Document, Schema } from "mongoose";
import { ProficiencyLevel } from "./enums/proficiencyLevel";
import { ISubtopic, subtopicSchema } from "./subtopic";

export interface IQuestion extends Document {
  subtopic: ISubtopic,
  proficiencyLevels: ProficiencyLevel[],
  title: String,
  text: String
}

export const questionSchema = new Schema<IQuestion>({
  title: { type: String, required: true },
  text: { type: String, required: true },
  proficiencyLevels: [{ type: Number, enum: [1, 2, 3, 4, 5], required: true }],
  subtopic: subtopicSchema,
});

const Question = mongoose.model<IQuestion>("questions", questionSchema);

export default Question;