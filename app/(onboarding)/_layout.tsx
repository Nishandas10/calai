import React from 'react';
import { Stack } from 'expo-router';
import { OnboardingProvider } from '@/context/onboarding';

export default function OnboardingLayout() {
  return (
    <OnboardingProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="name" options={{ headerShown: false }} />
        <Stack.Screen name="gender" options={{ headerShown: false }} />
        <Stack.Screen name="activity" options={{ headerShown: false }} />
        <Stack.Screen name="macro-goals" />
        <Stack.Screen name="goals" options={{ headerShown: false }} />
        <Stack.Screen name="dietary-preferences" />
        <Stack.Screen name="bmi-calculator" />
        <Stack.Screen name="user-goals" />
      </Stack>
    </OnboardingProvider>
  );
} 
