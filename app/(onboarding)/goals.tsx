import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useOnboarding } from '@/context/onboarding';
import Slider from '@react-native-community/slider';

const GOALS = ['Lose weight', 'Maintain', 'Gain muscle', 'Healthy lifestyle'] as const;

export default function GoalsScreen() {
  const { data, setGoals } = useOnboarding();
  const [selectedGoal, setSelectedGoal] = useState<typeof GOALS[number] | null>(data.primaryGoal);
  const [targetWeight, setTargetWeight] = useState(data.targetWeight?.toString() || '');
  const [weeklyPace, setWeeklyPace] = useState(data.weeklyPace || 0.5);

  const handleNext = () => {
    if (!selectedGoal) return;

    setGoals(
      selectedGoal,
      targetWeight ? parseFloat(targetWeight) : null,
      weeklyPace
    );
    router.push('/(onboarding)/dietary-preferences');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>What's your goal?</Text>
        
        <View style={styles.goalsContainer}>
          {GOALS.map((goal) => (
            <TouchableOpacity
              key={goal}
              style={[
                styles.goalButton,
                selectedGoal === goal && styles.goalButtonSelected,
              ]}
              onPress={() => setSelectedGoal(goal)}
            >
              <Text
                style={[
                  styles.goalButtonText,
                  selectedGoal === goal && styles.goalButtonTextSelected,
                ]}
              >
                {goal}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {selectedGoal === 'Lose weight' || selectedGoal === 'Gain muscle' ? (
          <>
            <Text style={styles.label}>Target Weight (kg)</Text>
            <TextInput
              style={styles.input}
              value={targetWeight}
              onChangeText={setTargetWeight}
              keyboardType="numeric"
              placeholder="Enter target weight"
            />

            <Text style={styles.label}>
              Weekly Pace: {weeklyPace.toFixed(2)} kg/week
            </Text>
            <Slider
              style={styles.slider}
              minimumValue={0.25}
              maximumValue={2}
              step={0.25}
              value={weeklyPace}
              onValueChange={setWeeklyPace}
              minimumTrackTintColor="#2f95dc"
              maximumTrackTintColor="#ddd"
            />
          </>
        ) : null}

        <TouchableOpacity
          style={[styles.nextButton, !selectedGoal && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={!selectedGoal}
        >
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
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
    marginBottom: 30,
    textAlign: 'center',
  },
  goalsContainer: {
    gap: 10,
    marginBottom: 30,
  },
  goalButton: {
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  goalButtonSelected: {
    backgroundColor: '#2f95dc',
    borderColor: '#2f95dc',
  },
  goalButtonText: {
    fontSize: 16,
    color: '#333',
  },
  goalButtonTextSelected: {
    color: '#fff',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 20,
  },
  slider: {
    height: 40,
    marginBottom: 30,
  },
  nextButton: {
    backgroundColor: '#2f95dc',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    opacity: 0.7,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 