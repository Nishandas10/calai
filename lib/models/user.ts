import { supabase } from "@/lib/supabase";

export interface UserProfile {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface UserHealthMetrics {
  user_id?: string;
  weight: number;
  height: number;
  age: number;
  gender: string;
  activity_level: string;
  bmi: number;
  bmi_category: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserGoals {
  id: string;
  user_id: string;
  primary_goal:
    | "Lose weight"
    | "Maintain"
    | "Gain muscle"
    | "Healthy lifestyle";
  target_weight: number | null;
  weekly_pace: number;
  created_at: string;
  updated_at: string;
}

export interface UserDietaryPreferences {
  id: string;
  user_id: string;
  is_vegetarian: boolean;
  is_vegan: boolean;
  is_gluten_free: boolean;
  is_dairy_free: boolean;
  diet_style: "Keto" | "Low-carb" | "Mediterranean" | "None";
  created_at: string;
  updated_at: string;
}

export interface UserMacroGoals {
  id: string;
  user_id: string;
  protein: number;
  carbs: number;
  fat: number;
  use_auto_macros: boolean;
  created_at: string;
  updated_at: string;
}

export class UserModel {
  static async createProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    const { data: profile, error } = await supabase
      .from("user_profiles")
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return profile;
  }

  static async getProfile(userId: string): Promise<UserProfile | null> {
    const { data: profile, error } = await supabase
      .from("user_profiles")
      .select()
      .eq("id", userId)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return profile;
  }

  static async updateProfile(
    userId: string,
    data: Partial<UserProfile>
  ): Promise<UserProfile> {
    const { data: profile, error } = await supabase
      .from("user_profiles")
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;
    return profile;
  }

  static async createHealthMetrics(metrics: Partial<UserHealthMetrics>) {
    try {
      const { data, error } = await supabase
        .from("user_health_metrics")
        .upsert(metrics)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error creating health metrics:", error);
      throw error;
    }
  }

  static async getHealthMetrics(
    userId: string
  ): Promise<UserHealthMetrics | null> {
    const { data: metrics, error } = await supabase
      .from("user_health_metrics")
      .select()
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return metrics;
  }

  static async createGoals(data: Partial<UserGoals>): Promise<UserGoals> {
    const { data: goals, error } = await supabase
      .from("user_goals")
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return goals;
  }

  static async getGoals(userId: string): Promise<UserGoals | null> {
    const { data: goals, error } = await supabase
      .from("user_goals")
      .select()
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return goals;
  }

  static async createDietaryPreferences(
    data: Partial<UserDietaryPreferences>
  ): Promise<UserDietaryPreferences> {
    const { data: preferences, error } = await supabase
      .from("user_dietary_preferences")
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return preferences;
  }

  static async getDietaryPreferences(
    userId: string
  ): Promise<UserDietaryPreferences | null> {
    const { data: preferences, error } = await supabase
      .from("user_dietary_preferences")
      .select()
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return preferences;
  }

  static async createMacroGoals(
    data: Partial<UserMacroGoals>
  ): Promise<UserMacroGoals> {
    const { data: macros, error } = await supabase
      .from("user_macro_goals")
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return macros;
  }

  static async getMacroGoals(userId: string): Promise<UserMacroGoals | null> {
    const { data: macros, error } = await supabase
      .from("user_macro_goals")
      .select()
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return macros;
  }

  static async hasCompletedOnboarding(userId: string): Promise<boolean> {
    try {
      const [healthMetrics, goals, dietaryPreferences, macroGoals] =
        await Promise.all([
          this.getHealthMetrics(userId),
          this.getGoals(userId),
          this.getDietaryPreferences(userId),
          this.getMacroGoals(userId),
        ]);

      return !!(healthMetrics && goals && dietaryPreferences && macroGoals);
    } catch (error) {
      console.error("Error checking onboarding status:", error);
      return false;
    }
  }
}
