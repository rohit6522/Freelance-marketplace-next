import { Router } from "express";
import { addFavorite, removeFavorite, getFavoriteIds, listFavorites } from "../controllers/favoriteController.js";
import { protect, restrictTo } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { gigIdParam, listFavoriteRules } from "../validators/favoriteValidators.js";
import { ROLES } from "../utils/constants.js";

const router = Router();
router.use(protect, restrictTo(ROLES.CLIENT)); // Saved Gigs client dashboard ka hissa hai

router.get("/ids", getFavoriteIds);
router.get("/", listFavoriteRules, validate, listFavorites);
router.post("/:gigId", gigIdParam, validate, addFavorite);
router.delete("/:gigId", gigIdParam, validate, removeFavorite);

export default router;