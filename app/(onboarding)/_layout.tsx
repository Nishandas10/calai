import React, { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { OnboardingProvider, useOnboarding } from '@/context/onboarding';
import { auth, firestore } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

function OnboardingLayoutInner() {
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const onboardingDoc = await getDoc(doc(firestore, 'user_onboarding', user.uid));
        const onboardingData = onboardingDoc.data();

        // If onboarding is completed, show the completed screen
        if (onboardingData?.onboarding_completed) {
          router.replace('/(onboarding)/completed');
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
      }
    };

    checkOnboardingStatus();
  }, []);

  return (
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
  );
}

export default function OnboardingLayout() {
  return (
    <OnboardingProvider>
      <OnboardingLayoutInner />
    </OnboardingProvider>
  );
} 
