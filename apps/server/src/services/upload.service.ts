import logger from "../logger";
import fs from "fs/promises";
import cloudinary from "../config/cloudinary";

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

export const uploadMultipleImagesCloudi = async (
  filePaths: string[],
  folder: string = "hikesike-app"
): Promise<string[]> => {
  try {
    const uploads = await Promise.all(
      filePaths.map(async (path) => {
        try {
          const result = await cloudinary.uploader.upload(path, { folder });
          return result.secure_url;
        } catch (err) {
          logger.error("Cloudinary upload failed for:", path, err);
          throw err; // bubble up so Promise.all fails
        } finally {
          // ALWAYS cleanup temp file
          await fs.unlink(path).catch(() => {});
        }
      })
    );
    return uploads;
  } catch (err: any) {
    logger.error("Cloudinary upload error (multiple):", err);
    throw new Error("Multiple image upload failed");
  }
};

const getPublicIdFromUrl = (url: string): string | null => {
  try {
    const parts = url.split("/upload/");
    if (parts.length < 2) return null;
    const afterUpload = parts[1];
    const withoutVersion = afterUpload.split("/").slice(1).join("/");
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
