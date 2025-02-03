import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, TextInput } from 'react-native-paper';
import { useOnboarding } from '../../hooks/useOnboarding';
import { HealthMetrics, UserGoals, DietaryPreferences, MacroGoals } from '../../lib/api/onboarding';

export default function GoalsScreen() {
  const { handleOnboardingSubmit, isLoading, error } = useOnboarding();

  // Health Metrics Form
  const [healthMetrics, setHealthMetrics] = useState<HealthMetrics>({
    weight: 0,
    height: 0,
    age: 0,
    gender: '',
    activity_level: ''
  });

  // Goals Form
  const [goals, setGoals] = useState<UserGoals>({
    primary_goal: '',
    target_weight: undefined,
    weekly_pace: 0.5
  });

  // Dietary Preferences Form
  const [dietaryPreferences, setDietaryPreferences] = useState<DietaryPreferences>({
    is_vegetarian: false,
    is_vegan: false,
    is_gluten_free: false,
    is_dairy_free: false,
    diet_style: 'None',
    excluded_ingredients: []
  });

  // Auto-calculated Macro Goals
  const [macroGoals, setMacroGoals] = useState<MacroGoals>({
    protein: 0,
    carbs: 0,
    fat: 0,
    use_auto_macros: true
  });

  const handleSubmit = async () => {
    // Calculate macros based on health metrics and goals
    const calculatedMacros = calculateMacros(healthMetrics, goals);
    setMacroGoals(prev => ({
      ...prev,
      ...calculatedMacros
    }));

    await handleOnboardingSubmit(
      healthMetrics,
      goals,
      dietaryPreferences,
      {
        ...macroGoals,
        ...calculatedMacros
      }
    );
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Let's Get Started
      </Text>

      {error && (
        <Text style={styles.error}>{error}</Text>
      )}

      {/* Health Metrics Section */}
      <View style={styles.section}>
        <Text variant="titleMedium">Your Health Metrics</Text>
        <TextInput
          label="Weight (kg)"
          keyboardType="numeric"
          value={String(healthMetrics.weight || '')}
          onChangeText={(value: string) => setHealthMetrics(prev => ({
            ...prev,
            weight: Number(value)
          }))}
          style={styles.input}
        />
        <TextInput
          label="Height (cm)"
          keyboardType="numeric"
          value={String(healthMetrics.height || '')}
          onChangeText={(value: string) => setHealthMetrics(prev => ({
            ...prev,
            height: Number(value)
          }))}
          style={styles.input}
        />
        <TextInput
          label="Age"
          keyboardType="numeric"
          value={String(healthMetrics.age || '')}
          onChangeText={(value: string) => setHealthMetrics(prev => ({
            ...prev,
            age: Number(value)
          }))}
          style={styles.input}
        />
      </View>

      {/* Goals Section */}
      <View style={styles.section}>
        <Text variant="titleMedium">Your Goals</Text>
        <TextInput
          label="Target Weight (kg)"
          keyboardType="numeric"
          value={String(goals.target_weight || '')}
          onChangeText={(value: string) => setGoals(prev => ({
            ...prev,
            target_weight: Number(value)
          }))}
          style={styles.input}
        />
      </View>

      <Button
        mode="contained"
        onPress={handleSubmit}
        loading={isLoading}
        disabled={isLoading}
        style={styles.button}
      >
        Complete Setup
      </Button>
    </View>
  );
}

// Helper function to calculate macros based on user data
const calculateMacros = (healthMetrics: HealthMetrics, goals: UserGoals): Partial<MacroGoals> => {
  // This is a simple example - you should implement proper macro calculations
  const baseProtein = healthMetrics.weight * 2; // 2g per kg of body weight
  const baseFat = healthMetrics.weight * 1; // 1g per kg of body weight
  const baseCarbs = healthMetrics.weight * 3; // 3g per kg of body weight

  return {
    protein: Math.round(baseProtein),
    fat: Math.round(baseFat),
    carbs: Math.round(baseCarbs)
  };
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff'
  },
  title: {
    marginBottom: 24,
    textAlign: 'center'
  },
  section: {
    marginBottom: 24
  },
  input: {
    marginBottom: 12
  },
  button: {
    marginTop: 24
  },
  error: {
    color: 'red',
    marginBottom: 16,
    textAlign: 'center'
  }
}); 