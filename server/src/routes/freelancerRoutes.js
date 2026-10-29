import { Router } from "express";
import { getPublicProfile, updateMyProfile } from "../controllers/freelancerController.js";
import { protect, restrictTo } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { idParam } from "../validators/commonValidators.js";
import { updateProfileRules } from "../validators/profileValidators.js";
import { ROLES } from "../utils/constants.js";

const router = Router();

router.put("/me", protect, restrictTo(ROLES.FREELANCER), updateProfileRules, validate, updateMyProfile);
router.get("/:id", idParam, validate, getPublicProfile);

export default router;