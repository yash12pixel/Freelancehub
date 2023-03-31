const cloudinary = require("cloudinary");
const multer = require("multer");
const dotenv = require("dotenv");
dotenv.config;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

// SET STORAGE
const storage = multer.diskStorage({
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

// file type validation
const fileType = (req, file, cb) => {
  if (
    file.mimetype.startsWith("image/jpeg") ||
    file.mimetype.startsWith("image/png")
  ) {
    cb(null, true);
  } else {
    cb(new Error("File type should be pdf/jpeg/png and 25MB only!"));
  }
};

const upload = multer({
  storage,
  fileFilter: fileType,
  limits: { fileSize: 3200000 },
});

// const uploader = async (path) =>
//   await cloudinary.uploader.upload(path, "memories");

module.exports = upload;
