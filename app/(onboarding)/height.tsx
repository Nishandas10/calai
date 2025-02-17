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
const MIN_HEIGHT = 100;
const MAX_HEIGHT = 250;
const MARK_COUNT = 76; // One mark every 2cm
const DEFAULT_HEIGHT = 175;

export default function HeightScreen() {
  const { setHeight } = useOnboarding();
  const [selectedHeight, setSelectedHeight] = useState(DEFAULT_HEIGHT);
  const [unit, setUnit] = useState<'cm' | 'ft'>('cm');

  // Animated values
  const translateX = useSharedValue(
    ((DEFAULT_HEIGHT - MIN_HEIGHT) / (MAX_HEIGHT - MIN_HEIGHT)) * SLIDER_WIDTH
  );

  const updateHeight = (x: number) => {
    const newHeight = Math.round(
      MIN_HEIGHT + (x / SLIDER_WIDTH) * (MAX_HEIGHT - MIN_HEIGHT)
    );
    if (newHeight >= MIN_HEIGHT && newHeight <= MAX_HEIGHT) {
      setSelectedHeight(newHeight);
    }
  };

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx: any) => {
      ctx.startX = translateX.value;
    },
    onActive: (event, ctx) => {
      const newX = ctx.startX + event.translationX;
      translateX.value = Math.max(0, Math.min(newX, SLIDER_WIDTH));
      runOnJS(updateHeight)(translateX.value);
    },
  });

  const rStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const formatHeight = (height: number) => {
    if (unit === 'cm') return `${height}`;
    
    const totalInches = height / 2.54;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    
    if (inches === 12) {
      return `${feet + 1}'0"`;
    }
    return `${feet}'${inches}"`;
  };

  const handleNext = () => {
    setHeight(selectedHeight);
    router.push('/(onboarding)/comparison');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>

      <View style={styles.progressBar}>
        <View style={styles.progressFill} />
      </View>

      <Text style={styles.title}>Choose your height?</Text>

      <View style={styles.unitSelector}>
        <TouchableOpacity
          style={[styles.unitButton, unit === 'cm' && styles.selectedUnit]}
          onPress={() => setUnit('cm')}
        >
          <Text style={[styles.unitText, unit === 'cm' && styles.selectedUnitText]}>cm</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.unitButton, unit === 'ft' && styles.selectedUnit]}
          onPress={() => setUnit('ft')}
        >
          <Text style={[styles.unitText, unit === 'ft' && styles.selectedUnitText]}>ft</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.heightDisplay}>
        <Text style={styles.heightValue}>{formatHeight(selectedHeight)}</Text>
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

      <TouchableOpacity
        style={styles.nextButton}
        onPress={handleNext}
      >
        <Text style={styles.nextButtonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#f0f0f0',
    borderRadius: 2,
    marginTop: 20,
  },
  progressFill: {
    width: '40%',
    height: '100%',
    backgroundColor: '#000',
    borderRadius: 2,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 40,
    marginBottom: 20,
  },
  unitSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 20,
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
  heightDisplay: {
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 40,
  },
  heightValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#000',
  },
  sliderContainer: {
    marginBottom: 'auto',
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
  nextButton: {
    backgroundColor: '#000',
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 