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