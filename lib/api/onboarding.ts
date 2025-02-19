import { supabase } from "../supabase";

export interface HealthMetrics {
  weight: number;
  height: number;
  age: number;
  gender: string;
  activity_level: string;
}

export interface UserGoals {
  primary_goal: string;
  target_weight?: number;
  weekly_pace: number;
}

export interface DietaryPreferences {
  is_vegetarian: boolean;
  is_vegan: boolean;
  is_gluten_free: boolean;
  is_dairy_free: boolean;
  diet_style: string;
  excluded_ingredients?: string[];
}

export interface MacroGoals {
  protein: number;
  carbs: number;
  fat: number;
  use_auto_macros: boolean;
}

export const saveHealthMetrics = async (metrics: HealthMetrics) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from("user_health_metrics")
    .upsert({
      user_id: session.user.id,
      ...metrics,
    })
    .single();

  if (error) throw error;
  return data;
};

export const saveUserGoals = async (goals: UserGoals) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from("user_goals")
    .upsert({
      user_id: session.user.id,
      ...goals,
    })
    .single();

  if (error) throw error;
  return data;
};

export const saveDietaryPreferences = async (
  preferences: DietaryPreferences,
) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from("user_dietary_preferences")
    .upsert({
      user_id: session.user.id,
      ...preferences,
    })
    .single();

  if (error) throw error;
  return data;
};

export const saveMacroGoals = async (macros: MacroGoals) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from("user_macro_goals")
    .upsert({
      user_id: session.user.id,
      ...macros,
    })
    .single();

  if (error) throw error;
  return data;
};

export const saveOnboardingData = async (
  healthMetrics: HealthMetrics,
  goals: UserGoals,
  dietaryPreferences: DietaryPreferences,
  macroGoals: MacroGoals,
) => {
  try {
    await saveHealthMetrics(healthMetrics);
    await saveUserGoals(goals);
    await saveDietaryPreferences(dietaryPreferences);
    await saveMacroGoals(macroGoals);
    return true;
  } catch (error) {
    console.error("Error saving onboarding data:", error);
    throw error;
  }
};
