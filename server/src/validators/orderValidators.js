import { body, query, param } from "express-validator";
import { ORDER_STATUS, PACKAGE_TIERS } from "../utils/constants.js";

export const createOrderRules = [
  body("gigId").isMongoId().withMessage("A valid gig is required"),
  body("tier").isIn(PACKAGE_TIERS).withMessage("Package must be basic, standard or premium"),
  body("requirements")
    .isString().withMessage("Requirements are required")
    .trim()
    .isLength({ min: 10, max: 3000 }).withMessage("Requirements must be 10 to 3000 characters"),
];

export const listOrderRules = [
  query("status").optional().isIn(Object.values(ORDER_STATUS)),
  query("q").optional().isString().trim().isLength({ max: 100 }),
  query("sort").optional().isIn(["newest", "oldest", "amount_desc"]),
  query("page").optional().isInt({ min: 1 }).toInt(),
  query("limit").optional().isInt({ min: 1, max: 50 }).toInt(),
];

export const deliverRules = [
  body("message")
    .isString().withMessage("Delivery message is required")
    .trim()
    .isLength({ min: 5, max: 2000 }).withMessage("Message must be 5 to 2000 characters"),
  body("files").optional().isArray({ max: 5 }).withMessage("At most 5 files"),
  body("files.*.name").isString().trim().isLength({ min: 1, max: 120 }),
  body("files.*.url").isURL({ protocols: ["http", "https"], require_protocol: true }).withMessage("File url must be a valid http(s) URL"),
  body("files.*.publicId").optional().isString(),
  body("files.*.size").optional().isInt({ min: 0 }).toInt(),
  body("files.*.mimeType").optional().isString().trim().isLength({ max: 100 }),
];

export const revisionRules = [
  body("message")
    .isString().withMessage("Please describe the changes you need")
    .trim()
    .isLength({ min: 10, max: 1000 }).withMessage("Message must be 10 to 1000 characters"),
];

export const cancelRules = [body("reason").optional().isString().trim().isLength({ max: 500 })];

export const milestoneParams = [
  param("id").isMongoId().withMessage("Invalid id"),
  param("milestoneId").isMongoId().withMessage("Invalid milestone id"),
];