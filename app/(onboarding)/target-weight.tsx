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
const MIN_WEIGHT = 40;
const MAX_WEIGHT = 200;
const MARK_COUNT = 81; // One mark every 2kg
const DEFAULT_WEIGHT = 70;

export default function TargetWeightScreen() {
  const { setGoals } = useOnboarding();
  const [selectedWeight, setSelectedWeight] = useState(DEFAULT_WEIGHT);
  const [unit, setUnit] = useState<'kg' | 'lb'>('kg');

  // Animated values
  const translateX = useSharedValue(
    ((DEFAULT_WEIGHT - MIN_WEIGHT) / (MAX_WEIGHT - MIN_WEIGHT)) * SLIDER_WIDTH
  );

  const updateWeight = (x: number) => {
    const newWeight = Math.round(
      MIN_WEIGHT + (x / SLIDER_WIDTH) * (MAX_WEIGHT - MIN_WEIGHT)
    );
    if (newWeight >= MIN_WEIGHT && newWeight <= MAX_WEIGHT) {
      setSelectedWeight(newWeight);
    }
  };

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx: any) => {
      ctx.startX = translateX.value;
    },
    onActive: (event, ctx) => {
      const newX = ctx.startX + event.translationX;
      translateX.value = Math.max(0, Math.min(newX, SLIDER_WIDTH));
      runOnJS(updateWeight)(translateX.value);
    },
  });

  const rStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const formatWeight = (weight: number) => {
    if (unit === 'kg') return `${weight}`;
    
    const pounds = Math.round(weight * 2.20462);
    return `${pounds}`;
  };

  const getUnitLabel = () => {
    return unit === 'kg' ? ' kg' : ' lb';
  };

  const handleNext = () => {
    setGoals('Lose weight', selectedWeight, 0.5);
    router.push('/(onboarding)/comparison');
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

        <Text style={styles.title}>What's your target weight?</Text>
        <View style={styles.progressBar}>
          <View style={styles.progressFill} />
        </View>
      </View>

      <View style={styles.contentWrapper}>
        <View style={styles.content}>
          <View style={styles.unitSelector}>
            <TouchableOpacity
              style={[styles.unitButton, unit === 'kg' && styles.selectedUnit]}
              onPress={() => setUnit('kg')}
            >
              <Text style={[styles.unitText, unit === 'kg' && styles.selectedUnitText]}>kg</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.unitButton, unit === 'lb' && styles.selectedUnit]}
              onPress={() => setUnit('lb')}
            >
              <Text style={[styles.unitText, unit === 'lb' && styles.selectedUnitText]}>lb</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.weightDisplay}>
            <Text style={styles.weightValue}>
              {formatWeight(selectedWeight)}
              <Text style={styles.unitLabel}>{getUnitLabel()}</Text>
            </Text>
          </View>

          <View style={styles.sliderContainer}>
            <View style={styles.marksContainer}>
              {Array.from({ length: MARK_COUNT }, (_, i) => (
                <View
                  key={i}
                  style={[
                    styles.mark,
                    i % 5 === 0 && styles.majorMark,
                  ]}
                />
              ))}
            </View>

            <PanGestureHandler 
              onGestureEvent={gestureHandler}
              hitSlop={{ top: 30, bottom: 30, left: 50, right: 50 }}
            >
              <Animated.View style={[styles.sliderTouchArea, rStyle]}>
                <View style={styles.indicator}>
                  <View style={styles.indicatorLine} />
                  <View style={styles.triangle} />
                </View>
              </Animated.View>
            </PanGestureHandler>
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
    fontSize: 28,
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
    width: '50%',
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
  unitSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 40,
  },
  unitButton: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  selectedUnit: {
    backgroundColor: '#000',
  },
  unitText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  selectedUnitText: {
    color: '#fff',
  },
  weightDisplay: {
    alignItems: 'center',
    marginBottom: 40,
  },
  weightValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#000',
  },
  unitLabel: {
    fontSize: 32,
    color: '#666',
  },
  sliderContainer: {
    height: 150,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  marksContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 40,
  },
  mark: {
    width: 1,
    height: 10,
    backgroundColor: '#E0E0E0',
  },
  majorMark: {
    height: 20,
    width: 2,
    backgroundColor: '#BDBDBD',
  },
  sliderTouchArea: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 60,
    marginLeft: -30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicator: {
    alignItems: 'center',
  },
  indicatorLine: {
    width: 2,
    height: 40,
    backgroundColor: '#000',
  },
  triangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#000',
    transform: [{ rotate: '180deg' }],
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