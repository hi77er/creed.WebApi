import mongoose from "mongoose";
import { MONGO_DB_CONNECTION_STRING } from "../keys";

export const connectMongoDb = async () => {
  try {
    mongoose.set('strictQuery', false);

    await mongoose.connect(MONGO_DB_CONNECTION_STRING || '');
    console.log("MongoDB connected.")

  } catch (err) {
    console.log("MongoDB ERROR during connection.")
  }
};