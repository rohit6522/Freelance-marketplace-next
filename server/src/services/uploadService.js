import crypto from "crypto";
import path from "path";
import { getCloudinary, isCloudinaryConfigured } from "../config/cloudinary.js";
import ApiError from "../utils/ApiError.js";

const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const MIME_BY_EXT = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".pdf": "application/pdf",
  ".zip": "application/zip",
};

const TRANSFORMS = {
  images: [{ width: 1600, height: 1600, crop: "limit" }],
  avatar: [{ width: 400, height: 400, crop: "fill", gravity: "auto" }],
};

const ownFolder = (userId) => `gigcraft/${userId}/`;

const uploadBuffer = (buffer, options) =>
  new Promise((resolve, reject) => {
    const stream = getCloudinary().uploader.upload_stream(options, (err, result) =>
      err ? reject(err) : resolve(result)
    );
    stream.end(buffer);
  });

const destroy = (publicId) => {
  const ext = path.extname(publicId).toLowerCase();
  const resource_type = ext === ".pdf" || ext === ".zip" ? "raw" : "image";
  return getCloudinary().uploader.destroy(publicId, { resource_type, invalidate: true });
};

// kind: "images" | "files" | "avatar"
export const uploadToCloudinary = async (userId, files, kind) => {
  if (!isCloudinaryConfigured()) {
    throw new ApiError(503, "File uploads are not configured on this server");
  }

  const settled = await Promise.allSettled(
    files.map((file) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const isImage = IMAGE_EXTS.has(ext);
      const id = crypto.randomBytes(8).toString("hex");

      return uploadBuffer(file.buffer, {
        folder: `gigcraft/${userId}/${kind}`,
        public_id: isImage ? id : `${id}${ext}`, // raw files ko extension chahiye
        resource_type: isImage ? "image" : "raw",
        overwrite: false,
        ...(isImage && TRANSFORMS[kind] ? { transformation: TRANSFORMS[kind] } : {}),
      }).then((result) => ({
        name: path.basename(file.originalname).slice(0, 120),
        url: result.secure_url,
        publicId: result.public_id,
        size: result.bytes,
        mimeType: MIME_BY_EXT[ext],
      }));
    })
  );

  const failed = settled.find((s) => s.status === "rejected");
  if (failed) {
    // Ek bhi fail hua to baaki uploaded files hata do (orphan files na bachein)
    await Promise.allSettled(
      settled.filter((s) => s.status === "fulfilled").map((s) => destroy(s.value.publicId))
    );
    console.error("Cloudinary upload failed:", failed.reason?.message);
    throw new ApiError(502, "Upload failed. Please try again.");
  }

  return settled.map((s) => s.value);
};

export const deleteAsset = async (userId, publicId) => {
  if (!publicId.startsWith(ownFolder(userId)) || publicId.includes("..")) {
    throw new ApiError(403, "You can only delete your own uploads");
  }
  const result = await destroy(publicId);
  return result.result; // "ok" ya "not found"
};