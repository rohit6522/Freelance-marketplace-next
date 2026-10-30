import { body, query } from "express-validator";
import { GIG_STATUS } from "../utils/constants.js";

const gigRules = (isCreate) => {
  const field = (name) => (isCreate ? body(name) : body(name).optional());

  return [
    field("title").isString().trim().isLength({ min: 10, max: 120 }).withMessage("Title must be 10 to 120 characters"),
    field("category").isMongoId().withMessage("A valid category is required"),
    body("description").optional().isString().trim().isLength({ max: 5000 }),
    body("tags").optional().isArray({ max: 5 }).withMessage("At most 5 tags"),
    body("tags.*").isString().trim().isLength({ min: 1, max: 30 }),
    body("images").optional().isArray({ max: 5 }).withMessage("At most 5 images"),
    body("images.*.url").isURL({ protocols: ["http", "https"], require_protocol: true }).withMessage("Image url must be a valid http(s) URL"),
    body("images.*.publicId").optional().isString(),
    body("deliverables").optional().isArray({ max: 6 }),
    body("deliverables.*.title").isString().trim().isLength({ min: 1, max: 80 }),
    body("deliverables.*.description").optional().isString().trim().isLength({ max: 200 }),
    body("faqs").optional().isArray({ max: 10 }),
    body("faqs.*.question").isString().trim().isLength({ min: 1, max: 200 }),
    body("faqs.*.answer").isString().trim().isLength({ min: 1, max: 800 }),

    body("packages").optional().isObject().withMessage("Packages must be an object"),
    body("packages.*.name").isString().trim().isLength({ min: 1, max: 60 }),
    body("packages.*.description").isString().trim().isLength({ min: 1, max: 300 }),
    body("packages.*.price").isFloat({ min: 5, max: 100000 }).withMessage("Price must be between 5 and 100000").toFloat(),
    body("packages.*.deliveryDays").isInt({ min: 1, max: 90 }).withMessage("Delivery must be 1 to 90 days").toInt(),
    body("packages.*.revisions").optional().isInt({ min: 0, max: 50 }).toInt(),
    body("packages.*.unlimitedRevisions").optional().isBoolean().toBoolean(),
    body("packages.*.features").optional().isArray({ max: 10 }),
    body("packages.*.features.*").isString().trim().isLength({ min: 1, max: 120 }),
  ];
};

export const createGigRules = [
  ...gigRules(true),
  body("status").optional().isIn([GIG_STATUS.DRAFT, GIG_STATUS.PUBLISHED]).withMessage("Status must be draft or published"),
];

export const updateGigRules = gigRules(false);

export const gigStatusRules = [
  body("status").isIn(Object.values(GIG_STATUS)).withMessage("Status must be draft, published or paused"),
];

const paging = [
  query("page").optional().isInt({ min: 1 }).toInt(),
  query("limit").optional().isInt({ min: 1, max: 50 }).toInt(),
];

// Public search. Frontend khaali params (jaise ?q=) bhejne ke bajay unhe omit kare.
export const searchGigRules = [
  query("q").optional().isString().trim().isLength({ max: 100 }),
  query("category").optional().isString().trim().isLength({ max: 60 }),
  query("tags").optional().isString().trim().isLength({ max: 200 }),
  query("minPrice").optional().isFloat({ min: 0 }).toFloat(),
  query("maxPrice").optional().isFloat({ min: 0 }).toFloat(),
  query("rating").optional().isFloat({ min: 0, max: 5 }).toFloat(),
  query("delivery").optional().isInt({ min: 1, max: 90 }).toInt(),
  query("experience").optional().isInt({ min: 0, max: 60 }).toInt(),
    query("tier").optional().isString().trim().isLength({ max: 100 }),
  query("sort").optional().isIn(["relevance", "newest", "price_asc", "price_desc", "rating"]),
  ...paging,
];

export const myGigsRules = [
  query("status").optional().isIn(Object.values(GIG_STATUS)),
  ...paging,
];