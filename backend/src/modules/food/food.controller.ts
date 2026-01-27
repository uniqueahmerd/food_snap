import { Request, Response } from "express";

//local imports
import { FoodService } from "./food.sevice.js";

const service = new FoodService();

export const analyze = async (req: Request, res: Response) => {
  try {
    const { image, healthCondition } = req.body;

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.user.userId;
    const response = await service.analyzeFood(image, healthCondition, userId);
    console.log("result from cont", response);

    res.json(response.result);
  } catch (error: any) {
    res.status(500).json({
      message: "Food analysis failed",
      error: error.message,
    });
  }
};

export const mealHistory = async (req: Request, res: Response) => {
  try {
    const result = await service.getMealHistory();

    res.json({
      result,
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Error fatching meal history please try again later",
      error: error.message,
    });
  }
};
