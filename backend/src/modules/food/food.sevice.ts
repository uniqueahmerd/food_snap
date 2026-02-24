import { v4 as uuidv4 } from "uuid";

//local imports
import { FoodRepositry } from "./food.repo.js";
import { analyzeWithAI } from "../../services/ai.service.js";

export class FoodService {
  private repo = new FoodRepositry();

  async analyzeFood(image: string, healthCondition: string, userId: string) {
    try {
      if (!image) {
        throw new Error("Image is required");
      }

      // 1️⃣ Call AI service
      const aiResult = await analyzeWithAI(
        image,
        healthCondition ? [healthCondition] : [],
      );

      const { food, confidence, nutrients, advice, substitute, risk_level } =
        aiResult;

      const scanId = uuidv4();
      const id = userId;

      const calories = nutrients.calories;
      const result = await this.repo.insertToFood(
        scanId,
        id,
        food,
        nutrients,
        calories,
        confidence,
        advice,
        substitute,
        healthCondition,
        risk_level,
      );
      // Return response in format client expects
      return {
        result: {
          food,
          confidence,
          nutrients,
          advice,
          substitute,
          healthCondition,
          riskLevel: risk_level,
          calories,
          scanId,
        },
      };
    } catch (error: any) {
      console.log(error.message);
      throw new Error(error.message);
    }
  }

  async getMealHistory() {
    const result = await this.repo.mealHistory();
    return result;
  }
}
