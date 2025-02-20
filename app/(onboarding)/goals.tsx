import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useOnboarding } from '@/context/onboarding';
import { OnboardingHeader } from '@/components/onboarding/OnboardingHeader';
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';
import { OnboardingButton } from '@/components/onboarding/OnboardingButton';
import { Ionicons } from '@expo/vector-icons';

type GoalId = 'lose_weight' | 'gain_muscle' | 'maintain' | 'boost_energy' | 'improve_nutrition' | 'gain_weight';

interface Goal {
  id: GoalId;
  title: string;
  icon: string;
  priority: Record<GoalId, number>;
}

const GOALS: readonly Goal[] = [
  {
    id: 'lose_weight',
    title: 'Lose Weight',
    icon: '🔥',
    priority: {
      lose_weight: 5,
      gain_muscle: 2,
      maintain: 2,
      boost_energy: 2,
      improve_nutrition: 3,
      gain_weight: 0,
    },
  },
  {
    id: 'gain_muscle',
    title: 'Gain Muscle',
    icon: '💪',
    priority: {
      lose_weight: 2,
      gain_muscle: 5,
      maintain: 3,
      boost_energy: 4,
      improve_nutrition: 4,
      gain_weight: 3,
    },
  },
  {
    id: 'maintain',
    title: 'Maintain Weight',
    icon: '⚖️',
    priority: {
      lose_weight: 2,
      gain_muscle: 3,
      maintain: 5,
      boost_energy: 3,
      improve_nutrition: 4,
      gain_weight: 2,
    },
  },
  {
    id: 'boost_energy',
    title: 'Boost Energy',
    icon: '⚡',
    priority: {
      lose_weight: 3,
      gain_muscle: 4,
      maintain: 3,
      boost_energy: 5,
      improve_nutrition: 5,
      gain_weight: 2,
    },
  },
  {
    id: 'improve_nutrition',
    title: 'Improve Nutrition',
    icon: '🥗',
    priority: {
      lose_weight: 4,
      gain_muscle: 4,
      maintain: 4,
      boost_energy: 5,
      improve_nutrition: 5,
      gain_weight: 3,
    },
  },
  {
    id: 'gain_weight',
    title: 'Gain Weight',
    icon: '🎯',
    priority: {
      lose_weight: 0,
      gain_muscle: 3,
      maintain: 2,
      boost_energy: 2,
      improve_nutrition: 3,
      gain_weight: 5,
    },
  },
] as const;

// Create a lookup map for easier access to goals by their id
const goalsMap = GOALS.reduce((acc, goal) => {
  acc[goal.id] = goal;
  return acc;
}, {} as Record<GoalId, Goal>);

/**
 * Determines the primary goal based on normalized pairwise scoring.
 *
 * For each selected goal:
 *  - Compute rawScore: the sum of its priority values for the other selected goals.
 *  - Compute maxPossible: the sum of its priority values for all other goals (excluding itself).
 *  - Compute normalizedScore = rawScore / maxPossible.
 * The goal with the highest normalized score is selected as the primary goal.
 *
 * @param selectedGoalIds An array of selected goal IDs.
 * @returns The goal id that is determined to be the primary goal.
 */
function determinePrimaryGoalNormalized(selectedGoalIds: GoalId[]): GoalId {
  if (selectedGoalIds.length === 0) {
    throw new Error('At least one goal must be selected.');
  }

  let primaryGoal: GoalId = selectedGoalIds[0];
  let highestNormalizedScore = -Infinity;

  for (const goalId of selectedGoalIds) {
    const goal = goalsMap[goalId];

    // Raw score: sum the priority values for each of the other selected goals
    const rawScore = selectedGoalIds
      .filter((otherId) => otherId !== goalId)
      .reduce((sum, otherId) => sum + goal.priority[otherId], 0);

    // Maximum possible score: sum the priority values for all other possible goals (excluding itself)
    const maxPossible = (Object.keys(goal.priority) as GoalId[])
      .filter((otherId) => otherId !== goalId)
      .reduce((sum, otherId) => sum + goal.priority[otherId], 0);

    const normalizedScore = maxPossible ? rawScore / maxPossible : 0;
    console.log(`Goal: ${goalId}, Raw Score: ${rawScore}, Max Possible: ${maxPossible}, Normalized: ${normalizedScore.toFixed(3)}`);

    if (normalizedScore > highestNormalizedScore) {
      highestNormalizedScore = normalizedScore;
      primaryGoal = goalId;
    }
  }

  return primaryGoal;
}

export default function GoalsScreen() {
  const { setGoals } = useOnboarding();
  const [selectedGoals, setSelectedGoals] = useState<GoalId[]>([]);

  const logPriorityScores = (goals: GoalId[]) => {
    if (goals.length === 0) {
      console.log('No goals selected');
      return;
    }

    console.log('\n=== Priority Scores ===');
    console.log('Selected Goals:', goals.join(', '));

    goals.forEach(goalId => {
      const goal = goalsMap[goalId];
      console.log(`\n${goal.title} priorities:`);
      Object.entries(goal.priority)
        .filter(([id]) => goals.includes(id as GoalId))
        .forEach(([id, score]) => {
          console.log(`  → ${goalsMap[id as GoalId].title}: ${score}`);
        });
    });

    if (goals.length > 1) {
      const primaryGoal = determinePrimaryGoalNormalized(goals);
      console.log('\nPrimary Goal:', goalsMap[primaryGoal].title);
    }
    console.log('==================\n');
  };

  const toggleGoal = (goalId: GoalId) => {
    setSelectedGoals(prev => {
      let newGoals: GoalId[];
      if (prev.includes(goalId)) {
        newGoals = prev.filter(id => id !== goalId);
      } else {
        // Allow up to 3 goals
        if (prev.length >= 3) {
          return prev;
        }
        newGoals = [...prev, goalId];
      }
      
      // Log priority scores after state update
      logPriorityScores(newGoals);
      return newGoals;
    });
  };

  const handleNext = () => {
    if (selectedGoals.length > 0) {
      // Calculate normalized scores for all selected goals
      const goalScores = selectedGoals.map(goalId => {
        const goal = goalsMap[goalId];
        const rawScore = selectedGoals
          .filter((otherId) => otherId !== goalId)
          .reduce((sum, otherId) => sum + goal.priority[otherId], 0);

        const maxPossible = (Object.keys(goal.priority) as GoalId[])
          .filter((otherId) => otherId !== goalId)
          .reduce((sum, otherId) => sum + goal.priority[otherId], 0);

        const normalizedScore = maxPossible ? rawScore / maxPossible : 0;
        
        return {
          id: goalId,
          title: goalsMap[goalId].title,
          rawScore,
          maxPossible,
          normalizedScore
        };
      });

      // Sort goals by normalized score in descending order
      goalScores.sort((a, b) => b.normalizedScore - a.normalizedScore);

      // Format goals string with scores
      const goalsString = goalScores
        .map(g => `${g.title} (${(g.normalizedScore * 100).toFixed(1)}%)`)
        .join(' , ');

      console.log('Goals with scores:', goalScores);
      
      // Use the formatted string as the goal
      setGoals(goalsString as any, null, 0);
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