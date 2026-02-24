import { Response } from "express";
import { AuthRequest } from "../../midddleware/auth.middleware.js";
import { DashboardRepositry } from "./dashboard.repo.js";

const repo = new DashboardRepositry();

export const summary = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const userId = req.user!.userId;
  const result = await repo.getSummary(userId);

  return res.json(result);
};

export const recentScans = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const result = await repo.getRecentScans(userId);

  return res.json(result);
};

export const weeklyTrend = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const result = await repo.getWeeklyTrend(userId);

  return res.json(result);
};

export const nutritionBreakdown = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const result = await repo.getNutritionBreakdown(userId);

  return res.json(result);
};

export const healthRisk = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const result = await repo.getHealthRisk(userId);

  return res.json(result);
};
