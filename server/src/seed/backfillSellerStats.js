import "dotenv/config";
import mongoose from "mongoose";
import FreelancerProfile from "../models/FreelancerProfile.js";
import Gig from "../models/Gig.js";
import { recomputeSellerStats } from "../services/sellerService.js";
import { recomputeGigRating } from "../services/reviewService.js";

await mongoose.connect(process.env.MONGO_URI);

for (const profile of await FreelancerProfile.find().select("user")) {
  const stats = await recomputeSellerStats(profile.user);
  console.log("Seller", String(profile.user), stats);
}
for (const gig of await Gig.find().select("_id")) {
  await recomputeGigRating(gig._id);
}

console.log("Done");
await mongoose.disconnect();