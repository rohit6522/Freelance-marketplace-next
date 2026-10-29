import { Router } from "express";
import {
  createOrder, listOrders, getOrder, acceptOrder, rejectOrder, cancelOrder,
  deliverOrder, requestRevision, completeOrder, completeMilestone, releaseMilestone,
} from "../controllers/orderController.js";
import { protect, restrictTo } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { checkoutLimiter } from "../middleware/rateLimiter.js";
import { idParam } from "../validators/commonValidators.js";
import {
  createOrderRules, listOrderRules, deliverRules, revisionRules, cancelRules, milestoneParams,
} from "../validators/orderValidators.js";
import { ROLES } from "../utils/constants.js";

const router = Router();
const { CLIENT, FREELANCER } = ROLES;

router.use(protect);

router.post("/", restrictTo(CLIENT), checkoutLimiter, createOrderRules, validate, createOrder);
router.get("/", listOrderRules, validate, listOrders);
router.get("/:id", idParam, validate, getOrder);

// Status workflow (valid transitions aur kaun kar sakta hai, ye service me enforce hota hai)
router.patch("/:id/accept", restrictTo(FREELANCER), idParam, validate, acceptOrder);
router.patch("/:id/reject", restrictTo(FREELANCER), idParam, cancelRules, validate, rejectOrder);
router.patch("/:id/deliver", restrictTo(FREELANCER), idParam, deliverRules, validate, deliverOrder);
router.patch("/:id/request-revision", restrictTo(CLIENT), idParam, revisionRules, validate, requestRevision);
router.patch("/:id/complete", restrictTo(CLIENT), idParam, validate, completeOrder);
router.patch("/:id/cancel", idParam, cancelRules, validate, cancelOrder);

// Milestones
router.patch("/:id/milestones/:milestoneId/complete", restrictTo(FREELANCER), milestoneParams, validate, completeMilestone);
router.patch("/:id/milestones/:milestoneId/release", restrictTo(CLIENT), milestoneParams, validate, releaseMilestone);

export default router;