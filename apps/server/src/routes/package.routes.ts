// src/routes/package.routes.ts
import { Router } from "express";
import {
  createPackage,
  getAllPackages,
  getPackageBySlug,
  updatePackage,
  updatePackageStatus,
  hardDeletePackage,
  getPackageById,
} from "../controllers/package.controller";
import { requireAuth } from "../middlewares/requireAuth";
import { uploadPackageImages } from "../middlewares/upload";

const router = Router();

// ==================== PUBLIC ROUTES ====================
router.get("/", getAllPackages);
router.get("/:slug", getPackageBySlug);
router.get("/single/:id", getPackageById);

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

// Status
router.put("/:id", requireAuth(["admin", "manager"]), updatePackageStatus);

// ==================== PROTECTED: Admin  ====================

// Hard delete
router.delete("/hard/:id", requireAuth(["admin"]), hardDeletePackage);

export default router;
