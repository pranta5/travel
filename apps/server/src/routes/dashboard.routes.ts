import { Router } from "express";

import { getDashboardSummary } from "../controllers/dashboard.controller";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

router.get("/dashboard/summary", requireAuth(["admin"]), getDashboardSummary);
export default router;
