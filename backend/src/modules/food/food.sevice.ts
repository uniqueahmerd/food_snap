import { v4 as uuidv4 } from "uuid";
import { analyzeWithAI } from "../../services/ai.service.js";
import { FoodRepositry } from "./food.repo.js";

export class FoodService {
  private repo = new FoodRepositry();

  async analyzeFood(image: string, healthCondition: string, id: string) {
    try {
      if (!image) {
        return new Error("Image is required");
      }

      // 1️⃣ Call AI service
      const aiResult = await analyzeWithAI(
        image,
        healthCondition ? [healthCondition] : []
      );

      const { food, confidence, nutrients, advice, substitute } = aiResult;

      const scanId = uuidv4();
      const userId = id;

      const calories = nutrients.calories;
      const result = await this.repo.insertToFood({
        scanId,
        userId,
        food,
        nutrients,
        calories,
        confidence,
        advice,
        substitute,
        healthCondition,
      });
       console.log("result from service", result);
       
      return result;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}
