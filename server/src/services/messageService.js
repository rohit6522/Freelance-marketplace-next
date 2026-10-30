import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import Order from "../models/Order.js";
import Gig from "../models/Gig.js";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import { GIG_STATUS, ROLES } from "../utils/constants.js";
import { getPagination, buildMeta } from "../utils/pagination.js";

const POPULATE = [
  { path: "participants", select: "name avatar role companyName" },
  { path: "gig", select: "title slug" },
  { path: "order", select: "orderNumber status" },
];

const pairKey = (a, b) => [String(a), String(b)].sort().join("_");

const presentConversation = (conv, userId, unreadCount = 0) => {
  const c = typeof conv.toObject === "function" ? conv.toObject() : conv;
  const other = (c.participants || []).find((p) => String(p._id) !== String(userId)) || null;
  return {
    _id: c._id,
    other,
    gig: c.gig || null,
    order: c.order || null,
    lastMessage: c.lastMessage || null,
    unreadCount,
    updatedAt: c.updatedAt,
  };
};

// Sirf participants conversation dekh sakte hain. Baaki sabko 404.
const loadConversationFor = async (id, user) => {
  const conv = await Conversation.findOne({ _id: id, participants: user._id });
  if (!conv) throw new ApiError(404, "Conversation not found");
  return conv;
};

const unreadByConversation = async (userId, conversationIds) => {
  const rows = await Message.aggregate([
    {
      $match: {
        conversation: { $in: conversationIds },
        type: "text",
        sender: { $ne: userId },
        readBy: { $ne: userId },
      },
    },
    { $group: { _id: "$conversation", count: { $sum: 1 } } },
  ]);
  return new Map(rows.map((r) => [String(r._id), r.count]));
};

// Ek pair ke liye ek general chat, aur har order ke liye apni chat
export const getOrCreateConversation = ({ a, b, order = null, gig = null }, session) =>
  Conversation.findOneAndUpdate(
    { participantsKey: pairKey(a, b), order },
    { $setOnInsert: { participants: [a, b], gig } },
    { upsert: true, returnDocument: "after", session }
  );

// Order ke events ("funds released", "work delivered") chat me system message ban kar aate hain
export const addOrderSystemMessage = async (order, text, session) => {
  const conv = await getOrCreateConversation(
    { a: order.client, b: order.freelancer, order: order._id, gig: order.gig },
    session
  );

  await Message.create([{ conversation: conv._id, type: "system", text }], { session });
  await Conversation.updateOne(
    { _id: conv._id },
    { $set: { lastMessage: { text, sentAt: new Date() } } },
    { session }
  );
};

export const startConversation = async (user, { orderId, gigId, freelancerId }) => {
  const provided = [orderId, gigId, freelancerId].filter(Boolean);
  if (provided.length !== 1) {
    throw new ApiError(400, "Provide exactly one of orderId, gigId or freelancerId");
  }

  let other;
  let order = null;
  let gig = null;

  if (orderId) {
    const found = await Order.findById(orderId).select("client freelancer gig");
    const isClient = found && found.client.equals(user._id);
    const isFreelancer = found && found.freelancer.equals(user._id);
    if (!isClient && !isFreelancer) throw new ApiError(404, "Order not found");

    other = isClient ? found.freelancer : found.client;
    order = found._id;
    gig = found.gig;
  } else {
    // Nayi chat sirf client shuru kar sakta hai. Freelancer reply kar sakta hai.
    if (user.role !== ROLES.CLIENT) {
      throw new ApiError(403, "Only clients can start a new conversation");
    }

    if (gigId) {
      const found = await Gig.findOne({ _id: gigId, status: GIG_STATUS.PUBLISHED }).select("freelancer");
      if (!found) throw new ApiError(404, "Gig not found");
      other = found.freelancer;
      gig = found._id;
    } else {
      const found = await User.findOne({ _id: freelancerId, role: ROLES.FREELANCER }).select("_id");
      if (!found) throw new ApiError(404, "Freelancer not found");
      other = found._id;
    }
  }

  if (!(await User.exists({ _id: other, isActive: true }))) {
    throw new ApiError(404, "This user is no longer available");
  }

  const conv = await getOrCreateConversation({ a: user._id, b: other, order, gig });
  await conv.populate(POPULATE);
  return presentConversation(conv, user._id);
};

export const listConversations = async (user, params = {}) => {
  const { page, limit, skip } = getPagination(params, { defaultLimit: 20 });
  // Khaali conversations (jahan abhi koi message nahi) list me nahi dikhate
  const filter = { participants: user._id, "lastMessage.sentAt": { $exists: true } };

  const [convs, total] = await Promise.all([
    Conversation.find(filter).populate(POPULATE).sort({ updatedAt: -1 }).skip(skip).limit(limit).lean(),
    Conversation.countDocuments(filter),
  ]);

  const unread = await unreadByConversation(user._id, convs.map((c) => c._id));

  return {
    conversations: convs.map((c) => presentConversation(c, user._id, unread.get(String(c._id)) || 0)),
    pagination: buildMeta(total, page, limit),
  };
};

const markRead = (conversationId, userId) =>
  Message.updateMany(
    { conversation: conversationId, sender: { $ne: userId }, readBy: { $ne: userId } },
    { $addToSet: { readBy: userId } }
  );

export const getMessages = async (user, conversationId, params = {}) => {
  const conv = await loadConversationFor(conversationId, user);
  const { page, limit, skip } = getPagination(params, { defaultLimit: 30, maxLimit: 100 });

  const [rows, total] = await Promise.all([
    Message.find({ conversation: conv._id })
      .populate("sender", "name avatar")
      .sort({ createdAt: -1, _id: -1 }) // page 1 = sabse naye messages
      .skip(skip)
      .limit(limit)
      .lean(),
    Message.countDocuments({ conversation: conv._id }),
  ]);

  await markRead(conv._id, user._id); // chat kholi to read ho gaye
  await conv.populate(POPULATE);

  return {
    conversation: presentConversation(conv, user._id),
    messages: rows.reverse(), // screen par purana upar, naya neeche
    pagination: buildMeta(total, page, limit),
  };
};

export const sendMessage = async (user, conversationId, { text, attachments = [] }) => {
  const conv = await loadConversationFor(conversationId, user);

  const otherId = conv.participants.find((p) => !p.equals(user._id));
  if (!(await User.exists({ _id: otherId, isActive: true }))) {
    throw new ApiError(403, "This user is no longer available");
  }

  const message = await Message.create({
    conversation: conv._id,
    sender: user._id,
    type: "text",
    text: text || undefined,
    attachments,
    readBy: [user._id],
  });

  await Conversation.updateOne(
    { _id: conv._id },
    { $set: { lastMessage: { text: text || "Sent an attachment", sender: user._id, sentAt: message.createdAt } } }
  );

  await message.populate("sender", "name avatar");
  return message;
};

export const markConversationRead = async (user, conversationId) => {
  const conv = await loadConversationFor(conversationId, user);
  await markRead(conv._id, user._id);
};

// Navbar ke Messages badge ke liye
export const getUnreadCount = async (user) => {
  const ids = await Conversation.distinct("_id", { participants: user._id });
  if (!ids.length) return 0;

  return Message.countDocuments({
    conversation: { $in: ids },
    type: "text",
    sender: { $ne: user._id },
    readBy: { $ne: user._id },
  });
};