import { pool } from "../../config/database/db.js";

export type FoodInfo = {
  scanId: string;
  id: string;
  food: string;
  nutrients: object;
  calories: number;
  confidence: number;
  advice: string;
  substitute: string;
  healthCondition?: string;
  risk_level: string;
};

export class FoodRepositry {
  async insertToFood(
    scanId: string,
    id: string,
    food: string,
    nutrients: object,
    calories: number,
    confidence: number,
    advice: string,
    substitute: string,
    healthCondition: string,
    risk_level: string
  ): Promise<FoodInfo> {
    const client = await pool.connect();
    
    try {
      // ✅ Start transaction
      await client.query("BEGIN");
      
      const result = await client.query(
        "INSERT INTO food_scan (id, user_id, dish_name, nutrients, calories, confidence, health_assesment, recommendations, health_condition, risk_level, scanned_at, created_at) VALUES ($1, $2, $3, $4::jsonb, $5, $6, $7, $8, $9, $10, NOW(), NOW()) RETURNING *",
        [
          scanId,
          id,
          food,
          JSON.stringify(nutrients),
          calories,
          confidence,
          advice,
          substitute,
          healthCondition ?? null,
          risk_level,
        ]
      );
      
      // ✅ Commit transaction
      await client.query("COMMIT");
      
      return result.rows[0] ?? null;
    } catch (error) {
      // ✅ Rollback transaction on error
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async mealHistory() {
    const result = await pool.query(
      "SELECT * FROM food_scan ORDER BY created_at DESC LIMIT 10"
    );

    return result.rows ?? [];
  }
}
