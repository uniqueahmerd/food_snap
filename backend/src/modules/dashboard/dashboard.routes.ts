import { Router } from "express";

//local imports
import { authenticate, authorize } from "../../midddleware/auth.middleware.js";
import { healthRisk, nutritionBreakdown, recentScans, summary, weeklyTrend } from "./dashboard.controller.js";

const DashboardRouter = Router();

DashboardRouter.get("/summary",  authenticate, authorize("user"), summary);

DashboardRouter.get("/recent-scans", authenticate, authorize("user"), recentScans);

DashboardRouter.get("/weekly-trend",  authenticate,authorize("user"), weeklyTrend);

DashboardRouter.get("/nutrition-breakdown",  authenticate, authorize("user"), nutritionBreakdown);

DashboardRouter.get("/health-risk",  authenticate, authorize("user"), healthRisk);

export default DashboardRouter;