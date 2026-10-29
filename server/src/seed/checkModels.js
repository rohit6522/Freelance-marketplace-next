import "dotenv/config";
import mongoose from "mongoose";
import "../models/index.js";

await mongoose.connect(process.env.MONGO_URI);
await Promise.all(Object.values(mongoose.models).map((m) => m.init()));
console.log("Models ready:", Object.keys(mongoose.models).join(", "));
await mongoose.disconnect();