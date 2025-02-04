import { useState } from "react";
import { useRouter } from "expo-router";
import {
  saveOnboardingData,
  HealthMetrics,
  UserGoals,
  DietaryPreferences,
  MacroGoals,
} from "../lib/api/onboarding";

export const useOnboarding = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOnboardingSubmit = async (
    healthMetrics: HealthMetrics,
    goals: UserGoals,
    dietaryPreferences: DietaryPreferences,
    macroGoals: MacroGoals
  ) => {
    try {
      setIsLoading(true);
      setError(null);

      await saveOnboardingData(
        healthMetrics,
        goals,
        dietaryPreferences,
        macroGoals
      );

      // Navigate to the main app after successful onboarding
      // router.replace("+not-found");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred during onboarding"
      );
      console.error("Onboarding error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleOnboardingSubmit,
    isLoading,
    error,
  };
};
