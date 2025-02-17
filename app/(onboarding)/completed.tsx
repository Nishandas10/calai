import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import Animated, { FadeIn } from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CIRCLE_SIZE = (SCREEN_WIDTH - 100) / 2; // Slightly smaller circles
const CIRCLE_RADIUS = (CIRCLE_SIZE - 32) / 2; // Adjusted radius
const CIRCLE_LENGTH = 2 * Math.PI * CIRCLE_RADIUS;

export default function CompletedScreen() {
  const macros = [
    { label: 'Calories', value: '1934', color: '#000000', unit: '' },
    { label: 'Carbs', value: '190', color: '#FFA726', unit: 'g' },
    { label: 'Protein', value: '172', color: '#EF5350', unit: 'g' },
    { label: 'Fats', value: '53', color: '#42A5F5', unit: 'g' },
  ];

  const renderProgressCircle = (progress: number, color: string) => (
    <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE}>
      {/* Background circle */}
      <Circle
        cx={CIRCLE_SIZE / 2}
        cy={CIRCLE_SIZE / 2}
        r={CIRCLE_RADIUS}
        stroke="#E8E8E8"
        strokeWidth={8}
        fill="none"
      />
      {/* Progress circle */}
      <Circle
        cx={CIRCLE_SIZE / 2}
        cy={CIRCLE_SIZE / 2}
        r={CIRCLE_RADIUS}
        stroke={color}
        strokeWidth={8}
        strokeDasharray={CIRCLE_LENGTH}
        strokeDashoffset={CIRCLE_LENGTH * (1 - progress)}
        strokeLinecap="round"
        fill="none"
        transform={`rotate(-90 ${CIRCLE_SIZE / 2} ${CIRCLE_SIZE / 2})`}
      />
    </Svg>
  );

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

          <View style={styles.targetSection}>
            <Text style={styles.targetLabel}>You should Lose:</Text>
            <Text style={styles.targetValue}>17.0 kg by July 01</Text>
          </View>

          <View style={styles.recommendationCard}>
            <View style={styles.recommendationHeader}>
              <Text style={styles.recommendationTitle}>Daily Recommendation</Text>
              <Text style={styles.recommendationSubtitle}>You can edit this any time</Text>
            </View>

            <View style={styles.macrosGrid}>
              {macros.map((macro, index) => (
                <View key={index} style={styles.macroItem}>
                  <Text style={styles.macroLabel}>{macro.label}</Text>
                  <View style={styles.macroCircle}>
                    {renderProgressCircle(0.75, macro.color)}
                    <View style={styles.macroValueContainer}>
                      <Text style={styles.macroValue}>{macro.value}{macro.unit}</Text>
                      <TouchableOpacity style={styles.editButton}>
                        <Ionicons name="pencil" size={14} color="#666" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.healthScore}>
              <View style={styles.healthScoreLeft}>
                <Ionicons name="heart-half" size={20} color="#EF5350" />
                <Text style={styles.healthScoreLabel}>Health score</Text>
              </View>
              <Text style={styles.healthScoreValue}>7/10</Text>
            </View>
          </View>
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
    marginBottom: 20,
  },
  recommendationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  recommendationSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  macrosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  macroItem: {
    width: '48%',
    marginBottom: 12,
  },
  macroLabel: {
    fontSize: 16,
    color: '#000',
    marginBottom: 6,
  },
  macroCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
  },
  macroValueContainer: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  macroValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  editButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
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
}); 