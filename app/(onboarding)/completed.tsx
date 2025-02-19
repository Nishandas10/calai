import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useOnboarding } from '@/context/onboarding';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CIRCLE_SIZE = (SCREEN_WIDTH - 100) / 2; // Slightly smaller circles
const CIRCLE_RADIUS = (CIRCLE_SIZE - 32) / 2; // Adjusted radius
const CIRCLE_LENGTH = 2 * Math.PI * CIRCLE_RADIUS;

export default function CompletedScreen() {
  const { data } = useOnboarding();
  
  // Calculate TDEE and macros
  const calculateDailyCalories = () => {
    const { gender, weight, height, activityLevel, primaryGoal, weeklyPace } = data;
    
    // Calculate BMR using Mifflin-St Jeor formula
    const age = data.birthday ? Math.floor((new Date().getTime() - new Date(data.birthday).getTime()) / 31557600000) : 25;
    const bmr = gender === 'male'
      ? 10 * weight! + 6.25 * height! - 5 * age + 5
      : 10 * weight! + 6.25 * height! - 5 * age - 161;

    // Activity multipliers
    const activityMultipliers = {
      1: 1.2,  // Sedentary
      2: 1.375,  // Lightly active
      3: 1.55,  // Moderately active
      4: 1.725,  // Very active
      5: 1.9,  // Super active
    };

    // Calculate TDEE
    const tdee = bmr * activityMultipliers[activityLevel as keyof typeof activityMultipliers];

    // Adjust calories based on goal and weekly pace
    let dailyCalories = tdee;
    const goal = primaryGoal?.toLowerCase().replace(' ', '_');
    
    if (goal === 'lose_weight') {
      dailyCalories -= (weeklyPace || 0.5) * 1100; // 1100 calories deficit per kg per week
    } else if (goal === 'gain_muscle' || goal === 'gain_weight') {
      dailyCalories += 500; // Standard surplus for muscle gain
    }

    return Math.round(dailyCalories);
  };

  const renderProgressCircle = (progress: number, color: string, size: number = CIRCLE_SIZE) => (
    <Svg width={size} height={size}>
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={(size - 10) / 2}
        stroke="#E8E8E8"
        strokeWidth={8}
        fill="none"
      />
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={(size - 10) / 2}
        stroke={color}
        strokeWidth={8}
        strokeDasharray={`${progress * size * Math.PI} ${size * Math.PI}`}
        strokeLinecap="round"
        fill="none"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </Svg>
  );

  const dailyCalories = calculateDailyCalories();
  const proteinGrams = Math.round(data.weight! * 2); // 2g per kg of body weight
  const fatGrams = Math.round(dailyCalories * 0.25 / 9); // 25% of calories from fat
  const carbsGrams = Math.round((dailyCalories - (proteinGrams * 4 + fatGrams * 9)) / 4); // Remaining calories from carbs

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {/* <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity> */}
        {/* <View style={styles.progressBar}>
          <View style={styles.progressFill} />
        </View> */}
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View 
          entering={FadeIn}
          style={styles.content}
        >
          <View style={styles.checkmark}>
            <Ionicons name="checkmark" size={40} color="#fff" />
          </View>

          <Text style={styles.title}>Congratulations{'\n'}your custom plan is ready!</Text>

          <View style={styles.targetSection}>
            <Text style={styles.targetLabel}>You should Lose:</Text>
            <Text style={styles.targetValue}>17.0 kg by July 01</Text>
          </View>

          <View style={styles.recommendationCard}>
            <View style={styles.recommendationHeader}>
              <Text style={styles.recommendationTitle}>Daily Recommendation</Text>
              <Text style={styles.recommendationSubtitle}>You can edit this any time</Text>
            </View>

            <View style={styles.macrosGrid}>
              <View style={styles.macroCard}>
                {renderProgressCircle(0.33, '#FF6B6B')}
                <Text style={styles.macroValue}>{proteinGrams}g</Text>
                <Text style={styles.macroLabel}>Protein</Text>
              </View>

              <View style={styles.macroCard}>
                {renderProgressCircle(0.33, '#4ECDC4')}
                <Text style={styles.macroValue}>{carbsGrams}g</Text>
                <Text style={styles.macroLabel}>Carbs</Text>
              </View>

              <View style={styles.macroCard}>
                {renderProgressCircle(0.33, '#45B7D1')}
                <Text style={styles.macroValue}>{fatGrams}g</Text>
                <Text style={styles.macroLabel}>Fat</Text>
              </View>
            </View>

            <View style={styles.healthScore}>
              <View style={styles.healthScoreLeft}>
                <Ionicons name="heart-half" size={20} color="#EF5350" />
                <Text style={styles.healthScoreLabel}>Health score</Text>
              </View>
              <Text style={styles.healthScoreValue}>7/10</Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.startButton}
          onPress={() => router.push('/(tabs)')}
        >
          <Text style={styles.startButtonText}>Let's get started!</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#f0f0f0',
    borderRadius: 2,
  },
  progressFill: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
    borderRadius: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  checkmark: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 32,
  },
  targetSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  targetLabel: {
    fontSize: 18,
    color: '#000',
    marginBottom: 6,
  },
  targetValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
  },
  recommendationCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  recommendationHeader: {
    marginBottom: 20,
  },
  recommendationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  recommendationSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  macrosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  macroCard: {
    width: '48%',
    marginBottom: 12,
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 16,
    padding: 16,
  },
  macroValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 12,
  },
  macroLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  healthScore: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  healthScoreLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  healthScoreLabel: {
    fontSize: 14,
    color: '#000',
  },
  healthScoreValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#fff',
  },
  startButton: {
    backgroundColor: '#000',
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 