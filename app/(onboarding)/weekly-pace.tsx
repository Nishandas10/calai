import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { useOnboarding } from '@/context/onboarding';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SLIDER_WIDTH = SCREEN_WIDTH - 40;
const MIN_PACE = 0.1;
const MAX_PACE = 1.5;
const DEFAULT_PACE = 0.8;

export default function WeeklyPaceScreen() {
  const { setGoals } = useOnboarding();
  const [selectedPace, setSelectedPace] = useState(DEFAULT_PACE);

  // Animated values
  const translateX = useSharedValue(
    ((DEFAULT_PACE - MIN_PACE) / (MAX_PACE - MIN_PACE)) * SLIDER_WIDTH
  );

  const updatePace = (x: number) => {
    const newPace = MIN_PACE + (x / SLIDER_WIDTH) * (MAX_PACE - MIN_PACE);
    const roundedPace = Math.round(newPace * 10) / 10; // Round to 1 decimal
    if (roundedPace >= MIN_PACE && roundedPace <= MAX_PACE) {
      setSelectedPace(roundedPace);
    }
  };

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx: any) => {
      ctx.startX = translateX.value;
    },
    onActive: (event, ctx) => {
      const newX = ctx.startX + event.translationX;
      translateX.value = Math.max(0, Math.min(newX, SLIDER_WIDTH));
      runOnJS(updatePace)(translateX.value);
    },
  });

  const rStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const handleNext = () => {
    setGoals('Lose weight', null, selectedPace);
    router.push('/(onboarding)/weekly-pace-info');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>

        <Text style={styles.title}>How fast do you want to reach your goal?</Text>
        <View style={styles.progressBar}>
          <View style={styles.progressFill} />
        </View>
      </View>

      <View style={styles.contentWrapper}>
        <View style={styles.content}>
          <Text style={styles.subtitle}>Loose Weight speed per week</Text>
          
          <View style={styles.paceDisplay}>
            <Text style={styles.paceValue}>
              {selectedPace.toFixed(1)}
              <Text style={styles.unitLabel}> kg</Text>
            </Text>
          </View>

          <View style={styles.sliderContainer}>
            <View style={styles.animalIcons}>
              <Text style={styles.animalIcon}>🧍</Text>
              <Text style={styles.animalIcon}>🚶</Text>
              <Text style={styles.animalIcon}>🏃</Text>
            </View>

            <View style={styles.sliderTrack}>
              <PanGestureHandler onGestureEvent={gestureHandler}>
                <Animated.View style={[styles.sliderThumb, rStyle]} />
              </PanGestureHandler>
            </View>

            <View style={styles.paceLabels}>
              <Text style={styles.paceLabel}>0.1 kg</Text>
              <Text style={styles.paceLabel}>0.8 kg</Text>
              <Text style={styles.paceLabel}>1.5 kg</Text>
            </View>

            {selectedPace >= 0.8 && selectedPace <= 1 && (
              <View style={styles.recommendedBadge}>
                <Text style={styles.recommendedText}>Recommended</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#f0f0f0',
    borderRadius: 2,
  },
  progressFill: {
    width: '66.6%',
    height: '100%',
    backgroundColor: '#000',
    borderRadius: 2,
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 40,
  },
  content: {
    paddingHorizontal: 20,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  paceDisplay: {
    alignItems: 'center',
    marginBottom: 40,
  },
  paceValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#000',
  },
  unitLabel: {
    fontSize: 32,
    color: '#666',
  },
  sliderContainer: {
    marginBottom: 24,
  },
  animalIcons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  animalIcon: {
    fontSize: 32,
  },
  sliderTrack: {
    height: 4,
    backgroundColor: '#f0f0f0',
    borderRadius: 2,
    marginBottom: 12,
  },
  sliderThumb: {
    position: 'absolute',
    top: -8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#000',
  },
  paceLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  paceLabel: {
    fontSize: 14,
    color: '#666',
  },
  recommendedBadge: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignSelf: 'center',
  },
  recommendedText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  nextButton: {
    backgroundColor: '#000',
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 