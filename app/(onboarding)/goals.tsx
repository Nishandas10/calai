import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useOnboarding } from '@/context/onboarding';
import { OnboardingHeader } from '@/components/onboarding/OnboardingHeader';
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';
import { OnboardingButton } from '@/components/onboarding/OnboardingButton';
import { Ionicons } from '@expo/vector-icons';

const GOALS = [
  {
    id: 'lose_weight',
    title: 'Lose Weight',
    icon: '🔥',
    priority: {
      lose_weight: 5,
      gain_muscle: 2,    // Very low - opposing goals
      maintain: 2,
      boost_energy: 2,   // Increased - energy important during deficit
      improve_nutrition: 3, // Increased - crucial for healthy weight loss
      gain_weight: 0     // Completely opposing
    }
  },
  {
    id: 'gain_muscle',
    title: 'Gain Muscle',
    icon: '💪',
    priority: {
      lose_weight: 2,    // Very low - opposing goals
      gain_muscle: 5,
      maintain: 3,       // Increased - muscle maintenance is relevant
      boost_energy: 4,   // Increased - needed for intense training
      improve_nutrition: 4, // Increased - crucial for muscle growth
      gain_weight: 3     // Decreased - controlled gain preferred
    }
  },
  {
    id: 'maintain',
    title: 'Maintain Weight',
    icon: '⚖️',
    priority: {
      lose_weight: 2,
      gain_muscle: 3,    // Increased - body recomposition possible
      maintain: 5,
      boost_energy: 3,
      improve_nutrition: 4, // Increased - key for maintenance
      gain_weight: 2
    }
  },
  {
    id: 'boost_energy',
    title: 'Boost Energy',
    icon: '⚡',
    priority: {
      lose_weight: 3,    // Increased - energy important during deficit
      gain_muscle: 4,    // Increased - synergistic goals
      maintain: 3,
      boost_energy: 5,
      improve_nutrition: 5, // Increased - directly impacts energy
      gain_weight: 2
    }
  },
  {
    id: 'improve_nutrition',
    title: 'Improve Nutrition',
    icon: '🥗',
    priority: {
      lose_weight: 4,    // Increased - healthy weight loss
      gain_muscle: 4,    // Increased - quality muscle gain
      maintain: 4,       // Increased - healthy maintenance
      boost_energy: 5,   // Increased - direct relationship
      improve_nutrition: 5,
      gain_weight: 3
    }
  },
  {
    id: 'gain_weight',
    title: 'Gain Weight',
    icon: '🎯',
    priority: {
      lose_weight: 0,    // Completely opposing
      gain_muscle: 3,    // Decreased - controlled gain preferred
      maintain: 2,
      boost_energy: 2,
      improve_nutrition: 3,
      gain_weight: 5
    }
  },
] as const;

type GoalType = typeof GOALS[number]['id'];

const calculatePrimaryGoal = (selectedGoals: GoalType[]): GoalType => {
  // If only one goal is selected, return it
  if (selectedGoals.length === 1) {
    return selectedGoals[0];
  }

  // Calculate priority scores for each possible goal
  const priorityScores = GOALS.reduce((scores, goal) => {
    scores[goal.id] = 0;
    return scores;
  }, {} as Record<GoalType, number>);

  // For each selected goal, add its priority scores
  selectedGoals.forEach(selectedGoal => {
    const goalData = GOALS.find(g => g.id === selectedGoal);
    if (goalData) {
      Object.entries(goalData.priority).forEach(([targetGoal, priority]) => {
        priorityScores[targetGoal as GoalType] += priority;
      });
    }
  });

  // Find the goal with the highest priority score
  let maxScore = -1;
  let primaryGoal: GoalType = 'maintain';

  Object.entries(priorityScores).forEach(([goal, score]) => {
    if (score > maxScore) {
      maxScore = score;
      primaryGoal = goal as GoalType;
    }
  });

  console.log('Priority scores:', priorityScores);
  console.log('Selected primary goal:', primaryGoal);

  return primaryGoal;
};

export default function GoalsScreen() {
  const { setGoals } = useOnboarding();
  const [selectedGoals, setSelectedGoals] = useState<GoalType[]>([]);

  const toggleGoal = (goalId: GoalType) => {
    setSelectedGoals(prev => {
      if (prev.includes(goalId)) {
        return prev.filter(id => id !== goalId);
      }
      // Allow up to 3 goals
      if (prev.length >= 3) {
        return prev;
      }
      return [...prev, goalId];
    });
  };

  const handleNext = () => {
    if (selectedGoals.length > 0) {
      const primaryGoalId = calculatePrimaryGoal(selectedGoals);
      
      const goalMapping = {
        'lose_weight': 'Lose weight',
        'gain_muscle': 'Gain muscle',
        'maintain': 'Maintain',
        'boost_energy': 'Boost Energy',
        'improve_nutrition': 'Improve Nutrition',
        'gain_weight': 'Gain Weight'
      } as const;

      const primaryGoal = goalMapping[primaryGoalId];
      setGoals(primaryGoal, null, 0);
      router.push('/(onboarding)/target-weight');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <OnboardingHeader 
          title="What are your goals with CalAI?" 
          subtitle="Select up to 3 goals"
          showBackButton
        />
        <OnboardingProgress step={4} totalSteps={8} />
      </View>

      <View style={styles.contentWrapper}>
        <View style={styles.content}>
          {GOALS.map((goal) => (
            <TouchableOpacity
              key={goal.id}
              style={[
                styles.goalOption,
                selectedGoals.includes(goal.id) && styles.selectedOption,
                selectedGoals.length >= 3 && !selectedGoals.includes(goal.id) && styles.disabledOption
              ]}
              onPress={() => toggleGoal(goal.id)}
              disabled={selectedGoals.length >= 3 && !selectedGoals.includes(goal.id)}
            >
              <View style={styles.goalContent}>
                <Text style={styles.goalIcon}>{goal.icon}</Text>
                <Text style={[
                  styles.goalText,
                  selectedGoals.includes(goal.id) && styles.selectedText,
                  selectedGoals.length >= 3 && !selectedGoals.includes(goal.id) && styles.disabledText
                ]}>
                  {goal.title}
                </Text>
              </View>
              {selectedGoals.includes(goal.id) && (
                <Ionicons name="checkmark" size={24} color="#fff" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <OnboardingButton 
          label="Next"
          onPress={handleNext}
          disabled={selectedGoals.length === 0}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 40,
  },
  content: {
    paddingHorizontal: 20,
    gap: 12,
  },
  goalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedOption: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  disabledOption: {
    opacity: 0.5,
  },
  goalContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  goalIcon: {
    fontSize: 24,
  },
  goalText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  selectedText: {
    color: '#fff',
  },
  disabledText: {
    color: '#666',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  progressFill: {
    width: '53.28%',
    height: '100%',
    backgroundColor: '#000',
    borderRadius: 2,
  },
}); 