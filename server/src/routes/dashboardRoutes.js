import { Router } from "express";
import { getClientDashboard, getFreelancerDashboard } from "../controllers/dashboardController.js";
import { protect, restrictTo } from "../middleware/auth.js";
import { ROLES } from "../utils/constants.js";

const router = Router();
router.use(protect);

router.get("/client", restrictTo(ROLES.CLIENT), getClientDashboard);
router.get("/freelancer", restrictTo(ROLES.FREELANCER), getFreelancerDashboard);

export default router;