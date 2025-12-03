// src/routes/package.routes.ts
import { Router } from "express";
import {
  createPackage,
  getAllPackages,
  getPackageBySlug,
  updatePackage,
  softDeletePackage,
  hardDeletePackage,
} from "../controllers/package.controller";
import { requireAuth } from "../middlewares/requireAuth";
import { uploadPackageImages } from "../middlewares/upload";

const router = Router();

// ==================== PUBLIC ROUTES ====================
router.get("/", getAllPackages);
router.get("/:slug", getPackageBySlug);

// ==================== PROTECTED: Admin & Manager Only ====================

// Create Package
router.post(
  "/",
  requireAuth(["admin", "manager"]),
  uploadPackageImages,
  createPackage
);

// Update Package (partial)
router.patch(
  "/:id",
  requireAuth(["admin", "manager"]),
  uploadPackageImages,
  updatePackage
);

// Soft Delete
router.delete("/:id", requireAuth(["admin", "manager"]), softDeletePackage);

// ==================== PROTECTED: Admin  ====================

// Hard delete
router.delete("/hard/:id", requireAuth(["admin"]), hardDeletePackage);

export default router;
