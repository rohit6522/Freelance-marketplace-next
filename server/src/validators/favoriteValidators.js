import { param, query } from "express-validator";

export const gigIdParam = [param("gigId").isMongoId().withMessage("Invalid gig id")];

export const listFavoriteRules = [
  query("page").optional().isInt({ min: 1 }).toInt(),
  query("limit").optional().isInt({ min: 1, max: 50 }).toInt(),
];