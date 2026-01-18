import { pool } from "../../config/db.js";

export type foodInfo = {
  scanId: string;
  userId: string;
  food: string;
  nutrients: object;
  calories: number;
  confidence: number;
  advice: string;
  substitute: string;
  healthCondition?: string;
};

export class FoodRepositry {
  async insertToFood({
    scanId,
    userId,
    food,
    nutrients,
    calories,
    confidence,
    advice,
    substitute,
    healthCondition,
  }: foodInfo): Promise<foodInfo> {
    const result = await pool.query(
      "INSERT INTO food_scan (id, user_id, dish_name, nutrients, calories, confidence, health_assesment, recommendations, health_condition, scanned_at, created_at) VALUES ($1, $2, $3, $4::jsonb, $5, $6, $7, $8,$9, NOW(), NOW()",
      [
        scanId,
        userId,
        food,
        JSON.stringify(nutrients),
        calories,
        confidence,
        advice,
        substitute,
        healthCondition,
      ]
    );
    return result.rows[0] ?? null;
  }
}
