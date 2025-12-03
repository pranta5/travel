import logger from "../logger";
import fs from "fs/promises"; // For cleaning up temp files
import cloudinary from "../config/cloudinary";

/**
 * Upload a single image to Cloudinary.
 * @param filePath Local path to the image file.
 * @param folder Optional folder in Cloudinary (default: "hikesike-app").
 * @returns Secure URL of the uploaded image.
 */
export const uploadSingleImage = async (
  filePath: string,
  folder: string = "hikesike-app"
): Promise<string> => {
  try {
    const result = await cloudinary.uploader.upload(filePath, { folder });
    await fs.unlink(filePath).catch(() => {}); // Clean up temp file
    return result.secure_url;
  } catch (err: any) {
    logger.error("Cloudinary upload error (single):", err);
    throw new Error("Image upload failed");
  }
};

/**
 * Upload multiple images to Cloudinary.
 * @param filePaths Array of local paths to image files.
 * @param folder Optional folder in Cloudinary (default: "hikesike-app").
 * @returns Array of secure URLs for the uploaded images.
 */
export const uploadMultipleImagesCloudi = async (
  filePaths: string[],
  folder: string = "hikesike-app"
): Promise<string[]> => {
  try {
    const uploads = await Promise.all(
      filePaths.map((path) =>
        cloudinary.uploader.upload(path, { folder }).then(async (result) => {
          await fs.unlink(path).catch(() => {}); // Clean up temp file
          return result.secure_url;
        })
      )
    );
    return uploads;
  } catch (err: any) {
    logger.error("Cloudinary upload error (multiple):", err);
    throw new Error("Multiple image upload failed");
  }
};

/**
 * Extract public_id from Cloudinary URL
 * Example: https://res.cloudinary.com/dxxx/image/upload/v1234567890/hikesike-app/packages/abc123.jpg
 * → public_id = "hikesike-app/packages/abc123"
 */
const getPublicIdFromUrl = (url: string): string | null => {
  try {
    const parts = url.split("/upload/");
    if (parts.length < 2) return null;
    const afterUpload = parts[1];
    const withoutVersion = afterUpload.split("/").slice(1).join("/"); // remove v123...
    const withoutExtension = withoutVersion.split(".")[0];
    return withoutExtension;
  } catch {
    return null;
  }
};

/**
 * Delete multiple images from Cloudinary
 */
export const deleteFromCloudinary = async (
  imageUrls: string[]
): Promise<void> => {
  const publicIds = imageUrls
    .map(getPublicIdFromUrl)
    .filter((id): id is string => id !== null);

  if (publicIds.length === 0) return;

  try {
    await cloudinary.api.delete_resources(publicIds, {
      type: "upload",
      resource_type: "image",
    });
    logger.info(`Deleted ${publicIds.length} images from Cloudinary`);
  } catch (err: any) {
    logger.warn("Failed to delete some images from Cloudinary:", err.message);
    // Don't throw — we still want to delete the DB record
  }
};
