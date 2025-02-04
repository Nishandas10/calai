import React from 'react';
import { Stack } from 'expo-router';
import { OnboardingProvider } from '@/context/onboarding';

export default function OnboardingLayout() {
  return (
    <OnboardingProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="bmi-calculator" />
        <Stack.Screen name="goals" />
        <Stack.Screen name="dietary-preferences" />
        <Stack.Screen name="macro-goals" />
        <Stack.Screen name="user-goals" />
      </Stack>
    </OnboardingProvider>
  );
} 
