import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Switch } from 'react-native';
import { router } from 'expo-router';
import { useOnboarding } from '@/context/onboarding';

const ACTIVITY_LEVELS = [
  { label: 'Sedentary (office job)', value: 1.2 },
  { label: 'Light Exercise (1-2 days/week)', value: 1.375 },
  { label: 'Moderate Exercise (3-5 days/week)', value: 1.55 },
  { label: 'Heavy Exercise (6-7 days/week)', value: 1.725 },
  { label: 'Athlete (2x per day)', value: 1.9 },
];

export default function MacroGoalsScreen() {
  const { data, setMacros, calculateMacros } = useOnboarding();
  const [useAutoCalculation, setUseAutoCalculation] = useState(data.useAutoMacros);
  const [protein, setProtein] = useState(data.macros.protein.toString());
  const [carbs, setCarbs] = useState(data.macros.carbs.toString());
  const [fat, setFat] = useState(data.macros.fat.toString());
  const [activityLevel, setActivityLevel] = useState(1.55); // Default to moderate

  const handleAutoCalculate = () => {
    // Using data from personal details
    calculateMacros(70, 170, 30, 'male', activityLevel); // Example values
  };

  const handleNext = () => {
    setMacros(
      parseInt(protein) || 0,
      parseInt(carbs) || 0,
      parseInt(fat) || 0,
      useAutoCalculation
    );
    router.push('/(tabs)');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Macro Goals</Text>

        <View style={styles.autoContainer}>
          <Text style={styles.label}>Auto-calculate macros</Text>
          <Switch
            value={useAutoCalculation}
            onValueChange={(value) => {
              setUseAutoCalculation(value);
              if (value) handleAutoCalculate();
            }}
          />
        </View>

        {useAutoCalculation ? (
          <View style={styles.activityContainer}>
            <Text style={styles.label}>Activity Level</Text>
            {ACTIVITY_LEVELS.map((level) => (
              <TouchableOpacity
                key={level.value}
                style={[
                  styles.activityButton,
                  activityLevel === level.value && styles.activityButtonSelected,
                ]}
                onPress={() => {
                  setActivityLevel(level.value);
                  handleAutoCalculate();
                }}
              >
                <Text
                  style={[
                    styles.activityButtonText,
                    activityLevel === level.value && styles.activityButtonTextSelected,
                  ]}
                >
                  {level.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.macrosContainer}>
            <View style={styles.macroInput}>
              <Text style={styles.label}>Protein (g)</Text>
              <TextInput
                style={styles.input}
                value={protein}
                onChangeText={setProtein}
                keyboardType="numeric"
                placeholder="Enter protein"
              />
            </View>

            <View style={styles.macroInput}>
              <Text style={styles.label}>Carbs (g)</Text>
              <TextInput
                style={styles.input}
                value={carbs}
                onChangeText={setCarbs}
                keyboardType="numeric"
                placeholder="Enter carbs"
              />
            </View>

            <View style={styles.macroInput}>
              <Text style={styles.label}>Fat (g)</Text>
              <TextInput
                style={styles.input}
                value={fat}
                onChangeText={setFat}
                keyboardType="numeric"
                placeholder="Enter fat"
              />
            </View>
          </View>
        )}

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Finish</Text>
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
  autoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  activityContainer: {
    gap: 10,
    marginBottom: 30,
  },
  activityButton: {
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  activityButtonSelected: {
    backgroundColor: '#2f95dc',
    borderColor: '#2f95dc',
  },
  activityButtonText: {
    fontSize: 16,
    color: '#333',
  },
  activityButtonTextSelected: {
    color: '#fff',
  },
  macrosContainer: {
    gap: 20,
    marginBottom: 30,
  },
  macroInput: {
    gap: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 8,
    fontSize: 16,
  },
  nextButton: {
    backgroundColor: '#2f95dc',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 