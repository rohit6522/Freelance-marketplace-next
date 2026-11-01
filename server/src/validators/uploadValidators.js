import { body } from "express-validator";

export const deleteUploadRules = [
  body("publicId")
    .isString()
    .matches(/^gigcraft\/[a-f0-9]{24}\/(images|files|avatar)\/[A-Za-z0-9._-]+$/)
    .withMessage("Invalid file id"),
];