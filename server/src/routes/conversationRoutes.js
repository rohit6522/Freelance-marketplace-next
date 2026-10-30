import { Router } from "express";
import {
  startConversation, listConversations, getUnreadCount, getMessages, sendMessage, markRead,
} from "../controllers/conversationController.js";
import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { messageLimiter } from "../middleware/rateLimiter.js";
import { idParam } from "../validators/commonValidators.js";
import { startConversationRules, messageRules, pagingRules } from "../validators/conversationValidators.js";

const router = Router();
router.use(protect);

router.get("/unread-count", getUnreadCount);
router.get("/", pagingRules, validate, listConversations);
router.post("/", startConversationRules, validate, startConversation);

router.get("/:id/messages", idParam, pagingRules, validate, getMessages);
router.post("/:id/messages", messageLimiter, idParam, messageRules, validate, sendMessage);
router.patch("/:id/read", idParam, validate, markRead);

export default router;