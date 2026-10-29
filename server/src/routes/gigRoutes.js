import { Router } from "express";
import {
  listGigs, getMyGigs, getGig, createGig, updateGig, updateGigStatus, deleteGig,
} from "../controllers/gigController.js";
import { protect, restrictTo, optionalAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { idParam } from "../validators/commonValidators.js";
import {
  searchGigRules, myGigsRules, createGigRules, updateGigRules, gigStatusRules,
} from "../validators/gigValidators.js";
import { ROLES } from "../utils/constants.js";

const router = Router();
const freelancerOnly = [protect, restrictTo(ROLES.FREELANCER)];

router.get("/", searchGigRules, validate, listGigs);
router.get("/mine", ...freelancerOnly, myGigsRules, validate, getMyGigs); // /:idOrSlug se pehle
router.post("/", ...freelancerOnly, createGigRules, validate, createGig);

router.get("/:idOrSlug", optionalAuth, getGig);
router.patch("/:id", ...freelancerOnly, idParam, updateGigRules, validate, updateGig);
router.patch("/:id/status", ...freelancerOnly, idParam, gigStatusRules, validate, updateGigStatus);
router.delete("/:id", ...freelancerOnly, idParam, validate, deleteGig);

export default router;