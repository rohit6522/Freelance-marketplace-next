import { query } from "express-validator";
import { PAYMENT_STATUS } from "../utils/constants.js";

export const listPaymentRules = [
  query("status").optional().isIn(Object.values(PAYMENT_STATUS)),
  query("page").optional().isInt({ min: 1 }).toInt(),
  query("limit").optional().isInt({ min: 1, max: 50 }).toInt(),
];