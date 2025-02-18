import React, { createContext, useContext, useState } from 'react';
import { supabase } from '@/lib/supabase';

type DietaryPreference = 'Vegetarian' | 'Vegan' | 'Gluten-free' | 'Dairy-free';
type DietStyle = 'Keto' | 'Low-carb' | 'Mediterranean' | 'None';
type Goal = 'Lose weight' | 'Maintain' | 'Gain muscle' | 'Healthy lifestyle';

interface OnboardingData {
  // User Info
  name: string | null;
  gender: 'male' | 'female' | 'prefer_not_to_say' | null;
  birthday: Date | null;
  activityLevel: number | null;
  height: number | null;
  weight: number | null;
  
  // Goals
  primaryGoal: Goal | null;
  targetWeight: number | null;
  weeklyPace: number | null;
  
  // Dietary Preferences
  dietaryPreferences: DietaryPreference[];
  dietStyle: DietStyle | null;
  
  // Macro Goals
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
  useAutoMacros: boolean;
}

interface OnboardingContextType {
  data: OnboardingData;
  setName: (name: string) => void;
  setGender: (gender: 'male' | 'female' | 'prefer_not_to_say') => void;
  setBirthday: (date: Date) => void;
  setActivityLevel: (level: number) => void;
  setHeight: (height: number) => void;
  setWeight: (weight: number) => void;
  setGoals: (goal: Goal, targetWeight: number | null, pace: number) => void;
  setDietaryPreferences: (preferences: DietaryPreference[], style: DietStyle) => void;
  setMacros: (protein: number, carbs: number, fat: number, useAuto: boolean) => void;
  calculateMacros: (weight: number, height: number, age: number, gender: string, activityLevel: number) => void;
  saveOnboardingData: () => Promise<void>;
}

const defaultOnboardingData: OnboardingData = {
  name: null,
  gender: null,
  birthday: null,
  activityLevel: null,
  height: null,
  weight: null,
  primaryGoal: null,
  targetWeight: null,
  weeklyPace: null,
  dietaryPreferences: [],
  dietStyle: null,
  macros: {
    protein: 0,
    carbs: 0,
    fat: 0,
  },
  useAutoMacros: false,
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<OnboardingData>(defaultOnboardingData);

  const setName = (name: string) => {
    setData(prev => ({
      ...prev,
      name,
    }));
  };

  const setGender = (gender: 'male' | 'female' | 'prefer_not_to_say') => {
    setData(prev => ({
      ...prev,
      gender,
    }));
  };

  const setBirthday = (date: Date) => {
    setData(prev => ({
      ...prev,
      birthday: date,
    }));
  };

  const setActivityLevel = (level: number) => {
    setData(prev => ({ ...prev, activityLevel: level }));
  };

  const setHeight = (height: number) => {
    setData(prev => ({ ...prev, height }));
  };

  const setWeight = (weight: number) => {
    setData(prev => ({
      ...prev,
      weight,
    }));
  };

  const setGoals = (goal: Goal, targetWeight: number | null, pace: number) => {
    setData(prev => ({
      ...prev,
      primaryGoal: goal,
      targetWeight,
      weeklyPace: pace,
    }));
  };

  const setDietaryPreferences = (preferences: DietaryPreference[], style: DietStyle) => {
    setData(prev => ({
      ...prev,
      dietaryPreferences: preferences,
      dietStyle: style,
    }));
  };

  const setMacros = (protein: number, carbs: number, fat: number, useAuto: boolean) => {
    setData(prev => ({
      ...prev,
      macros: { protein, carbs, fat },
      useAutoMacros: useAuto,
    }));
  };

  const calculateMacros = (
    weight: number,
    height: number,
    age: number,
    gender: string,
    activityLevel: number
  ) => {
    // Calculate BMR using Mifflin-St Jeor formula
    const bmr = gender === 'male'
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161;

    // Calculate TDEE with activity multiplier
    const activityMultipliers = {
      1: 1.2,  // Sedentary
      2: 1.375,  // Lightly active
      3: 1.55,  // Moderately active
      4: 1.725,  // Very active
      5: 1.9,  // Super active
    };
    const tdee = bmr * activityMultipliers[activityLevel as keyof typeof activityMultipliers];

    // Calculate macros based on goal
    let protein = 0, carbs = 0, fat = 0;
    const primaryGoal = data.primaryGoal?.toLowerCase().replace(' ', '_');

    switch (primaryGoal) {
      case 'lose_weight':
        protein = weight * 2.2; // 2.2g per kg of body weight
        fat = weight * 0.8; // 0.8g per kg of body weight
        carbs = (tdee - (protein * 4 + fat * 9)) / 4; // Remaining calories from carbs
        break;
      case 'gain_muscle':
        protein = weight * 2.4;
        fat = weight * 1;
        carbs = (tdee - (protein * 4 + fat * 9)) / 4;
        break;
      case 'maintain':
        protein = weight * 2;
        fat = weight * 0.9;
        carbs = (tdee - (protein * 4 + fat * 9)) / 4;
        break;
      default:
        protein = weight * 2;
        fat = weight * 0.9;
        carbs = (tdee - (protein * 4 + fat * 9)) / 4;
    }

    // Ensure non-negative values and round to nearest whole number
    protein = Math.max(0, Math.round(protein));
    carbs = Math.max(0, Math.round(carbs));
    fat = Math.max(0, Math.round(fat));

    // Update state with calculated macros
    setData(prev => ({
      ...prev,
      macros: {
        protein,
        carbs,
        fat,
      },
      useAutoMacros: true,
    }));
  };

  const saveOnboardingData = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('No user found');
      if (!user.email) throw new Error('No email found for user');

      // First ensure user profile exists
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          email: user.email,
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'id'
        });

      if (profileError) throw profileError;

      // Then save onboarding data
      const { error: onboardingError } = await supabase
        .from('user_onboarding')
        .upsert({
          user_id: user.id,
          name: data.name,
          gender: data.gender,
          birthday: data.birthday?.toISOString(),
          activity_level: data.activityLevel,
          height_cm: data.height,
          weight_kg: data.weight,
          primary_goal: data.primaryGoal?.toLowerCase().replace(' ', '_'),
          target_weight_kg: data.targetWeight,
          weekly_pace: data.weeklyPace,
          protein_ratio: data.macros.protein,
          carbs_ratio: data.macros.carbs,
          fat_ratio: data.macros.fat,
          use_auto_macros: data.useAutoMacros,
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });

      if (onboardingError) throw onboardingError;

    } catch (error: any) {
      console.error('Error saving onboarding data:', error.message);
      throw error;
    }
  };

  return (
    <OnboardingContext.Provider
      value={{
        data,
        setName,
        setGender,
        setBirthday,
        setActivityLevel,
        setHeight,
        setWeight,
        setGoals,
        setDietaryPreferences,
        setMacros,
        calculateMacros,
        saveOnboardingData,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
} 