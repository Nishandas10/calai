import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth';
import { supabase } from '@/lib/supabase';
import { TextInput } from 'react-native';

const GOAL_OPTIONS = [
  { label: 'Weight Loss', value: 'weight_loss' },
  { label: 'Weight Gain', value: 'weight_gain' },
  { label: 'Maintain Weight', value: 'maintain' },
  { label: 'Build Muscle', value: 'build_muscle' },
  { label: 'Improve Health', value: 'improve_health' },
];

export default function UserGoalsScreen() {
  const { session } = useAuth();
  const [selectedGoal, setSelectedGoal] = useState('');
  const [targetWeight, setTargetWeight] = useState('');
  const [weeklyPace, setWeeklyPace] = useState('0.5');
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveGoals = async () => {
    if (!selectedGoal) {
      Alert.alert('Error', 'Please select a primary goal');
      return;
    }

    if (!targetWeight) {
      Alert.alert('Error', 'Please enter your target weight');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('user_goals')
        .insert({
          user_id: session?.user.id,
          primary_goal: selectedGoal,
          target_weight: parseFloat(targetWeight),
          weekly_pace: parseFloat(weeklyPace),
        });

      if (error) throw error;

      // Update onboarding completion status
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({ onboarding_completed: true })
        .eq('id', session?.user.id);

      if (profileError) throw profileError;

      // Navigate to main app
      router.replace('/+not-found');
    } catch (error: any) {
      console.error('Error saving goals:', error);
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Set Your Goals</Text>
        <Text style={styles.subtitle}>Let's define your fitness journey</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Primary Goal</Text>
          <View style={styles.goalOptions}>
            {GOAL_OPTIONS.map((goal) => (
              <Button
                key={goal.value}
                onPress={() => setSelectedGoal(goal.value)}
                style={[
                  styles.goalButton,
                  selectedGoal === goal.value && styles.selectedGoal,
                ]}
              >
                <Text
                  style={[
                    styles.goalButtonText,
                    selectedGoal === goal.value && styles.selectedGoalText,
                  ]}
                >
                  {goal.label}
                </Text>
              </Button>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Target Weight (kg)</Text>
          <TextInput
            style={styles.input}
            value={targetWeight}
            onChangeText={setTargetWeight}
            keyboardType="numeric"
            placeholder="Enter target weight"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weekly Pace (kg/week)</Text>
          <TextInput
            style={styles.input}
            value={weeklyPace}
            onChangeText={setWeeklyPace}
            keyboardType="numeric"
            placeholder="Enter weekly pace"
          />
          <Text style={styles.hint}>
            Recommended: 0.5-1.0 kg per week for healthy progress
          </Text>
        </View>

        <Button
          onPress={handleSaveGoals}
          style={styles.button}
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Complete Setup'}
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  goalOptions: {
    gap: 10,
  },
  goalButton: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectedGoal: {
    backgroundColor: '#2f95dc',
  },
  goalButtonText: {
    fontSize: 16,
    color: '#333',
  },
  selectedGoalText: {
    color: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
  },
  hint: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  button: {
    marginTop: 20,
  },
}); 