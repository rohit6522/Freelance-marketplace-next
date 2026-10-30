import { body, query } from "express-validator";

export const createReviewRules = [
  body("orderId").isMongoId().withMessage("A valid order is required"),
  body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be a whole number from 1 to 5").toInt(),
  body("comment")
    .isString().withMessage("Review comment is required")
    .trim()
    .isLength({ min: 10, max: 1500 }).withMessage("Review must be 10 to 1500 characters"),
];

export const respondRules = [
  body("message")
    .isString().withMessage("Response is required")
    .trim()
    .isLength({ min: 2, max: 800 }).withMessage("Response must be 2 to 800 characters"),
];

export const reportRules = [
  body("reason")
    .isString().withMessage("Please tell us why you are reporting this review")
    .trim()
    .isLength({ min: 5, max: 300 }).withMessage("Reason must be 5 to 300 characters"),
];

export const listReviewRules = [
  query("gig").optional().isMongoId(),
  query("freelancer").optional().isMongoId(),
  query("rating").optional().isInt({ min: 1, max: 5 }).toInt(),
  query("q").optional().isString().trim().isLength({ max: 100 }),
  query("sort").optional().isIn(["recent", "highest", "lowest"]),
  query("page").optional().isInt({ min: 1 }).toInt(),
  query("limit").optional().isInt({ min: 1, max: 50 }).toInt(),
];

export const pagingRules = [
  query("page").optional().isInt({ min: 1 }).toInt(),
  query("limit").optional().isInt({ min: 1, max: 50 }).toInt(),
];