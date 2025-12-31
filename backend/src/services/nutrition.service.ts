import axios from "axios";

const USDA_API_KEY = process.env.USDA_API_KEY!;

type NutritionResult = {
  calories: number;
  protein: string;
  carbs: string;
  fat: string;
  fiber: string;
  sodium: string;
  sugar: string;
  cholesterol: string;
  calcium: string;
  iron: string;
};

export async function fetchNutrition(food: string): Promise<NutritionResult> {
  try {
    const res = await axios.get(
      "https://api.nal.usda.gov/fdc/v1/foods/search",
      {
        params: {
          api_key: USDA_API_KEY,
          query: food,
          pageSize: 1,
        },
      }
    );

    const foodData = res.data.foods?.[0];

    // ✅ DEFAULT SAFE SHAPE (FRONTEND NEVER CRASHES)
    const nutrition: NutritionResult = {
      calories: 0,
      protein: "0g",
      carbs: "0g",
      fat: "0g",
      fiber: "0g",
      sodium: "0mg",
      sugar: "0g",
      cholesterol: "0mg",
      calcium: "0mg",
      iron: "0mg",
    };

    if (!foodData?.foodNutrients) {
      return nutrition;
    }

    for (const n of foodData.foodNutrients) {
      const name = n.nutrientName?.toLowerCase();
      const value = n.value;

      if (typeof value !== "number") continue;

      if (name?.includes("energy")) nutrition.calories = Math.round(value);
      if (name === "protein") nutrition.protein = `${value}g`;
      if (name?.includes("carbohydrate")) nutrition.carbs = `${value}g`;
      if (name?.includes("total lipid")) nutrition.fat = `${value}g`;
      if (name?.includes("fiber")) nutrition.fiber = `${value}g`;
      if (name?.includes("sodium")) nutrition.sodium = `${value}mg`;
      if (name?.includes("sugars")) nutrition.sugar = `${value}g`;
      if (name?.includes("cholesterol")) nutrition.cholesterol = `${value}mg`;
      if (name?.includes("calcium")) nutrition.calcium = `${value}mg`;
      if (name?.includes("iron")) nutrition.iron = `${value}mg`;
    }

    return nutrition;
  } catch (err) {
    console.error("Nutrition fetch failed:", err);

    // ✅ ALWAYS RETURN SAFE SHAPE
    return {
      calories: 0,
      protein: "0g",
      carbs: "0g",
      fat: "0g",
      fiber: "0g",
      sodium: "0mg",
      sugar: "0g",
      cholesterol: "0mg",
      calcium: "0mg",
      iron: "0mg",
    };
  }
}
