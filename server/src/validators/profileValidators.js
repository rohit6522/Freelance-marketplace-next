import { body } from "express-validator";

export const updateProfileRules = [
  body("title").optional().isString().trim().isLength({ max: 100 }),
  body("bio").optional().isString().trim().isLength({ max: 1500 }),
  body("skills").optional().isArray({ max: 20 }).withMessage("Skills must be an array of at most 20 items"),
  body("skills.*").isString().trim().isLength({ min: 1, max: 40 }).withMessage("Each skill must be 1 to 40 characters"),
  body("languages").optional().isArray({ max: 10 }),
  body("languages.*.name").isString().trim().isLength({ min: 1, max: 40 }),
  body("languages.*.level").optional().isIn(["basic", "conversational", "fluent", "native"]),
  body("experienceYears").optional().isInt({ min: 0, max: 60 }).toInt(),
  body("location").optional().isString().trim().isLength({ max: 100 }),
  body("timezone").optional().isString().trim().isLength({ max: 40 }),
  body("hourlyRate").optional().isFloat({ min: 0, max: 10000 }).toFloat(),
  body("weeklyHours").optional().isInt({ min: 1, max: 80 }).toInt(),
  body("availability").optional().isIn(["available", "busy", "unavailable"]),
  body("accreditations").optional().isArray({ max: 10 }),
  body("accreditations.*.name").isString().trim().isLength({ min: 1, max: 120 }),
  body("workHistory").optional().isArray({ max: 15 }),
  body("workHistory.*.title").isString().trim().isLength({ min: 1, max: 120 }),
  body("workHistory.*.company").isString().trim().isLength({ min: 1, max: 120 }),
  body("workHistory.*.startYear").isInt({ min: 1970, max: 2100 }).toInt(),
];