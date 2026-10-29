import { body } from "express-validator";

const rules = (isCreate) => {
  const field = (name) => (isCreate ? body(name) : body(name).optional());

  return [
    field("title").isString().trim().isLength({ min: 3, max: 120 }).withMessage("Title must be 3 to 120 characters"),
    field("description").isString().trim().isLength({ min: 10, max: 1000 }).withMessage("Description must be 10 to 1000 characters"),
    body("images").optional().isArray({ max: 6 }).withMessage("At most 6 images"),
    body("images.*.url").isURL({ protocols: ["http", "https"], require_protocol: true }).withMessage("Image url must be a valid http(s) URL"),
    body("images.*.publicId").optional().isString(),
    body("externalLink").optional().isURL({ protocols: ["http", "https"], require_protocol: true }).withMessage("Link must be a valid http(s) URL"),
    body("category").optional().isString().trim().isLength({ max: 60 }),
    body("highlightMetric").optional().isString().trim().isLength({ max: 80 }),
    body("duration").optional().isString().trim().isLength({ max: 40 }),
    body("deliverables").optional().isArray({ max: 8 }),
    body("deliverables.*").isString().trim().isLength({ min: 1, max: 60 }),
    body("displayOrder").optional().isInt({ min: 0, max: 1000 }).toInt(),
  ];
};

export const createProjectRules = rules(true);
export const updateProjectRules = rules(false);