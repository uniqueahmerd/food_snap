import { Request, Response } from "express";
import { pool } from "../config/db.js";
import { analyzeWithAI } from "../services/ai.service.js";
import { v4 as uuidv4 } from "uuid";
// import { fetchNutrition } from "../services/nutrition.service";

export const analyzeFood = async (req: Request, res: Response) => {
  try {
    const { image, healthCondition } = req.body;

    if (!image) {
      return res.status(400).json({ message: "Image is required" });
    }

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // 1️⃣ Call AI service
    const aiResult = await analyzeWithAI(
      image,
      healthCondition ? [healthCondition] : []
    );

    const { food, confidence, nutrients, predictions, advice, substitute } =
      aiResult;

      const scanId = uuidv4();

    const userId = req.user.userId;
    // 2️⃣ Save to DB (optional, safe)

    await pool.query(
      `
      INSERT INTO food_scan (
        id,
        user_id,
        dish_name,
        nutrients,
        confidence,
        health_assesment,
        recommendations,
        health_condition,
        scanned_at
      )
      VALUES ($1, $2, $3, $4::jsonb, $5, $6, $7, $8, NOW())
      `,
      [
        scanId,
        userId,
        food,
        JSON.stringify(nutrients),
        confidence,
        advice,
        substitute,
        healthCondition ?? null,
      ]
    );

    // 3️⃣ SEND FULL AI RESPONSE TO FRONTEND
    return res.json({
      id: scanId,
      userId,
      food,
      confidence,
      nutrients,
      predictions,
      healthCondition,
      advice,
      substitute,
    });
  } catch (error: any) {
    console.error("Food analysis failed:", error.message);
    console.log(error.message);

    res.status(500).json({
      message: "Food analysis failed",
      error: error.message,
    });
  }
};

export const getHistory = async (_req: Request, res: Response) => {
  const result = await pool.query(
    `SELECT * FROM food_analysis ORDER BY created_at DESC LIMIT 20`
  );
  res.json(result.rows);
};


