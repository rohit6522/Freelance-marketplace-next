import "dotenv/config";
import mongoose from "mongoose";
import {
  User, FreelancerProfile, PortfolioProject, Category, Gig, Order,
  Review, Favorite, Conversation, Message, Payment,
} from "../models/index.js";
import { categories } from "./categories.data.js";
import {
  PASSWORD, EMAIL_DOMAIN, clients, freelancers, elenaAccreditations, elenaWorkHistory,
  portfolio, gigData, gigFaqs, reviewComments, reviewCommentFour,
  completedOrders, activeOrders, savedGigsForApex,
} from "./seed.data.js";
import { createOrder, changeStatus, completeMilestone, releaseMilestone } from "../services/orderService.js";
import { createReview, recomputeGigRating } from "../services/reviewService.js";
import { recomputeSellerStats } from "../services/sellerService.js";
import { startConversation, sendMessage } from "../services/messageService.js";

const DAY_MS = 24 * 60 * 60 * 1000;
const WIPE_ALL = process.argv.includes("--all");
const started = Date.now();

/* ---------------------------- helpers ---------------------------- */

const isPlain = (v) =>
  v && typeof v === "object" && (Object.getPrototypeOf(v) === Object.prototype || Object.getPrototypeOf(v) === null);

// Document ke saare Date fields (nested bhi) days din peeche karta hai
const shiftValue = (v, ms) => {
  if (v instanceof Date) return new Date(v.getTime() - ms);
  if (Array.isArray(v)) return v.map((x) => shiftValue(x, ms));
  if (isPlain(v)) return Object.fromEntries(Object.entries(v).map(([k, val]) => [k, shiftValue(val, ms)]));
  return v;
};

const shiftDocs = async (Model, filter, days) => {
  const docs = await Model.collection.find(filter).toArray();
  for (const doc of docs) {
    await Model.collection.replaceOne({ _id: doc._id }, shiftValue(doc, days * DAY_MS));
  }
};

const backdate = async (orderId, days) => {
  const convIds = await Conversation.distinct("_id", { order: orderId });
  await shiftDocs(Order, { _id: orderId }, days);
  await shiftDocs(Payment, { order: orderId }, days);
  await shiftDocs(Review, { order: orderId }, days);
  await shiftDocs(Message, { conversation: { $in: convIds } }, days);
  await shiftDocs(Conversation, { _id: { $in: convIds } }, days);
};

const cleanupSeeded = async () => {
  const escaped = EMAIL_DOMAIN.replace(/\./g, "\\.");
  const ids = await User.distinct("_id", { email: new RegExp(`${escaped}$`, "i") });
  if (!ids.length) return;

  const gigIds = await Gig.distinct("_id", { freelancer: { $in: ids } });
  const convIds = await Conversation.distinct("_id", { participants: { $in: ids } });
  const involved = { $or: [{ client: { $in: ids } }, { freelancer: { $in: ids } }] };

  await Message.deleteMany({ conversation: { $in: convIds } });
  await Conversation.deleteMany({ _id: { $in: convIds } });
  await Review.deleteMany(involved);
  await Payment.deleteMany({ $or: [{ payer: { $in: ids } }, { payee: { $in: ids } }] });
  await Order.deleteMany(involved);
  await Favorite.deleteMany({ $or: [{ user: { $in: ids } }, { gig: { $in: gigIds } }] });
  await Gig.deleteMany({ freelancer: { $in: ids } });
  await PortfolioProject.deleteMany({ freelancer: { $in: ids } });
  await FreelancerProfile.deleteMany({ user: { $in: ids } });
  await User.deleteMany({ _id: { $in: ids } });
};

/* ------------------------------ main ------------------------------ */

try {
  if (WIPE_ALL && process.env.NODE_ENV === "production") {
    throw new Error("--all is not allowed in production");
  }

  await mongoose.connect(process.env.MONGO_URI);
  await Promise.all(Object.values(mongoose.models).map((m) => m.init()));

  if (WIPE_ALL) {
    console.log("Wiping ALL collections...");
    for (const Model of Object.values(mongoose.models)) await Model.deleteMany({});
  } else {
    console.log("Removing previously seeded demo data...");
    await cleanupSeeded();
  }

  // 1. Categories
  for (const [i, data] of categories.entries()) {
    if (!(await Category.findOne({ name: data.name }))) await Category.create({ ...data, sortOrder: i });
  }
  const cats = Object.fromEntries((await Category.find()).map((c) => [c.name, c]));
  console.log(`Categories: ${Object.keys(cats).length}`);

  // 2. Users and freelancer profiles
  const people = {};
  for (const p of clients) {
    people[p.key] = await User.create({
      name: p.name, email: p.email, password: PASSWORD, role: "client",
      companyName: p.companyName, country: p.country,
      avatar: { url: `https://i.pravatar.cc/200?img=${p.img}` },
    });
  }
  for (const p of freelancers) {
    people[p.key] = await User.create({
      name: p.name, email: p.email, password: PASSWORD, role: "freelancer",
      country: p.country, avatar: { url: `https://i.pravatar.cc/200?img=${p.img}` },
    });
    await FreelancerProfile.create({
      user: people[p.key]._id,
      title: p.title, bio: p.bio, skills: p.skills, languages: p.languages,
      experienceYears: p.years, location: p.location, timezone: p.tz, hourlyRate: p.rate,
      weeklyHours: 40, availability: "available",
      ...(p.key === "elena" ? { accreditations: elenaAccreditations, workHistory: elenaWorkHistory } : {}),
    });
  }
  console.log(`Users: ${clients.length} clients, ${freelancers.length} freelancers`);

  // 3. Portfolio
  for (const [i, p] of portfolio.entries()) {
    await PortfolioProject.create({
      freelancer: people[p.owner]._id,
      title: p.title, description: p.description, category: p.category,
      highlightMetric: p.metric, duration: p.duration, deliverables: p.deliverables,
      images: [{ url: `https://picsum.photos/seed/portfolio-${i}/800/500` }],
      externalLink: "https://example.com/case-study",
      displayOrder: i,
    });
  }
  console.log(`Portfolio projects: ${portfolio.length}`);

  // 4. Gigs
  const gigs = {};
  for (const [i, g] of gigData.entries()) {
    const packages = {};
    ["basic", "standard", "premium"].forEach((tier, idx) => {
      const features = g.perks.slice(0, idx + 1);
      packages[tier] = {
        name: tier[0].toUpperCase() + tier.slice(1),
        description: `${["Starter", "Standard", "Complete"][idx]} package: ${features.join(", ")}.`.slice(0, 300),
        price: g.prices[idx],
        deliveryDays: g.days[idx],
        revisions: idx === 2 ? 0 : [1, 3][idx],
        unlimitedRevisions: idx === 2,
        features,
      };
    });

    const doc = await Gig.create({
      freelancer: people[g.owner]._id,
      category: cats[g.cat]._id,
      title: g.title, description: g.desc, tags: g.tags,
      images: [1, 2, 3].map((n) => ({ url: `https://picsum.photos/seed/${g.key}-${n}/800/500` })),
      deliverables: g.perks.map((title) => ({ title, description: `${title} included in your delivery.` })),
      faqs: gigFaqs,
      packages,
      status: "published",
      views: 120 + ((i * 137) % 800),
    });
    gigs[g.key] = { doc, owner: people[g.owner], title: g.title };
  }
  console.log(`Gigs: ${gigData.length}`);

  // 5. Orders (real services, phir dates peeche)
  const runOrder = async (spec, index) => {
    const client = people[spec.client];
    const { doc, owner, title } = gigs[spec.gig];

    const order = await createOrder(client, {
      gigId: doc._id,
      tier: spec.tier,
      requirements: `Requirements for "${title}": follow the scope in the gig description and share a preview at each milestone.`,
    });
    const id = order._id;
    const move = (user, toStatus, payload = {}) => changeStatus({ orderId: id, user, toStatus, payload });

    if (spec.state === "cancelled") {
      await move(client, "cancelled", { note: "Order cancelled", reason: "Project scope changed" });
    } else if (spec.state !== "pending") {
      await move(owner, "in_progress", { note: "Order accepted" });

      if (spec.state === "progress") {
        const fresh = await Order.findById(id);
        for (let m = 0; m < (spec.milestones || 0); m++) {
          const milestoneId = fresh.milestones[m]._id;
          await completeMilestone({ orderId: id, milestoneId, user: owner });
          await releaseMilestone({ orderId: id, milestoneId, user: client });
        }
      } else {
        await move(owner, "delivered", { message: "Final files attached. Please review and let me know if you need any adjustments." });

        if (spec.revision) {
          await move(client, "revision_requested", { message: "Please tweak the spacing and update the color tokens." });
          await move(owner, "delivered", { message: "Revision applied. Updated files are attached." });
        }

        if (spec.state === "completed") {
          await move(client, "completed", { note: "Order completed" });
          if (spec.rating) {
            await createReview(client, {
              orderId: id,
              rating: spec.rating,
              comment: spec.rating === 4 ? reviewCommentFour : reviewComments[index % reviewComments.length],
            });
          }
        }
      }
    }

    if (spec.daysAgo) await backdate(id, spec.daysAgo);
    process.stdout.write(".");
  };

  console.log(`Creating ${completedOrders.length + activeOrders.length} orders (this takes a minute)...`);
  for (const [i, spec] of completedOrders.entries()) await runOrder(spec, i);
  for (const [i, spec] of activeOrders.entries()) await runOrder(spec, i);
  console.log("");

  // 6. Favorites for the demo client
  for (const key of savedGigsForApex) {
    await Favorite.create({ user: people.apex._id, gig: gigs[key].doc._id });
  }

  // 7. A general conversation (Elena ko ek unread message milega)
  const conv = await startConversation(people.apex, { gigId: gigs.saas.doc._id });
  await sendMessage(people.apex, conv._id, { text: "Hi Elena, do you also design dark mode variants for dashboards?" });
  await sendMessage(people.elena, conv._id, { text: "Yes, dark mode is included in the Standard and Premium packages." });
  await sendMessage(people.apex, conv._id, { text: "Great, I will place an order this week. Thank you!" });

  // 8. Final sync of ratings and tiers
  for (const p of freelancers) await recomputeSellerStats(people[p.key]._id);
  for (const { doc } of Object.values(gigs)) await recomputeGigRating(doc._id);

  const seconds = Math.round((Date.now() - started) / 1000);
  console.log(`\nSeed complete in ${seconds}s`);
  console.log(`\nPassword for every account: ${PASSWORD}`);
  console.log("Clients:     " + clients.map((c) => c.email).join(", "));
  console.log("Freelancers: " + freelancers.map((f) => f.email).join(", "));
} catch (err) {
  console.error("\nSeed failed:", err);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}