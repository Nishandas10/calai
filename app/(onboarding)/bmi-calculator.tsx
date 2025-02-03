import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { useOnboarding } from '@/context/onboarding';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth';
import { UserModel } from '@/lib/models/user';
import { Picker } from '@react-native-picker/picker';

interface BMIRecommendation {
  category: string;
  dietaryAdvice: string[];
  exerciseAdvice: string[];
}

export default function BMICalculatorScreen() {
  const { data } = useOnboarding();
  const { session } = useAuth();
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [activityLevel, setActivityLevel] = useState('');
  const [bmi, setBmi] = useState<number | null>(null);
  const [recommendation, setRecommendation] = useState<BMIRecommendation | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const getBMICategory = (bmiValue: number): "Underweight" | "Normal Weight" | "Overweight" | "Obese" => {
    if (bmiValue < 18.5) return "Underweight";
    if (bmiValue >= 18.5 && bmiValue < 25) return "Normal Weight";
    if (bmiValue >= 25 && bmiValue < 30) return "Overweight";
    return "Obese";
  };

  const calculateBMI = () => {
    if (!weight || !height) {
      Alert.alert('Error', 'Please enter both weight and height');
      return;
    }
    
    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height) / 100; // convert cm to meters
    const bmiValue = weightNum / (heightNum * heightNum);
    setBmi(parseFloat(bmiValue.toFixed(1)));
    
    // Get recommendations based on BMI
    if (bmiValue < 18.5) {
      setRecommendation({
        category: 'Underweight',
        dietaryAdvice: [
          'Increase caloric intake with nutrient-dense foods',
          'Add healthy fats like nuts, avocados, and olive oil',
          'Consume protein-rich foods for muscle building',
          'Eat frequent, smaller meals throughout the day'
        ],
        exerciseAdvice: [
          'Focus on strength training to build muscle',
          'Start with bodyweight exercises',
          'Gradually increase workout intensity',
          'Include rest days for recovery'
        ]
      });
    } else if (bmiValue >= 18.5 && bmiValue < 25) {
      setRecommendation({
        category: 'Normal Weight',
        dietaryAdvice: [
          'Maintain balanced nutrition',
          'Include variety of fruits and vegetables',
          'Choose whole grains over refined grains',
          'Stay hydrated with water'
        ],
        exerciseAdvice: [
          'Mix cardio and strength training',
          '150 minutes of moderate exercise per week',
          'Try different activities to stay motivated',
          'Include flexibility exercises'
        ]
      });
    } else if (bmiValue >= 25 && bmiValue < 30) {
      setRecommendation({
        category: 'Overweight',
        dietaryAdvice: [
          'Create a moderate caloric deficit',
          'Increase fiber intake for satiety',
          'Control portion sizes',
          'Limit processed foods and sugars'
        ],
        exerciseAdvice: [
          'Regular cardio exercises',
          'Include strength training',
          'Start with low-impact activities',
          'Gradually increase duration'
        ]
      });
    } else {
      setRecommendation({
        category: 'Obese',
        dietaryAdvice: [
          'Consult with healthcare provider',
          'Focus on whole, unprocessed foods',
          'Track food intake',
          'Plan meals in advance'
        ],
        exerciseAdvice: [
          'Start with walking',
          'Try water-based exercises',
          'Work with a fitness professional',
          'Focus on consistency over intensity'
        ]
      });
    }
  };

  const handleNext = async () => {
    if (!weight || !height || !age || !gender || !activityLevel) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height);
    const ageNum = parseInt(age);

    if (isNaN(weightNum) || isNaN(heightNum) || isNaN(ageNum)) {
      Alert.alert('Error', 'Please enter valid numbers');
      return;
    }

    setIsSaving(true);
    try {
      if (!session?.user?.id) {
        throw new Error('User not authenticated');
      }

      const heightInMeters = heightNum / 100;
      const bmiValue = weightNum / (heightInMeters * heightInMeters);
      const bmiCategory = getBMICategory(bmiValue);

      const { error } = await supabase
        .from('user_health_metrics')
        .upsert({
          user_id: session.user.id,
          weight: weightNum,
          height: heightNum,
          age: ageNum,
          gender,
          activity_level: activityLevel,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      console.log('BMI data saved successfully');
      router.push('/(onboarding)/dietary-preferences');
    } catch (error: any) {
      console.error('Error saving health metrics:', error);
      Alert.alert('Error', error.message || 'Failed to save health metrics');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Calculate Your BMI</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Weight (kg)</Text>
          <TextInput
            style={styles.input}
            value={weight}
            onChangeText={setWeight}
            keyboardType="numeric"
            placeholder="Enter your weight"
            editable={!isSaving}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Height (cm)</Text>
          <TextInput
            style={styles.input}
            value={height}
            onChangeText={setHeight}
            keyboardType="numeric"
            placeholder="Enter your height"
            editable={!isSaving}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Age</Text>
          <TextInput
            style={styles.input}
            value={age}
            onChangeText={setAge}
            keyboardType="numeric"
            placeholder="Enter your age"
            editable={!isSaving}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Gender</Text>
          <Picker
            selectedValue={gender}
            onValueChange={(value) => setGender(value)}
            enabled={!isSaving}
            style={styles.picker}
          >
            <Picker.Item label="Select gender" value="" />
            <Picker.Item label="Male" value="male" />
            <Picker.Item label="Female" value="female" />
            <Picker.Item label="Other" value="other" />
          </Picker>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Activity Level</Text>
          <Picker
            selectedValue={activityLevel}
            onValueChange={(value) => setActivityLevel(value)}
            enabled={!isSaving}
            style={styles.picker}
          >
            <Picker.Item label="Select activity level" value="" />
            <Picker.Item label="Sedentary" value="sedentary" />
            <Picker.Item label="Lightly Active" value="lightly_active" />
            <Picker.Item label="Moderately Active" value="moderately_active" />
            <Picker.Item label="Very Active" value="very_active" />
            <Picker.Item label="Extra Active" value="extra_active" />
          </Picker>
        </View>

        <TouchableOpacity
          style={[styles.calculateButton, isSaving && styles.buttonDisabled]}
          onPress={calculateBMI}
          disabled={isSaving}
        >
          <Text style={styles.buttonText}>Calculate BMI</Text>
        </TouchableOpacity>

        {bmi !== null && recommendation && (
          <View style={styles.resultContainer}>
            <Text style={styles.bmiValue}>Your BMI: {bmi}</Text>
            <Text style={styles.category}>{recommendation.category}</Text>

            <Text style={styles.sectionTitle}>Dietary Recommendations:</Text>
            {recommendation.dietaryAdvice.map((advice, index) => (
              <Text key={`diet-${index}`} style={styles.advice}>• {advice}</Text>
            ))}

            <Text style={styles.sectionTitle}>Exercise Recommendations:</Text>
            {recommendation.exerciseAdvice.map((advice, index) => (
              <Text key={`exercise-${index}`} style={styles.advice}>• {advice}</Text>
            ))}
          </View>
        )}

        <Button 
          onPress={handleNext}
          disabled={isSaving || !weight || !height || !age || !gender || !activityLevel}
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
    marginBottom: 30,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
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
  },
  calculateButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  resultContainer: {
    backgroundColor: '#f5f5f5',
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
  },
  bmiValue: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#2f95dc',
  },
  category: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 10,
    color: '#333',
  },
  advice: {
    fontSize: 16,
    marginBottom: 5,
    color: '#666',
    lineHeight: 22,
  },
  button: {
    width: '100%',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  picker: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 10,
  },
}); 