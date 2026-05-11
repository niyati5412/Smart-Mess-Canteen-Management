const multer       = require("multer");
const path         = require("path");
const cloudinary   = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// ── Cloudinary config ─────────────────────────────────────────────────────────
cloudinary.config({
  cloud_name : process.env.CLOUDINARY_CLOUD_NAME,
  api_key    : process.env.CLOUDINARY_API_KEY,
  api_secret : process.env.CLOUDINARY_API_SECRET,
});

// ── Cloudinary storage ────────────────────────────────────────────────────────
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder        : "messmate/uploads",   // Cloudinary folder
    allowed_formats: ["jpeg", "jpg", "png", "webp"],
    transformation: [{ width: 800, height: 800, crop: "limit" }], // auto resize
  },
});

// ── File filter ───────────────────────────────────────────────────────────────
const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp/;
  const isValid = allowed.test(path.extname(file.originalname).toLowerCase());
  isValid ? cb(null, true) : cb(new Error("Only image files allowed"));
};

// ── Multer instance ───────────────────────────────────────────────────────────
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});

module.exports = { upload, cloudinary };