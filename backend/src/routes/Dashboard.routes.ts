import { Router } from "express";
import { authenticate, authorize } from "../midddleware/auth.middleware.js";
import { DashboardController } from "../controllers/Dashboard.controller.js";

const DashboardRouter = Router();

DashboardRouter.get("/summary",  authenticate, authorize("user"), DashboardController.summary);

DashboardRouter.get("/recent-scans", authenticate, authorize("user"), DashboardController.recentScans);

DashboardRouter.get("/weekly-trend",  authenticate,authorize("user"), DashboardController.weeklyTrend);

DashboardRouter.get("/nutrition-breakdown",  authenticate, authorize("user"), DashboardController.nutritionBreakdown);

DashboardRouter.get("/health-risk",  authenticate, authorize("user"), DashboardController.healthRisk);

export default DashboardRouter;