import { body, param } from "express-validator";
import { ROLES } from "../utils/constants.js";
import { FOCUS_KEYS } from "../utils/focusAreas.js";

const emailRule = (field = "email") =>
  body(field)
    .isString().withMessage("Email is required")
    .trim()
    .toLowerCase()
    .isEmail().withMessage("Please provide a valid email");

// Min 8 characters, kam se kam ek letter aur ek number (bcrypt ki limit 72)
const passwordRule = (field = "password") =>
  body(field)
    .isString().withMessage("Password is required")
    .isLength({ min: 8, max: 72 }).withMessage("Password must be 8 to 72 characters")
    .matches(/[A-Za-z]/).withMessage("Password must contain at least one letter")
    .matches(/\d/).withMessage("Password must contain at least one number");

export const registerRules = [
  body("name")
    .isString().withMessage("Name is required")
    .trim()
    .isLength({ min: 2, max: 60 }).withMessage("Name must be 2 to 60 characters"),
  emailRule(),
  passwordRule(),
  body("role")
    .isIn(Object.values(ROLES)).withMessage("Role must be client or freelancer"),
  body("companyName").optional().isString().trim().isLength({ max: 100 }),
  body("country").optional().isString().trim().isLength({ max: 60 }),
  body("primaryFocus")
    .optional({ values: "falsy" })
    .isIn(FOCUS_KEYS).withMessage("Please choose a valid focus area"),
  body("marketingOptIn")
    .optional()
    .isBoolean().withMessage("marketingOptIn must be true or false")
    .toBoolean(),
  body("acceptTerms")
    .custom((value) => value === true || value === "true")
    .withMessage("You must accept the terms to create an account"),
];

export const loginRules = [
  emailRule(),
  body("password").isString().notEmpty().withMessage("Password is required"),
  body("rememberMe").optional().isBoolean().withMessage("rememberMe must be true or false").toBoolean(),
];

export const forgotPasswordRules = [emailRule()];

export const resetPasswordRules = [
  param("token").isHexadecimal().isLength({ min: 64, max: 64 }).withMessage("Invalid reset token"),
  passwordRule(),
];

export const changePasswordRules = [
  body("currentPassword").isString().notEmpty().withMessage("Current password is required"),
  passwordRule("newPassword"),
  body("newPassword").custom((value, { req }) => {
    if (value === req.body.currentPassword) {
      throw new Error("New password must be different from the current one");
    }
    return true;
  }),
];

export const updateMeRules = [
  body("name").optional().isString().trim().isLength({ min: 2, max: 60 }).withMessage("Name must be 2 to 60 characters"),
  body("country").optional().isString().trim().isLength({ max: 60 }),
  body("companyName").optional().isString().trim().isLength({ max: 100 }),
];