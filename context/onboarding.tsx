import React, { createContext, useContext, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Goal = string;

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
  
  // Return the goal string directly since we're now storing the full formatted string
  return goal;
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
    });

    // Validate the goal value
    if (!goal) {
      console.error('Goal is null or undefined');
      return;
    }

    // Parse and validate the goal string format
    const goalsArray = goal.split(' , ').map(g => g.trim());
    console.log('Parsed goals:', goalsArray);

    if (goalsArray.length === 0) {
      console.error('No valid goals found in the string');
      return;
    }

    // Log the exact goal string for debugging
    console.log('Goal string:', JSON.stringify(goal));
    
    setData(prev => {
      const newData = {
        ...prev,
        usersGoal: goal, // Store the full formatted string with scores
        targetWeight: targetWeight,
        weeklyPace: pace,
      };
      console.log('State after update:', {
        previousGoal: prev.usersGoal,
        newGoal: newData.usersGoal,
        goalsCount: goalsArray.length,
      });
      return newData;
    });
  };

  const setMacros = (protein: number, carbs: number, fat: number, useAuto: boolean) => {
    setData(prev => ({
      ...prev,
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

    // Update state with auto macros flag
    setData(prev => ({
      ...prev,
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