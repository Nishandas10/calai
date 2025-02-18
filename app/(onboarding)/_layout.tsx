import React from 'react';
import { Stack } from 'expo-router';
import { OnboardingProvider } from '@/context/onboarding';

export default function OnboardingLayout() {
  return (
    <OnboardingProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="name" />
        <Stack.Screen name="gender" />
        <Stack.Screen name="activity" />
        <Stack.Screen name="comparison" />
        <Stack.Screen name="height" />
        <Stack.Screen name="weight" />
        <Stack.Screen name="birthday" />
        <Stack.Screen name="goals" />
        <Stack.Screen name="target-weight" />
        <Stack.Screen name="weekly-pace" />
        <Stack.Screen name="weekly-pace-info" />
        <Stack.Screen name="benefits" />
        <Stack.Screen name="macro-goals" />
        <Stack.Screen name="loader" />
        <Stack.Screen name="completed" />
      </Stack>
    </OnboardingProvider>
  );
} 
