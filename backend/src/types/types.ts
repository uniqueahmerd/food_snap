export type HealthStatus =
  | "normal"
  | "diabetic"
  | "cholesterol watch"
  | "pregnant/nursing"
  | "weight loss"
  | "hypertensive";

export interface FoodAnalysisResult {
  nutrients: {
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
  healthAssessment: {
    status: HealthStatus;
    summary: string;
  };
  recommendations: string[];
}
