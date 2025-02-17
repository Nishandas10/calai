import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function WeeklyPaceInfoScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>

        <OnboardingProgress step={6} totalSteps={8} />
      </View>

      <View style={styles.contentWrapper}>
        <Animated.View 
          entering={FadeIn.delay(300)}
          style={styles.content}
        >
          <View style={styles.targetIcon}>
            <Text style={styles.iconText}>🎯</Text>
          </View>

          <Text style={styles.title}>Losing</Text>
          <Text style={styles.highlightedText}>0.4 kg per week</Text>
          <Text style={styles.subtitle}>is a realistic target.</Text>
          <Text style={styles.subtitle}>It's not hard at all!</Text>

          <Text style={styles.description}>
            95% of our users say that the change is obvious after using AI Calorie Counter and it is not easy to rebound.
          </Text>
        </Animated.View>
      </View>

      <TouchableOpacity
        style={styles.nextButton}
        onPress={() => router.push('/(onboarding)/benefits')}
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
  contentWrapper: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  content: {
    alignItems: 'center',
  },
  targetIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  iconText: {
    fontSize: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  highlightedText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 24,
    color: '#000',
    marginBottom: 4,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 40,
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  nextButton: {
    backgroundColor: '#000',
    marginHorizontal: 20,
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