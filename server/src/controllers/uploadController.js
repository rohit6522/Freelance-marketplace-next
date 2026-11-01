import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import * as uploadService from "../services/uploadService.js";

// POST /api/uploads/images   (gig, portfolio images)
export const postImages = asyncHandler(async (req, res) => {
  const files = await uploadService.uploadToCloudinary(req.user._id, req.files, "images");
  res.status(201).json({ success: true, message: `${files.length} image(s) uploaded`, data: { files } });
});

// POST /api/uploads/files   (deliverables, requirement files, message attachments)
export const postFiles = asyncHandler(async (req, res) => {
  const files = await uploadService.uploadToCloudinary(req.user._id, req.files, "files");
  res.status(201).json({ success: true, message: `${files.length} file(s) uploaded`, data: { files } });
});

// POST /api/uploads/avatar
export const postAvatar = asyncHandler(async (req, res) => {
  const [uploaded] = await uploadService.uploadToCloudinary(req.user._id, req.files, "avatar");

  const oldPublicId = req.user.avatar?.publicId;
  req.user.avatar = { url: uploaded.url, publicId: uploaded.publicId };
  await req.user.save();

  if (oldPublicId) uploadService.deleteAsset(req.user._id, oldPublicId).catch(() => {});
  res.status(201).json({ success: true, message: "Profile photo updated", data: { user: req.user } });
});

// DELETE /api/uploads/avatar
export const removeAvatar = asyncHandler(async (req, res) => {
  const oldPublicId = req.user.avatar?.publicId;
  req.user.avatar = undefined;
  await req.user.save();

  if (oldPublicId) uploadService.deleteAsset(req.user._id, oldPublicId).catch(() => {});
  res.json({ success: true, message: "Profile photo removed", data: { user: req.user } });
});

// DELETE /api/uploads   body: { publicId }
export const deleteUpload = asyncHandler(async (req, res) => {
  const result = await uploadService.deleteAsset(req.user._id, req.body.publicId);
  if (result === "not found") throw new ApiError(404, "File not found");
  res.json({ success: true, message: "File deleted" });
});