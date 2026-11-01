import { Router } from "express";
import { postImages, postFiles, postAvatar, removeAvatar, deleteUpload } from "../controllers/uploadController.js";
import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { uploadLimiter } from "../middleware/rateLimiter.js";
import { uploadImages, uploadDocs, uploadAvatarFile } from "../middleware/upload.js";
import { deleteUploadRules } from "../validators/uploadValidators.js";

const router = Router();
router.use(protect);

router.post("/images", uploadLimiter, ...uploadImages, postImages);
router.post("/files", uploadLimiter, ...uploadDocs, postFiles);
router.post("/avatar", uploadLimiter, ...uploadAvatarFile, postAvatar);
router.delete("/avatar", removeAvatar);
router.delete("/", deleteUploadRules, validate, deleteUpload);

export default router;