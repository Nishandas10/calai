import React, { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { OnboardingProvider, useOnboarding } from '@/context/onboarding';
import { supabase } from '@/lib/supabase';

function OnboardingLayoutInner() {
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('user_onboarding')
          .select('onboarding_completed')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;

        // If onboarding is completed, show the completed screen
        if (data?.onboarding_completed) {
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
