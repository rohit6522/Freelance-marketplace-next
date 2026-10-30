import { body, query } from "express-validator";

export const startConversationRules = [
  body("gigId").optional().isMongoId().withMessage("Invalid gig id"),
  body("orderId").optional().isMongoId().withMessage("Invalid order id"),
  body("freelancerId").optional().isMongoId().withMessage("Invalid freelancer id"),
];

export const messageRules = [
  // Text ya attachment, kam se kam ek zaroori
  body("text").custom((text, { req }) => {
    const hasText = typeof text === "string" && text.trim().length > 0;
    const hasFiles = Array.isArray(req.body.attachments) && req.body.attachments.length > 0;
    if (!hasText && !hasFiles) throw new Error("Message cannot be empty");
    return true;
  }),
  body("text").optional().isString().trim().isLength({ max: 2000 }).withMessage("Message cannot exceed 2000 characters"),
  body("attachments").optional().isArray({ max: 5 }).withMessage("At most 5 attachments"),
  body("attachments.*.name").isString().trim().isLength({ min: 1, max: 120 }),
  body("attachments.*.url").isURL({ protocols: ["http", "https"], require_protocol: true }).withMessage("Attachment url must be a valid http(s) URL"),
  body("attachments.*.publicId").optional().isString(),
  body("attachments.*.size").optional().isInt({ min: 0 }).toInt(),
  body("attachments.*.mimeType").optional().isString().trim().isLength({ max: 100 }),
];

export const pagingRules = [
  query("page").optional().isInt({ min: 1 }).toInt(),
  query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
];