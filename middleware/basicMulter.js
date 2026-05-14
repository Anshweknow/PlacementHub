const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const safeBaseName = path
      .basename(file.originalname, path.extname(file.originalname))
      .replace(/[^a-zA-Z0-9-_]/g, "_")
      .slice(0, 80);
    const safeExt = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${safeBaseName}${safeExt}`);
  },
});

const fileFilter = (req, file, cb) => {
  const fieldRules = {
    resume: ["application/pdf"],
    photo: ["image/jpeg", "image/png", "image/webp"],
  };
  const allowedMimeTypes = fieldRules[file.fieldname] || [...fieldRules.resume, ...fieldRules.photo];

  if (!allowedMimeTypes.includes(file.mimetype)) {
    const error = new Error("Unsupported file type for this upload field.");
    error.statusCode = 400;
    return cb(error, false);
  }
  return cb(null, true);
};

module.exports = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });
