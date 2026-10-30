import mongoose from "mongoose";

export const toObjectId = (value) => new mongoose.Types.ObjectId(String(value));