import path from "path";
import multer from "multer";
import ApiError from "../utils/ApiError.js";

const MB = 1024 * 1024;

const TYPES = {
  ".jpg": { kind: "jpg", mimes: ["image/jpeg"] },
  ".jpeg": { kind: "jpg", mimes: ["image/jpeg"] },
  ".png": { kind: "png", mimes: ["image/png"] },
  ".webp": { kind: "webp", mimes: ["image/webp"] },
  ".pdf": { kind: "pdf", mimes: ["application/pdf"] },
  // Kuch tools zip ko octet-stream bhejte hain, signature check phir bhi hota hai
  ".zip": {
    kind: "zip",
    mimes: ["application/zip", "application/x-zip-compressed", "application/octet-stream"],
  },
};

const IMAGE_EXTS = [".jpg", ".jpeg", ".png", ".webp"];
const ALL_EXTS = Object.keys(TYPES);

const startsWith = (buf, bytes) => bytes.every((b, i) => buf[i] === b);

const SIGNATURES = {
  jpg: (b) => startsWith(b, [0xff, 0xd8, 0xff]),
  png: (b) => startsWith(b, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  webp: (b) =>
    b.length > 12 && b.subarray(0, 4).toString("ascii") === "RIFF" && b.subarray(8, 12).toString("ascii") === "WEBP",
  pdf: (b) => b.subarray(0, 5).toString("ascii") === "%PDF-",
  zip: (b) => startsWith(b, [0x50, 0x4b]) && (b[2] === 0x03 || b[2] === 0x05),
};

const extOf = (name) => path.extname(name || "").toLowerCase();

const createUpload = ({ field, exts, maxSize, maxFiles, single = false }) => {
  const uploader = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: maxSize, files: maxFiles, fields: 5, parts: maxFiles + 5 },
    fileFilter: (req, file, cb) => {
      const ext = extOf(file.originalname);
      const type = TYPES[ext];
      if (!type || !exts.includes(ext) || !type.mimes.includes(file.mimetype)) {
        return cb(new ApiError(400, `Unsupported file: ${file.originalname}. Allowed types: ${exts.join(", ")}`));
      }
      cb(null, true);
    },
  });

  const run = single ? uploader.single(field) : uploader.array(field, maxFiles);

  const parse = (req, res, next) =>
    run(req, res, (err) => {
      if (!err) {
        if (single && req.file) req.files = [req.file];
        return next();
      }
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return next(new ApiError(413, `File is too large. Maximum size is ${maxSize / MB} MB`));
        }
        if (err.code === "LIMIT_UNEXPECTED_FILE") {
          return next(new ApiError(400, `Send at most ${maxFiles} file(s) in the "${field}" field`));
        }
        return next(new ApiError(400, err.message));
      }
      next(err);
    });

  const verify = (req, res, next) => {
    const files = req.files || [];
    if (!files.length) return next(new ApiError(400, "No file received"));

    for (const file of files) {
      const ext = extOf(file.originalname);
      const check = SIGNATURES[TYPES[ext].kind];
      if (!check(file.buffer)) {
        return next(new ApiError(400, `${file.originalname} is not a valid ${ext} file`));
      }
    }
    next();
  };

  return [parse, verify];
};

export const uploadImages = createUpload({ field: "files", exts: IMAGE_EXTS, maxSize: 5 * MB, maxFiles: 5 });
export const uploadDocs = createUpload({ field: "files", exts: ALL_EXTS, maxSize: 10 * MB, maxFiles: 5 });
export const uploadAvatarFile = createUpload({
  field: "file",
  exts: IMAGE_EXTS,
  maxSize: 2 * MB,
  maxFiles: 1,
  single: true,
});