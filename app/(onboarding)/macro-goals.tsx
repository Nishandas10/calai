import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Switch, Alert } from 'react-native';
import { router } from 'expo-router';
import { useOnboarding } from '@/context/onboarding';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth';
import { UserModel } from '@/lib/models/user';

const ACTIVITY_LEVELS = [
  { label: 'Sedentary (office job)', value: 1.2 },
  { label: 'Light Exercise (1-2 days/week)', value: 1.375 },
  { label: 'Moderate Exercise (3-5 days/week)', value: 1.55 },
  { label: 'Heavy Exercise (6-7 days/week)', value: 1.725 },
  { label: 'Athlete (2x per day)', value: 1.9 },
];

export default function MacroGoalsScreen() {
  const { data, setMacros, calculateMacros } = useOnboarding();
  const { session } = useAuth();
  const [useAutoCalculation, setUseAutoCalculation] = useState(data.useAutoMacros);
  const [protein, setProtein] = useState(data.macros.protein.toString());
  const [carbs, setCarbs] = useState(data.macros.carbs.toString());
  const [fat, setFat] = useState(data.macros.fat.toString());
  const [activityLevel, setActivityLevel] = useState(1.55); // Default to moderate
  const [isSaving, setIsSaving] = useState(false);

  const handleAutoCalculate = () => {
    // Using data from personal details
    calculateMacros(70, 170, 30, 'male', activityLevel); // Example values
  };

  const handleNext = async () => {
    if (!useAutoCalculation && (!protein || !carbs || !fat)) {
      Alert.alert('Error', 'Please enter all macro values');
      return;
    }

    setIsSaving(true);
    try {
      await UserModel.createMacroGoals({
        user_id: session?.user.id,
        protein: useAutoCalculation ? 30 : parseFloat(protein),
        carbs: useAutoCalculation ? 40 : parseFloat(carbs),
        fat: useAutoCalculation ? 30 : parseFloat(fat),
        use_auto_macros: useAutoCalculation,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      router.push('/user-goals');
    } catch (error: any) {
      console.error('Error saving macro goals:', error);
      Alert.alert('Error', error.message || 'Failed to save macro goals');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Macro Goals</Text>
        <Text style={styles.subtitle}>Set your daily macro nutrient targets</Text>

        <View style={styles.inputContainer}>
          <View style={styles.switchRow}>
            <Text style={styles.label}>Use Auto Macros</Text>
            <Switch
              value={useAutoCalculation}
              onValueChange={(value) => {
                setUseAutoCalculation(value);
                if (value) handleAutoCalculate();
              }}
              disabled={isSaving}
            />
          </View>

          {!useAutoCalculation && (
            <>
              <Text style={styles.label}>Protein (%)</Text>
              <TextInput
                style={styles.input}
                value={protein}
                onChangeText={setProtein}
                keyboardType="numeric"
                placeholder="Enter protein percentage"
                editable={!isSaving}
              />

              <Text style={styles.label}>Carbs (%)</Text>
              <TextInput
                style={styles.input}
                value={carbs}
                onChangeText={setCarbs}
                keyboardType="numeric"
                placeholder="Enter carbs percentage"
                editable={!isSaving}
              />

              <Text style={styles.label}>Fat (%)</Text>
              <TextInput
                style={styles.input}
                value={fat}
                onChangeText={setFat}
                keyboardType="numeric"
                placeholder="Enter fat percentage"
                editable={!isSaving}
              />
            </>
          )}

          {useAutoCalculation && (
            <View style={styles.autoMacrosInfo}>
              <Text style={styles.infoText}>Default Macro Split:</Text>
              <Text style={styles.macroText}>Protein: 30%</Text>
              <Text style={styles.macroText}>Carbs: 40%</Text>
              <Text style={styles.macroText}>Fat: 30%</Text>
            </View>
          )}
        </View>

        <Button 
          onPress={handleNext}
          disabled={isSaving || (!useAutoCalculation && (!protein || !carbs || !fat))}
          style={styles.button}
        >
          {isSaving ? 'Saving...' : 'Next'}
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
  inputContainer: {
    width: '100%',
    marginBottom: 30,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  autoMacrosInfo: {
    backgroundColor: '#f5f5f5',
    padding: 20,
    borderRadius: 8,
    marginTop: 10,
  },
  infoText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  macroText: {
    fontSize: 16,
    marginBottom: 5,
  },
  button: {
    width: '100%',
  },
}); 