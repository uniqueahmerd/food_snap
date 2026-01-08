import axios from "axios";

// Define the structure of the AI service response
interface AIPrediction {
  label: string;
  confidence: number;
}

interface AINutrients {
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
}

interface AIResponse {
  food: string;
  confidence: number;
  predictions: AIPrediction[];
  nutrients: AINutrients;
  substitute: string;
  advice: string;
  error?: string; // To handle error cases from the AI service
}


export const analyzeWithAI = async (imageBase64: string, conditions: string[]) => {

  const response = await axios.post<AIResponse>(
    process.env.AI_URL as string,
    { image: imageBase64, conditions },
    { timeout: 30000 } // 30-second timeout for the AI model
  );

  const aiResponse = response.data;
  console.log("ai response", aiResponse);
  
  const advice = String(aiResponse.advice);

  // Handle explicit errors returned from the AI service
  if (aiResponse.error) {
    throw new Error(`AI Service Error: ${aiResponse.error}`);
  }

  // Validate the structure of the successful response
  if (
    !aiResponse ||
    typeof aiResponse.food !== "string" ||
    typeof aiResponse.confidence !== "number" ||
    !Array.isArray(aiResponse.predictions) ||
    typeof aiResponse.nutrients !== 'object' ||
    typeof advice !== "string" ||
    typeof aiResponse.substitute !== "string"
  ) {
    throw new Error("Invalid or incomplete AI response structure");
  }

  return {
    food: aiResponse.food,
    confidence: aiResponse.confidence,
    predictions: aiResponse.predictions,
    nutrients: aiResponse.nutrients,
    advice: advice,
    substitute: aiResponse.substitute
  };
};