import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { router, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useOnboarding } from '@/context/onboarding';
import { supabase } from '@/lib/supabase';
import { theme } from '@/constants/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CIRCLE_SIZE = (SCREEN_WIDTH - 100) / 2; // Slightly smaller circles
const CIRCLE_RADIUS = (CIRCLE_SIZE - 32) / 2; // Adjusted radius
const CIRCLE_LENGTH = 2 * Math.PI * CIRCLE_RADIUS;

interface MacroRecommendations {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export default function CompletedScreen() {
  const { data } = useOnboarding();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<MacroRecommendations | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAiRecommendations();
  }, []);

  const fetchAiRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session found');

      console.log('Sending request with data:', data);
      
      const response = await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/analyze-macros`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userData: data }),
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        console.error('Error response:', responseData);
        throw new Error(responseData.error || 'Failed to fetch AI recommendations');
      }

      console.log('AI recommendations:', responseData);
      setAiRecommendations(responseData);
    } catch (err: any) {
      const errorMessage = err.message || 'Unknown error occurred';
      console.error('Error details:', err);
      setError(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const calculateManualMacros = () => {
    if (!data.weight || !data.height || !data.birthday || !data.gender || !data.activityLevel) {
      return null;
    }

    // Calculate age
    const birthDate = new Date(data.birthday);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();

    // Calculate BMR using Mifflin-St Jeor formula
    const bmr = data.gender === 'male'
      ? 10 * data.weight + 6.25 * data.height - 5 * age + 5
      : 10 * data.weight + 6.25 * data.height - 5 * age - 161;

    // Activity multipliers
    const activityMultipliers = {
      1: 1.2,  // Sedentary
      2: 1.375,  // Lightly active
      3: 1.55,  // Moderately active
      4: 1.725,  // Very active
      5: 1.9,  // Super active
    };

    // Calculate TDEE
    const tdee = bmr * activityMultipliers[data.activityLevel as keyof typeof activityMultipliers];

    // Calculate macros based on standard ratios
    return {
      calories: Math.round(tdee),
      protein: Math.round((tdee * 0.3) / 4), // 30% protein
      carbs: Math.round((tdee * 0.4) / 4),   // 40% carbs
      fat: Math.round((tdee * 0.3) / 9),     // 30% fat
    };
  };

  const manualMacros = calculateManualMacros();

  const MacroDisplay = ({ title, macros }: { title: string, macros: MacroRecommendations | null }) => {
    if (!macros) return null;

    return (
      <View style={styles.macroContainer}>
        <Text style={styles.macroTitle}>{title}</Text>
        <Text style={styles.macroText}>Calories: {macros.calories} kcal</Text>
        <Text style={styles.macroText}>Protein: {macros.protein}g</Text>
        <Text style={styles.macroText}>Carbs: {macros.carbs}g</Text>
        <Text style={styles.macroText}>Fat: {macros.fat}g</Text>
      </View>
    );
  };
  
  // Calculate TDEE and macros
  const calculateDailyCalories = () => {
    const { gender, weight, height, activityLevel, usersGoal, weeklyPace } = data;
    
    // Add safety checks for required values
    if (!weight || !height || !activityLevel) {
      return {
        calories: 2000, // Default calories
        macros: {
          protein: 150,
          carbs: 200,
          fat: 67
        }
      };
    }
    
    // Calculate BMR using Mifflin-St Jeor formula
    const age = data.birthday ? Math.floor((new Date().getTime() - new Date(data.birthday).getTime()) / 31557600000) : 25;
    const bmr = gender === 'male'
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161;

    // Activity multipliers
    const activityMultipliers = {
      1: 1.2,  // Sedentary
      2: 1.375,  // Lightly active
      3: 1.55,  // Moderately active
      4: 1.725,  // Very active
      5: 1.9,  // Super active
    };

    // Calculate TDEE with safety check
    const multiplier = activityMultipliers[activityLevel as keyof typeof activityMultipliers] || 1.2;
    const tdee = bmr * multiplier;

    // Calculate macros based on goal
    let dailyCalories = tdee;
    let protein = 0, carbs = 0, fat = 0;

    // Ensure weight is available for calculations
    const safeWeight = weight || 70; // Default to 70kg if weight is not available

    switch (usersGoal) {
      case 'Lose weight':
        protein = safeWeight * 2.2;
        fat = safeWeight * 0.8;
        dailyCalories = tdee * 0.8;
        dailyCalories -= (weeklyPace || 0.5) * 1100;
        break;

      case 'Gain muscle':
        protein = safeWeight * 2.4;
        fat = safeWeight * 1.0;
        dailyCalories = tdee * 1.1;
        dailyCalories += (weeklyPace || 0.5) * 500;
        break;

      case 'Maintain':
        protein = safeWeight * 1.8;
        fat = safeWeight * 0.8;
        dailyCalories = tdee;
        break;

      case 'Boost Energy':
        protein = safeWeight * 1.8;
        fat = safeWeight * 0.7;
        dailyCalories = tdee * 1.1;
        break;

      case 'Improve Nutrition':
        protein = safeWeight * 2.0;
        fat = safeWeight * 0.85;
        dailyCalories = tdee;
        break;

      case 'Gain Weight':
        protein = safeWeight * 2.0;
        fat = safeWeight * 1.1;
        dailyCalories = tdee * 1.15;
        dailyCalories += (weeklyPace || 0.5) * 1100;
        break;

      default:
        protein = safeWeight * 2.0;
        fat = safeWeight * 0.9;
        dailyCalories = tdee;
    }

    // Ensure minimum calories
    dailyCalories = Math.max(1200, dailyCalories);

    // Calculate carbs from remaining calories
    const proteinCalories = protein * 4;
    const fatCalories = fat * 9;
    carbs = Math.max(0, (dailyCalories - (proteinCalories + fatCalories)) / 4);

    // Ensure non-negative values and round
    protein = Math.max(0, Math.round(protein));
    carbs = Math.max(0, Math.round(carbs));
    fat = Math.max(0, Math.round(fat));

    return {
      calories: Math.round(dailyCalories),
      macros: { protein, carbs, fat }
    };
  };

  const { calories: dailyCalories, macros } = calculateDailyCalories();
  const { protein: proteinGrams, carbs: carbsGrams, fat: fatGrams } = macros;

  // Add safety checks for macro calculations
  const totalCalories = dailyCalories || 2000; // Fallback to 2000 if undefined
  const safeProtein = proteinGrams || 0;
  const safeCarbs = carbsGrams || 0;
  const safeFat = fatGrams || 0;

  // Calculate percentages safely
  const proteinPercentage = Math.round((safeProtein * 4 * 100) / totalCalories) || 0;
  const carbsPercentage = Math.round((safeCarbs * 4 * 100) / totalCalories) || 0;
  const fatPercentage = Math.round((safeFat * 9 * 100) / totalCalories) || 0;

  // Add color gradient functions
  const getProteinColor = (percentage: number) => {
    if (percentage < 10) return '#FFE5E5';     // Very low - light red
    if (percentage < 20) return '#FFB6B6';     // Low - medium red
    if (percentage < 30) return '#FF6B6B';     // Target range - vibrant red
    return '#FF4444';                          // High - deep red
  };

  const getCarbsColor = (percentage: number) => {
    if (percentage < 20) return '#E0F7F5';     // Very low - light teal
    if (percentage < 35) return '#98E2DD';     // Low - medium teal
    if (percentage < 50) return '#4ECDC4';     // Target range - vibrant teal
    return '#2BA89F';                          // High - deep teal
  };

  const getFatColor = (percentage: number) => {
    if (percentage < 15) return '#FFF8E0';     // Very low - light gold
    if (percentage < 25) return '#FFE066';     // Low - medium gold
    if (percentage < 35) return '#FFD700';     // Target range - vibrant gold
    return '#FFB700';                          // High - deep gold
  };

  const renderProgressCircle = (progress: number, baseColor: string, percentage: number, type: 'protein' | 'carbs' | 'fat' | 'calories') => {
    // Get dynamic color based on type and percentage
    let color;
    switch (type) {
      case 'calories':
        color = baseColor;
        break;
      case 'protein':
        color = getProteinColor(percentage);
        break;
      case 'carbs':
        color = getCarbsColor(percentage);
        break;
      case 'fat':
        color = getFatColor(percentage);
        break;
      default:
        color = baseColor;
    }

    return (
      <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE}>
      <Circle
          cx={CIRCLE_SIZE / 2}
          cy={CIRCLE_SIZE / 2}
          r={(CIRCLE_SIZE - 10) / 2}
        stroke="#E8E8E8"
        strokeWidth={8}
        fill="none"
      />
      <Circle
          cx={CIRCLE_SIZE / 2}
          cy={CIRCLE_SIZE / 2}
          r={(CIRCLE_SIZE - 10) / 2}
        stroke={color}
        strokeWidth={8}
          strokeDasharray={`${progress * CIRCLE_SIZE * Math.PI} ${CIRCLE_SIZE * Math.PI}`}
        strokeLinecap="round"
        fill="none"
          transform={`rotate(-90 ${CIRCLE_SIZE / 2} ${CIRCLE_SIZE / 2})`}
      />
    </Svg>
  );
  };

  const MacroIcon = ({ type }: { type: 'protein' | 'carbs' | 'fat' | 'calories' }) => {
    let iconName = '';
    let iconColor = '';
    let bgColor = '';

    switch (type) {
      case 'calories':
        iconName = 'fire';
        iconColor = '#000000';
        bgColor = '#FFF5F5';
        break;
      case 'protein':
        iconName = 'food-turkey';
        iconColor = '#FF6B6B';
        bgColor = '#FFF0F0';
        break;
      case 'carbs':
        iconName = 'barley';
        iconColor = '#4ECDC4';
        bgColor = '#F0FAF9';
        break;
      case 'fat':
        iconName = 'cheese';
        iconColor = '#FFB700';
        bgColor = '#FFF9E6';
        break;
    }

    return (
      <View style={[styles.macroIconContainer, { backgroundColor: bgColor }]}>
        <MaterialCommunityIcons name={iconName as any} size={36} color={iconColor} />
      </View>
    );
  };

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

          {data.targetWeight && (
          <View style={styles.targetSection}>
              <Text style={styles.targetLabel}>Target Weight:</Text>
              <Text style={styles.targetValue}>{data.targetWeight} {data.unit === 'metric' ? 'kg' : 'lb'}</Text>
          </View>
          )}

          <View style={styles.recommendationCard}>
            <View style={styles.recommendationHeader}>
              <Text style={styles.recommendationTitle}>Daily Recommendation</Text>
            </View>

            <View style={styles.macrosGrid}>
              {/* Calories Circle - Top Left */}
              <View style={styles.macroCard}>
                {renderProgressCircle(0.85, '#000', 85, 'calories')}
                <MacroIcon type="calories" />
                <Text style={styles.macroValue}>{dailyCalories}</Text>
                <Text style={styles.macroLabel}>kcal/day</Text>
              </View>

              {/* Carbs Circle - Top Right */}
              <View style={styles.macroCard}>
                {renderProgressCircle(carbsPercentage / 100, '#4ECDC4', carbsPercentage, 'carbs')}
                <MacroIcon type="carbs" />
                <Text style={styles.macroValue}>{safeCarbs}g</Text>
                <Text style={styles.macroLabel}>Carbs</Text>
                <Text style={[styles.macroPercentage, { color: getCarbsColor(carbsPercentage) }]}>
                  {carbsPercentage}%
                </Text>
              </View>

              {/* Protein Circle - Bottom Left */}
              <View style={styles.macroCard}>
                {renderProgressCircle(proteinPercentage / 100, '#FF6B6B', proteinPercentage, 'protein')}
                <MacroIcon type="protein" />
                <Text style={styles.macroValue}>{safeProtein}g</Text>
                <Text style={styles.macroLabel}>Protein</Text>
                <Text style={[styles.macroPercentage, { color: getProteinColor(proteinPercentage) }]}>
                  {proteinPercentage}%
                </Text>
              </View>

              {/* Fat Circle - Bottom Right */}
              <View style={styles.macroCard}>
                {renderProgressCircle(fatPercentage / 100, '#FFD700', fatPercentage, 'fat')}
                <MacroIcon type="fat" />
                <Text style={styles.macroValue}>{safeFat}g</Text>
                <Text style={styles.macroLabel}>Fat</Text>
                <Text style={[styles.macroPercentage, { color: getFatColor(fatPercentage) }]}>
                  {fatPercentage}%
                </Text>
              </View>
            </View>

            <View style={styles.healthScore}>
              <View style={styles.healthScoreLeft}>
                <Ionicons name="heart-half" size={20} color="#EF5350" />
                <Text style={styles.healthScoreLabel}>Health score</Text>
              </View>
              <Text style={styles.healthScoreValue}>
                {Math.round((proteinPercentage + carbsPercentage + fatPercentage) / 30)}/10
              </Text>
            </View>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loadingIndicator} />
          ) : error ? (
            <Text style={styles.error}>{error}</Text>
          ) : (
            <>
              <MacroDisplay title="AI Recommendations" macros={aiRecommendations} />
              <MacroDisplay title="Standard Calculations" macros={manualMacros} />
            </>
          )}
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
    marginBottom: 16,
    alignItems: 'center',
  },
  recommendationTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  macrosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 20,
  },
  macroCard: {
    width: '47%',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 16,
    padding: 16,
    position: 'relative',
  },
  macroIconContainer: {
    position: 'absolute',
    marginTop: 15,
    top: (CIRCLE_SIZE - 60) / 2,
    left: (CIRCLE_SIZE - 60) / 2,
    right: (CIRCLE_SIZE - 60) / 2,
    bottom: (CIRCLE_SIZE - 60) / 2,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
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
    fontWeight: '600',
  },
  macroPercentage: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
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
  caloriesContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  caloriesValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
  },
  caloriesLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  loadingIndicator: {
    marginTop: 20,
  },
  error: {
    color: theme.colors.error,
    textAlign: 'center',
    marginBottom: 20,
  },
  macroContainer: {
    backgroundColor: theme.colors.background,
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  macroTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 10,
  },
  macroText: {
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: 5,
  },
}); 