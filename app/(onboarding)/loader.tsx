import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useOnboarding } from '@/context/onboarding';
import Animated, { 
  useAnimatedProps, 
  useSharedValue, 
  withTiming, 
  Easing,
  FadeIn,
  runOnJS
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CIRCLE_LENGTH = 600; // Increased circle size
const CIRCLE_RADIUS = CIRCLE_LENGTH / (2 * Math.PI);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function LoaderScreen() {
  const progress = useSharedValue(0);
  const [percentage, setPercentage] = useState(0);
  const { saveOnboardingData } = useOnboarding();
  const [error, setError] = useState<string | null>(null);

  const updatePercentage = (value: number) => {
    setPercentage(Math.floor(value * 100));
  };

  const saveAndNavigate = async () => {
    try {
      // Start progress animation
      progress.value = withTiming(1, {
        duration: 2000,
        easing: Easing.linear,
      });

      // Save onboarding data
      await saveOnboardingData();
      
      // Wait for animation to complete then navigate
      setTimeout(() => {
        router.replace('/(onboarding)/completed');
      }, 2000);
    } catch (error: any) {
      console.error('Failed to save onboarding data:', error);
      setError(error?.message || 'Failed to save your data. Please try again.');
    }
  };

  useEffect(() => {
    saveAndNavigate();
  }, []);

  const animatedProps = useAnimatedProps(() => {
    runOnJS(updatePercentage)(progress.value);
    return {
      strokeDashoffset: CIRCLE_LENGTH * (1 - progress.value),
    };
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <Animated.View 
        entering={FadeIn}
        style={styles.content}
      >
        <Text style={styles.title}>Personalizing your CalAI experience...</Text>

        <View style={styles.loaderContainer}>
          <Svg style={styles.svg} width={SCREEN_WIDTH} height={SCREEN_WIDTH}>
            {/* Background circle */}
            <Circle
              cx={SCREEN_WIDTH / 2}
              cy={SCREEN_WIDTH / 2}
              r={CIRCLE_RADIUS}
              stroke="#E8E8E8"
              strokeWidth={16}
              fill="none"
            />
            {/* Animated progress circle */}
            <AnimatedCircle
              cx={SCREEN_WIDTH / 2}
              cy={SCREEN_WIDTH / 2}
              r={CIRCLE_RADIUS}
              stroke="#000"
              strokeWidth={16}
              strokeDasharray={CIRCLE_LENGTH}
              animatedProps={animatedProps}
              strokeLinecap="round"
              fill="none"
            />
          </Svg>
          <Text style={styles.progressText}>
            {`${percentage}%`}
          </Text>
        </View>

        <Text style={styles.subtitle}>
          {error || "Hang tight! We're crafting a personalized plan just for you."}
        </Text>

        {error && (
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setError(null);
              progress.value = 0;
              saveAndNavigate();
            }}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        )}
      </Animated.View>
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
    marginBottom: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 60,
  },
  loaderContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    position: 'absolute',
    transform: [{ rotateZ: '-90deg' }],
  },
  progressText: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#000',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 60,
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#000',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 