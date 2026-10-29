import "dotenv/config";
import mongoose from "mongoose";
import Category from "../models/Category.js";
import { categories } from "./categories.data.js";

await mongoose.connect(process.env.MONGO_URI);

for (const [index, data] of categories.entries()) {
  const exists = await Category.findOne({ name: data.name });
  if (!exists) {
    await Category.create({ ...data, sortOrder: index }); // save() se slug banta hai
    console.log("Created:", data.name);
  }
}

console.log("Categories ready:", await Category.countDocuments());
await mongoose.disconnect();