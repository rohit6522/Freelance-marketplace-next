import { Router } from "express";
import { listPayments, getSummary } from "../controllers/paymentController.js";
import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { listPaymentRules } from "../validators/paymentValidators.js";

const router = Router();
router.use(protect);

router.get("/summary", getSummary);
router.get("/", listPaymentRules, validate, listPayments);

export default router;