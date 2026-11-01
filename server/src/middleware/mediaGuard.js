import ApiError from "../utils/ApiError.js";
import { isAllowedMediaUrl } from "../utils/mediaUrl.js";

const MEDIA_KEYS = ["images", "files", "attachments", "requirementFiles"];

export const mediaGuard = (req, res, next) => {
  const body = req.body;
  if (!body || typeof body !== "object") return next();

  for (const key of MEDIA_KEYS) {
    const list = body[key];
    if (!Array.isArray(list)) continue;

    for (const item of list) {
      if (item && typeof item === "object" && item.url !== undefined && !isAllowedMediaUrl(item.url)) {
        return next(
          new ApiError(400, "Validation failed", [
            { field: `${key}.url`, message: "Images and files must be uploaded through the upload API" },
          ])
        );
      }
    }
  }
  next();
};