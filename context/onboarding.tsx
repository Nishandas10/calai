import React, { createContext, useContext, useState } from 'react';
import { supabase } from '@/lib/supabase';

type DietaryPreference = 'Vegetarian' | 'Vegan' | 'Gluten-free' | 'Dairy-free';
type DietStyle = 'Keto' | 'Low-carb' | 'Mediterranean' | 'None';
type Goal = 'Lose weight' | 'Maintain' | 'Gain muscle' | 'Boost Energy' | 'Improve Nutrition' | 'Gain Weight';

interface OnboardingData {
  // User Info
  name: string | null;
  gender: 'male' | 'female' | 'prefer_not_to_say' | null;
  birthday: Date | null;
  activityLevel: number | null;
  height: number | null;
  weight: number | null;
  unit: 'metric' | 'imperial';
  
  // Goals
  usersGoal: Goal | null;
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
  setUnit: (unit: 'metric' | 'imperial') => void;
}

const defaultOnboardingData: OnboardingData = {
  name: null,
  gender: null,
  birthday: null,
  activityLevel: null,
  height: null,
  weight: null,
  unit: 'metric',
  usersGoal: null,
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

// Unit conversion functions
const convertToMetric = {
  height: (ft: number) => ft * 30.48, // ft to cm
  weight: (lb: number) => lb * 0.453592, // lb to kg
};

const convertToImperial = {
  height: (cm: number) => cm / 30.48, // cm to ft
  weight: (kg: number) => kg / 0.453592, // kg to lb
};

// Database goal mapping
const goalToDbValue = (goal: Goal | null): string | null => {
  if (!goal) {
    console.log('No goal provided to goalToDbValue');
    return null;
  }
  
  console.log('Converting goal to DB value:', goal);
  
  // Direct mapping without switch
  const goalMapping = {
    'Lose weight': 'lose_weight',
    'Gain muscle': 'gain_muscle',
    'Maintain': 'maintain',
    'Boost Energy': 'boost_energy',
    'Improve Nutrition': 'improve_nutrition',
    'Gain Weight': 'gain_weight'
  } as const;

  const dbValue = goalMapping[goal];
  console.log('Mapped DB value:', dbValue);
  
  if (!dbValue) {
    console.error('Invalid goal value:', goal);
    return 'maintain';
  }
  
  return dbValue;
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
    console.log('setGoals called with:', {
      goal,
      targetWeight,
      pace,
      goalType: typeof goal,
      validGoal: ['Lose weight', 'Maintain', 'Gain muscle', 'Boost Energy', 'Improve Nutrition', 'Gain Weight'].includes(goal)
    });

    // Validate the goal value
    if (!goal) {
      console.error('Goal is null or undefined');
      return;
    }

    // Log the exact goal string
    console.log('Goal string:', JSON.stringify(goal));
    
    setData(prev => {
      const newData = {
        ...prev,
        usersGoal: goal,
        targetWeight: targetWeight,
        weeklyPace: pace,
      };
      console.log('State after update:', {
        previousGoal: prev.usersGoal,
        newGoal: newData.usersGoal
      });
      return newData;
    });
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
    const userGoal = data.usersGoal;

    switch (userGoal) {
      case 'Lose weight':
        protein = weight * 2.2; // Higher protein for muscle preservation
        fat = weight * 0.8;     // Moderate fat
        carbs = (tdee * 0.8 - (protein * 4 + fat * 9)) / 4; // 20% deficit
        break;

      case 'Gain muscle':
        protein = weight * 2.4; // High protein for muscle growth
        fat = weight * 1.0;     // Moderate to high fat
        carbs = (tdee * 1.1 - (protein * 4 + fat * 9)) / 4; // 10% surplus
        break;

      case 'Maintain':
        protein = weight * 1.8;  // Moderate-high protein (1.8g per kg bodyweight)
        fat = weight * 0.8;      // Balanced fat intake
        carbs = (tdee * 1.0 - (protein * 4 + fat * 9)) / 4; // Remaining calories from carbs (~45-50%)
        break;

      case 'Boost Energy':
        protein = weight * 1.8;  // Moderate protein (1.6g per kg bodyweight)
        fat = weight * 0.7;      // Lower end of healthy fat range
        carbs = (tdee * 1.1 - (protein * 4 + fat * 9)) / 4; // Higher carbs (~55-60% of calories)
        break;

      case 'Improve Nutrition':
        protein = weight * 2.0;
        fat = weight * 0.85;
        carbs = (tdee - (protein * 4 + fat * 9)) / 4;
        break;

      case 'Gain Weight':
        protein = weight * 2.0; // Moderate protein
        fat = weight * 1.1;     // Higher fat
        carbs = (tdee * 1.15 - (protein * 4 + fat * 9)) / 4; // 15% surplus
        break;

      default:
        protein = weight * 2.0;
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

  const setUnit = (unit: 'metric' | 'imperial') => {
    setData(prev => ({
      ...prev,
      unit,
    }));
  };

  const saveOnboardingData = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user?.id || !user?.email) throw new Error('Invalid user data');

      console.log('Current state before save:', data);
      console.log('Current goal before conversion:', data.usersGoal);
      
      const dbGoalValue = goalToDbValue(data.usersGoal);
      console.log('Converted goal value:', dbGoalValue);

      // Prepare the data to be saved
      const onboardingData = {
        user_id: user.id,
        name: data.name,
        gender: data.gender,
        birthday: data.birthday?.toISOString(),
        activity_level: data.activityLevel,
        height_cm: data.unit === 'metric' ? data.height : convertToMetric.height(data.height!),
        weight_kg: data.unit === 'metric' ? data.weight : convertToMetric.weight(data.weight!),
        users_goal: dbGoalValue,
        target_weight_kg: data.unit === 'metric' ? data.targetWeight : convertToMetric.weight(data.targetWeight!),
        weekly_pace: data.weeklyPace,
        protein_ratio: data.macros.protein,
        carbs_ratio: data.macros.carbs,
        fat_ratio: data.macros.fat,
        use_auto_macros: data.useAutoMacros,
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      };

      console.log('Final data being saved:', onboardingData);

      const { error: onboardingError } = await supabase
        .from('user_onboarding')
        .upsert(onboardingData, {
          onConflict: 'user_id'
        });

      if (onboardingError) {
        console.error('Onboarding error:', onboardingError);
        throw onboardingError;
      }

      console.log('Save successful');

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
        setBirthday,
        setActivityLevel,
        setHeight,
        setWeight,
        setGoals,
        setDietaryPreferences,
        setMacros,
        calculateMacros,
        saveOnboardingData,
        setUnit,
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