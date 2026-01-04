import { Response } from "express";
import { AuthRequest } from "../midddleware/auth.middleware.js";
import {
  getSummary,
  getRecentScans,
  getWeeklyTrend,
  getNutritionBreakdown,
  getHealthRisk,
} from "../services/Dashboard.service.js";

export const DashboardController = {
  async summary(req: AuthRequest, res: Response) {
     if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const userId = req.user!.userId;
    console.log("id", userId);

    const data = await getSummary(userId);
    return res.json(data);
  },

  async recentScans(req: AuthRequest, res: Response) {
    const userId = req.user!.userId;
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const data = await getRecentScans(userId);
    console.log(data);

    return res.json(data);
  },

  async weeklyTrend(req: AuthRequest, res: Response) {
    const userId = req.user!.userId;
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const data = await getWeeklyTrend(userId);
    return res.json(data);
  },

  async nutritionBreakdown(req: AuthRequest, res: Response) {
    const userId = req.user!.userId;
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const data = await getNutritionBreakdown(userId);
    return res.json(data);
  },

  async healthRisk(req: AuthRequest, res: Response) {
    const userId = req.user!.userId;
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const data = await getHealthRisk(userId);
    return res.json(data);
  },
};
