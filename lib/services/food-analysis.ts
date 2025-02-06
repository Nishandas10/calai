import { supabase } from "../supabase";

export interface FoodAnalysis {
  ingredients: {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }[];
  total: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export async function analyzeFoodImage(
  imagePath: string
): Promise<FoodAnalysis> {
  try {
    const { data, error } = await supabase.functions.invoke<FoodAnalysis>(
      "analyze-food",
      {
        body: { imagePath },
      }
    );

    if (error) throw error;
    if (!data) throw new Error("No analysis data received");

    return data;
  } catch (error) {
    console.error("Error analyzing food image:", error);
    throw error;
  }
}
