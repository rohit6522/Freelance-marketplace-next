import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { pick } from "../utils/pick.js";
import * as reviewService from "../services/reviewService.js";

// GET /api/reviews?gig=<id>  ya  ?freelancer=<id>   (public)
export const listReviews = asyncHandler(async (req, res) => {
  if (!req.query.gig && !req.query.freelancer) {
    throw new ApiError(400, "Provide a gig or freelancer id");
  }
  const data = await reviewService.listReviews(req.query);
  res.json({ success: true, data });
});

// GET /api/reviews/mine
export const getMyReviews = asyncHandler(async (req, res) => {
  const data = await reviewService.listMyReviews(req.user, req.query);
  res.json({ success: true, data });
});

// GET /api/reviews/pending   (client: kin orders par review dena baaki hai)
export const getPendingReviews = asyncHandler(async (req, res) => {
  const orders = await reviewService.getPendingReviews(req.user);
  res.json({ success: true, data: { orders } });
});

// POST /api/reviews
export const createReview = asyncHandler(async (req, res) => {
  const input = pick(req.body, ["orderId", "rating", "comment"]);
  const review = await reviewService.createReview(req.user, input);
  res.status(201).json({ success: true, message: "Thanks for your review", data: { review } });
});

// PATCH /api/reviews/:id/response   (freelancer ka jawab)
export const respondToReview = asyncHandler(async (req, res) => {
  const review = await reviewService.respondToReview(req.user, req.params.id, req.body.message);
  res.json({ success: true, message: "Response saved", data: { review } });
});

// POST /api/reviews/:id/report
export const reportReview = asyncHandler(async (req, res) => {
  await reviewService.reportReview(req.user, req.params.id, req.body.reason);
  res.status(201).json({ success: true, message: "Thanks. The review has been reported." });
});