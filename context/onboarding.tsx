import React, { createContext, useContext, useState } from 'react';
import { supabase } from '@/lib/supabase';

type DietaryPreference = 'Vegetarian' | 'Vegan' | 'Gluten-free' | 'Dairy-free';
type DietStyle = 'Keto' | 'Low-carb' | 'Mediterranean' | 'None';
type Goal = 'Lose weight' | 'Maintain' | 'Gain muscle' | 'Healthy lifestyle';

interface OnboardingData {
  // User Info
  name: string | null;
  gender: 'male' | 'female' | 'prefer_not_to_say' | null;
  activityLevel: number | null;
  
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
  setActivityLevel: (level: number) => void;
  setGoals: (goal: Goal, targetWeight: number | null, pace: number) => void;
  setDietaryPreferences: (preferences: DietaryPreference[], style: DietStyle) => void;
  setMacros: (protein: number, carbs: number, fat: number, useAuto: boolean) => void;
  calculateMacros: (weight: number, height: number, age: number, gender: string, activityLevel: number) => void;
  saveOnboardingData: () => Promise<void>;
}

const defaultOnboardingData: OnboardingData = {
  name: null,
  gender: null,
  activityLevel: null,
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

  const setActivityLevel = (level: number) => {
    setData(prev => ({ ...prev, activityLevel: level }));
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

    // Calculate TDEE
    const tdee = bmr * activityLevel;

    // Calculate macros based on goal
    let protein = 0, carbs = 0, fat = 0;

    switch (data.primaryGoal) {
      case 'Lose weight':
        protein = weight * 2.2; // 2.2g per kg of body weight
        fat = weight * 0.8; // 0.8g per kg of body weight
        carbs = (tdee - (protein * 4 + fat * 9)) / 4; // Remaining calories from carbs
        break;
      case 'Gain muscle':
        protein = weight * 2.4;
        fat = weight * 1;
        carbs = (tdee - (protein * 4 + fat * 9)) / 4;
        break;
      default:
        protein = weight * 2;
        fat = weight * 0.9;
        carbs = (tdee - (protein * 4 + fat * 9)) / 4;
    }

    setMacros(Math.round(protein), Math.round(carbs), Math.round(fat), true);
  };

  const saveOnboardingData = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      if (!user) throw new Error('No user found');

      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          ...data,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
    } catch (error: any) {
      console.error('Error saving onboarding data:', error);
      throw error;
    }
  };

  return (
    <OnboardingContext.Provider
      value={{
        data,
        setName,
        setGender,
        setActivityLevel,
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