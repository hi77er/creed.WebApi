import { Document, model, Schema } from "mongoose";
import { ProficiencyLevel } from "./enums/ProficiencyLevel";

interface IQuestion extends Document {
  subtopicId: Schema.Types.ObjectId,
  proficiencyLevels: ProficiencyLevel[],
  title: String,
  text: String
}

const questionSchema = new Schema<IQuestion>({
  subtopicId: { type: Schema.Types.ObjectId, ref: 'subtopic', required: true },
  proficiencyLevels: [{ type: ProficiencyLevel, required: true }],
  title: { type: String, required: true },
  text: { type: String, required: true },
});

export const Question = model<IQuestion>("questions", questionSchema);