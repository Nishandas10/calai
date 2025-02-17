import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useOnboarding } from '@/context/onboarding';
import { OnboardingHeader } from '@/components/onboarding/OnboardingHeader';
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';
import { OnboardingButton } from '@/components/onboarding/OnboardingButton';
import { Ionicons } from '@expo/vector-icons';

const GOALS = [
  {
    id: 'lose_weight',
    title: 'Lose Weight',
    icon: '🔥',
  },
  {
    id: 'gain_muscle',
    title: 'Gain Muscle',
    icon: '💪',
  },
  {
    id: 'maintain',
    title: 'Maintain Weight',
    icon: '⚖️',
  },
  {
    id: 'boost_energy',
    title: 'Boost Energy',
    icon: '⚡',
  },
  {
    id: 'improve_nutrition',
    title: 'Improve Nutrition',
    icon: '🥗',
  },
  {
    id: 'gain_weight',
    title: 'Gain Weight',
    icon: '🎯',
  },
] as const;

type GoalType = typeof GOALS[number]['id'];

export default function GoalsScreen() {
  const { setGoals } = useOnboarding();
  const [selectedGoals, setSelectedGoals] = useState<GoalType[]>([]);

  const toggleGoal = (goalId: GoalType) => {
    setSelectedGoals(prev => {
      if (prev.includes(goalId)) {
        return prev.filter(id => id !== goalId);
      }
      return [...prev, goalId];
    });
  };

  const handleNext = () => {
    if (selectedGoals.length > 0) {
      const primaryGoal = selectedGoals[0];
      setGoals(primaryGoal as any, null, 0);
      router.push('/(onboarding)/macro-goals');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <OnboardingHeader 
          title="What's your main goal with CalAI?" 
          showBackButton
        />
        <OnboardingProgress step={4} totalSteps={8} />
      </View>

      <View style={styles.contentWrapper}>
        <View style={styles.content}>
          {GOALS.map((goal) => (
            <TouchableOpacity
              key={goal.id}
              style={[
                styles.goalOption,
                selectedGoals.includes(goal.id) && styles.selectedOption
              ]}
              onPress={() => toggleGoal(goal.id)}
            >
              <View style={styles.goalContent}>
                <Text style={styles.goalIcon}>{goal.icon}</Text>
                <Text style={[
                  styles.goalText,
                  selectedGoals.includes(goal.id) && styles.selectedText
                ]}>
                  {goal.title}
                </Text>
              </View>
              {selectedGoals.includes(goal.id) && (
                <Ionicons name="checkmark" size={24} color="#fff" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <OnboardingButton 
          label="Continue"
          onPress={handleNext}
          disabled={selectedGoals.length === 0}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 40,
  },
  content: {
    paddingHorizontal: 20,
    gap: 12,
  },
  goalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedOption: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  goalContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  goalIcon: {
    fontSize: 24,
  },
  goalText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  selectedText: {
    color: '#fff',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
}); 