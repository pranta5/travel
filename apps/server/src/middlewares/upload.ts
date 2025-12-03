// src/middlewares/upload.ts
import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure temp upload directory exists
const uploadDir = "uploads/temp";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedTypes = /jpeg|jpg|png|webp|gif/;
  const mimetype = allowedTypes.test(file.mimetype);
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error("Only image files (jpeg, jpg, png, webp, gif) are allowed!"));
};

export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
    files: 25, // max 25 files total (1 featured + 24 activities)
  },
  fileFilter,
});

// Reusable field configurations
export const uploadPackageImages = upload.fields([
  { name: "featuredImage", maxCount: 1 },
  { name: "activityImages", maxCount: 20 }, // supports up to 20 activities
]);

// src/middlewares/upload.ts  ← just add this one line
export const uploadHotelImages = upload.array("hotelImage", 10); // max 10 images

export const uploadSingleImage = upload.single("image");
export const uploadMultipleImagesMiddle = upload.array("images", 20);
