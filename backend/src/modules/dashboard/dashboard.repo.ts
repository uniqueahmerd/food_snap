import { pool } from "../../config/database/db.js";

export class DashboardRepositry {
  async getSummary(userId: string) {
    const todayCaloriesQuery =
      "SELECT COALESCE(SUM((nutrients->>'calories')::INT), 0) AS total_calories FROM food_scan WHERE user_id = $1 AND DATE(scanned_at) = CURRENT_DATE";

    const healthConditionQuery = "SELECT health_condition FROM food_scan WHERE user_id = $1"

    const mealsCountQuery =
      "SELECT COUNT(*)::INT AS count FROM food_scan WHERE user_id = $1";

    const [caloriesRes, mealsRes] = await Promise.all([
      pool.query(todayCaloriesQuery, [userId]),
      pool.query(mealsCountQuery, [userId]),
    ]);

    return {
      todaysCalories: caloriesRes.rows[0].total_calories,
      mealsLogged: mealsRes.rows[0].count,
      healthScore: 85, // Placeholder
      caloriesTarget: 2000, // Placeholder
      goalsMet: "8/10", // Placeholder
    };
  }

  async getRecentScans(userId: string) {
    const query =
      "SELECT dish_name AS food_name, confidence, (nutrients->>'calories')::INT AS calories, health_condition, risk_level, scanned_at FROM food_scan WHERE user_id = $1 ORDER BY scanned_at DESC LIMIT 5;";
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  async getWeeklyTrend(userId: string) {
    const query =
      "SELECT TO_CHAR(DATE(scanned_at), 'Day') AS day, SUM((nutrients->>'calories')::INT)::int AS calories FROM food_scan WHERE user_id = $1 AND scanned_at >= NOW() - INTERVAL '7 days' GROUP BY day, DATE(scanned_at) ORDER BY DATE(scanned_at);";
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  async getNutritionBreakdown(userId: string) {
    const query =
      "SELECT  SUM((nutrients->>'protein')::INT) AS protein, SUM((nutrients->>'carbs')::INT) AS carbs, SUM((nutrients->>'fat')::INT) AS fat, SUM((nutrients->>'fiber')::INT) AS fiber FROM food_scan WHERE user_id = $1 AND scanned_at >= NOW() - INTERVAL '7 days';";
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  }

  async getHealthRisk(userId: string) {
    const query =
      "SELECT DATE_TRUNC('week', scanned_at) AS week, COUNT(*) FILTER (WHERE risk_level = 'high') AS high, COUNT(*) FILTER (WHERE risk_level = 'medium') AS medium, COUNT(*) FILTER (WHERE risk_level = 'low') AS low FROM food_scan WHERE user_id = $1 GROUP BY week ORDER BY week;";
    const result = await pool.query(query, [userId]);
    return result.rows;
  }
}
