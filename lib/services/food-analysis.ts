import { supabase } from "../supabase";

export interface Ingredient {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export interface FoodAnalysis {
  ingredients: Ingredient[];
  total: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
}

export async function analyzeFoodImage(
  imagePath: string,
): Promise<FoodAnalysis> {
  try {
    const { data, error } = await supabase.functions.invoke<FoodAnalysis>(
      "analyze-food",
      {
        body: {
          imagePath,
          analysisPrompt:
            `Analyze this food image and provide detailed nutritional information including calories, protein, carbohydrates, fat, and fiber content. Return the data in the following JSON format:
          {
            "ingredients": [{
              "name": "Food Item Name",
              "calories": number,
              "protein": number,
              "carbs": number,
              "fat": number,
              "fiber": number
            }],
            "total": {
              "calories": number,
              "protein": number,
              "carbs": number,
              "fat": number,
              "fiber": number
            }
          }
          Ensure all nutritional values are per 100g serving, and fiber content is accurately estimated based on the food type.`,
        },
      },
    );

    if (error) throw error;
    if (!data) throw new Error("No analysis data received");

    return data;
  } catch (error) {
    console.error("Error analyzing food image:", error);
    throw error;
  }
}
