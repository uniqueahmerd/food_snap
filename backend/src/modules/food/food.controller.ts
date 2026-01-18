import { Request, Response } from "express";
import { FoodService } from "./food.sevice.js";

const service = new FoodService();

export const analyze = async (req: Request, res: Response) => {
  try {
    const { image, healthCondition } = req.body;

    const userId = req.user.userId;
    const {result}: any = await service.analyzeFood(image, healthCondition, userId);
    
    console.log("result from cont", result);
    
    res.json({
      result,
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Food analysis failed",
      error: error.message,
    });
  }
};
