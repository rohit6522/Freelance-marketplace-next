import { api } from "@/lib/api";

export const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".pdf", ".zip"];
export const MAX_FILE_BYTES = 10 * 1024 * 1024;
export const MAX_FILES = 5;

// Problem ho to message wapas deta hai, sab theek ho to null
export function validateFiles(picked, existingCount = 0) {
  if (existingCount + picked.length > MAX_FILES) return `You can attach at most ${MAX_FILES} files.`;

  for (const file of picked) {
    const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return `${file.name}: unsupported type. Allowed: ${ALLOWED_EXTENSIONS.join(", ")}`;
    }
    if (file.size > MAX_FILE_BYTES) return `${file.name} is larger than 10 MB.`;
  }
  return null;
}

export const uploadFiles = (files) => {
  const form = new FormData();
  for (const file of files) form.append("files", file);
  return api.post("/uploads/files", form);
};

/* ------------------------------ Avatar ------------------------------ */

const AVATAR_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];
const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

export function validateAvatar(file) {
  const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
  if (!AVATAR_EXTENSIONS.includes(ext)) return "Profile photo must be a JPG, PNG or WebP image.";
  if (file.size > MAX_AVATAR_BYTES) return "Profile photo must be 2 MB or smaller.";
  return null;
}

export const uploadAvatar = (file) => {
  const form = new FormData();
  form.append("file", file);
  return api.post("/uploads/avatar", form);
};

export const removeAvatar = () => api.delete("/uploads/avatar");