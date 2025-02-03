import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useOnboarding } from '@/context/onboarding';

interface BMIRecommendation {
  category: string;
  dietaryAdvice: string[];
  exerciseAdvice: string[];
}

export default function BMICalculatorScreen() {
  const { data } = useOnboarding();
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [bmi, setBmi] = useState<number | null>(null);
  const [recommendation, setRecommendation] = useState<BMIRecommendation | null>(null);

  const calculateBMI = () => {
    if (!weight || !height) return;
    
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

  useEffect(() => {
    if (data.primaryGoal) {
      // Adjust recommendations based on user's goal
      // This could be expanded based on your needs
    }
  }, [data.primaryGoal]);

  const handleNext = () => {
    router.push('/(onboarding)/goals');
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
          />
        </View>

        <TouchableOpacity
          style={styles.calculateButton}
          onPress={calculateBMI}
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

        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
        >
          <Text style={styles.buttonText}>Next</Text>
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
  nextButton: {
    backgroundColor: '#2f95dc',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 