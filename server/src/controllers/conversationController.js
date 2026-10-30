import asyncHandler from "../utils/asyncHandler.js";
import { pick } from "../utils/pick.js";
import * as messageService from "../services/messageService.js";

// POST /api/conversations   body: { gigId } ya { orderId } ya { freelancerId }
export const startConversation = asyncHandler(async (req, res) => {
  const input = pick(req.body, ["gigId", "orderId", "freelancerId"]);
  const conversation = await messageService.startConversation(req.user, input);
  res.json({ success: true, data: { conversation } });
});

// GET /api/conversations
export const listConversations = asyncHandler(async (req, res) => {
  const data = await messageService.listConversations(req.user, req.query);
  res.json({ success: true, data });
});

// GET /api/conversations/unread-count
export const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await messageService.getUnreadCount(req.user);
  res.json({ success: true, data: { unread: count } });
});

// GET /api/conversations/:id/messages
export const getMessages = asyncHandler(async (req, res) => {
  const data = await messageService.getMessages(req.user, req.params.id, req.query);
  res.json({ success: true, data });
});

// POST /api/conversations/:id/messages
export const sendMessage = asyncHandler(async (req, res) => {
  const payload = {
    text: req.body.text,
    attachments: (req.body.attachments || []).map((f) => pick(f, ["name", "url", "publicId", "size", "mimeType"])),
  };
  const message = await messageService.sendMessage(req.user, req.params.id, payload);
  res.status(201).json({ success: true, data: { message } });
});

// PATCH /api/conversations/:id/read
export const markRead = asyncHandler(async (req, res) => {
  await messageService.markConversationRead(req.user, req.params.id);
  res.json({ success: true, message: "Marked as read" });
});