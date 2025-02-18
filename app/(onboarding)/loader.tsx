import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
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

  const updatePercentage = (value: number) => {
    setPercentage(Math.floor(value * 100));
  };

  useEffect(() => {
    progress.value = withTiming(1, {
      duration: 4000,
      easing: Easing.linear,
    });

    // Navigate to completed screen after animation
    const timer = setTimeout(() => {
      router.push('/(onboarding)/completed');
    }, 4000);

    return () => clearTimeout(timer);
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
          Hang tight! We're crafting a personalized plan just for you.
        </Text>
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
  progressFill: {
    width: '93.24%',
    height: '100%',
    backgroundColor: '#000',
    borderRadius: 2,
  },
}); 