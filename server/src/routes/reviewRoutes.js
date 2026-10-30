import { Router } from "express";
import {
  listReviews, getMyReviews, getPendingReviews, createReview, respondToReview, reportReview,
} from "../controllers/reviewController.js";
import { protect, restrictTo } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { idParam } from "../validators/commonValidators.js";
import {
  createReviewRules, respondRules, reportRules, listReviewRules, pagingRules,
} from "../validators/reviewValidators.js";
import { ROLES } from "../utils/constants.js";

const router = Router();
const { CLIENT, FREELANCER } = ROLES;

router.get("/", listReviewRules, validate, listReviews); // public

router.get("/mine", protect, pagingRules, validate, getMyReviews);
router.get("/pending", protect, restrictTo(CLIENT), getPendingReviews);

router.post("/", protect, restrictTo(CLIENT), createReviewRules, validate, createReview);
router.patch("/:id/response", protect, restrictTo(FREELANCER), idParam, respondRules, validate, respondToReview);
router.post("/:id/report", protect, idParam, reportRules, validate, reportReview);

export default router;