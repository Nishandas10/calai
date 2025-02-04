import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useAuth } from '@/context/auth';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { CircularProgress } from '@/components/ui/circular-progress';
import { Card } from '@/components/ui/card';

interface DailyNutrition {
  target_calories: number;
  target_protein: number;
  target_carbs: number;
  target_fat: number;
  consumed_calories: number;
  consumed_protein: number;
  consumed_carbs: number;
  consumed_fat: number;
}

export default function DashboardScreen() {
  const { session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [nutrition, setNutrition] = useState<DailyNutrition | null>(null);

  useEffect(() => {
    fetchOrCreateDailyTargets();
  }, []);

  const calculateDailyTargets = async () => {
    try {
      // Fetch user's health metrics and goals
      const { data: healthMetrics } = await supabase
        .from('user_health_metrics')
        .select('*')
        .eq('user_id', session?.user.id)
        .single();

      const { data: goals } = await supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', session?.user.id)
        .single();

      const { data: macroGoals } = await supabase
        .from('user_macro_goals')
        .select('*')
        .eq('user_id', session?.user.id)
        .single();

      if (!healthMetrics || !goals || !macroGoals) return null;

      // Calculate BMR using Mifflin-St Jeor Equation
      const bmr = healthMetrics.gender === 'male'
        ? (10 * healthMetrics.weight) + (6.25 * healthMetrics.height) - (5 * healthMetrics.age) + 5
        : (10 * healthMetrics.weight) + (6.25 * healthMetrics.height) - (5 * healthMetrics.age) - 161;

      // Adjust calories based on activity level and goal
      let activityMultiplier = 1.2; // Sedentary
      switch(healthMetrics.activity_level) {
        case 'light': activityMultiplier = 1.375; break;
        case 'moderate': activityMultiplier = 1.55; break;
        case 'heavy': activityMultiplier = 1.725; break;
        case 'athlete': activityMultiplier = 1.9; break;
      }

      let targetCalories = Math.round(bmr * activityMultiplier);

      // Adjust calories based on goal
      switch(goals.primary_goal) {
        case 'weight_loss':
          targetCalories -= 500; // Create caloric deficit
          break;
        case 'weight_gain':
          targetCalories += 500; // Create caloric surplus
          break;
      }

      // Calculate macros based on percentages
      const targetProtein = Math.round((targetCalories * (macroGoals.protein / 100)) / 4);
      const targetCarbs = Math.round((targetCalories * (macroGoals.carbs / 100)) / 4);
      const targetFat = Math.round((targetCalories * (macroGoals.fat / 100)) / 9);

      return {
        target_calories: targetCalories,
        target_protein: targetProtein,
        target_carbs: targetCarbs,
        target_fat: targetFat,
        consumed_calories: 0,
        consumed_protein: 0,
        consumed_carbs: 0,
        consumed_fat: 0
      };
    } catch (error) {
      console.error('Error calculating targets:', error);
      return null;
    }
  };

  const fetchOrCreateDailyTargets = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Try to fetch today's targets
      const { data: existingTargets } = await supabase
        .from('daily_nutrition_targets')
        .select('*')
        .eq('user_id', session?.user.id)
        .eq('date', today)
        .single();

      if (existingTargets) {
        setNutrition(existingTargets);
      } else {
        // Calculate and create new targets
        const newTargets = await calculateDailyTargets();
        if (newTargets) {
          const { data } = await supabase
            .from('daily_nutrition_targets')
            .insert({
              user_id: session?.user.id,
              ...newTargets
            })
            .select()
            .single();

          if (data) setNutrition(data);
        }
      }
    } catch (error) {
      console.error('Error fetching nutrition data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!nutrition) {
    return (
      <View style={styles.errorContainer}>
        <Text>Failed to load nutrition data</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Cal AI</Text>
        <View style={styles.streakContainer}>
          <Ionicons name="flame" size={24} color="#FF9500" />
          <Text style={styles.streakText}>0</Text>
        </View>
      </View>

      <Card style={styles.calorieCard}>
        <Text style={styles.calorieTitle}>
          {nutrition.target_calories - nutrition.consumed_calories}
        </Text>
        <Text style={styles.calorieSubtitle}>Calories left</Text>
        <CircularProgress 
          value={(nutrition.consumed_calories / nutrition.target_calories) * 100}
          size={120}
          strokeWidth={10}
          color="#FF9500"
        />
      </Card>

      <View style={styles.macrosContainer}>
        <Card style={styles.macroCard}>
          <Text style={styles.macroValue}>
            {nutrition.target_protein - nutrition.consumed_protein}g
          </Text>
          <Text style={styles.macroLabel}>Protein left</Text>
          <CircularProgress 
            value={(nutrition.consumed_protein / nutrition.target_protein) * 100}
            size={80}
            strokeWidth={8}
            color="#FF2D55"
          />
        </Card>

        <Card style={styles.macroCard}>
          <Text style={styles.macroValue}>
            {nutrition.target_carbs - nutrition.consumed_carbs}g
          </Text>
          <Text style={styles.macroLabel}>Carbs left</Text>
          <CircularProgress 
            value={(nutrition.consumed_carbs / nutrition.target_carbs) * 100}
            size={80}
            strokeWidth={8}
            color="#5856D6"
          />
        </Card>

        <Card style={styles.macroCard}>
          <Text style={styles.macroValue}>
            {nutrition.target_fat - nutrition.consumed_fat}g
          </Text>
          <Text style={styles.macroLabel}>Fats left</Text>
          <CircularProgress 
            value={(nutrition.consumed_fat / nutrition.target_fat) * 100}
            size={80}
            strokeWidth={8}
            color="#34C759"
          />
        </Card>
      </View>

      <View style={styles.recentSection}>
        <Text style={styles.sectionTitle}>Recently eaten</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            You haven't uploaded any food
          </Text>
          <Text style={styles.emptyStateSubtext}>
            Start tracking Today's meals by taking a quick pictures
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 8,
    borderRadius: 20,
  },
  streakText: {
    marginLeft: 4,
    fontWeight: 'bold',
  },
  calorieCard: {
    margin: 20,
    padding: 20,
    alignItems: 'center',
  },
  calorieTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  calorieSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  macrosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  macroCard: {
    flex: 1,
    margin: 5,
    padding: 15,
    alignItems: 'center',
  },
  macroValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  macroLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  recentSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  emptyState: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
}); 