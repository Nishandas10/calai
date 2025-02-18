import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRAPH_WIDTH = SCREEN_WIDTH - 80;
const GRAPH_HEIGHT = 180;

export default function BenefitsScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>

        <OnboardingProgress step={7} totalSteps={8} />
      </View>

      <View style={styles.contentWrapper}>
        <Animated.View 
          entering={FadeIn.delay(300)}
          style={styles.content}
        >
          <Text style={styles.title}>
            Tracking calories creates long-term results
          </Text>

          <View style={styles.graphCard}>
            <Text style={styles.graphTitle}>Your weight progress</Text>

            <Svg width={GRAPH_WIDTH} height={GRAPH_HEIGHT} style={styles.graph}>
              <Defs>
                <LinearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor="#000" stopOpacity="0.08" />
                  <Stop offset="1" stopColor="#000" stopOpacity="0.02" />
                </LinearGradient>
              </Defs>

              {/* Grid lines */}
              <Path
                d={`M 0 ${GRAPH_HEIGHT * 0.25} H ${GRAPH_WIDTH}`}
                stroke="#E0E0E0"
                strokeWidth="1"
                strokeDasharray="5,5"
              />
              <Path
                d={`M 0 ${GRAPH_HEIGHT * 0.5} H ${GRAPH_WIDTH}`}
                stroke="#E0E0E0"
                strokeWidth="1"
                strokeDasharray="5,5"
              />
              <Path
                d={`M 0 ${GRAPH_HEIGHT * 0.75} H ${GRAPH_WIDTH}`}
                stroke="#E0E0E0"
                strokeWidth="1"
                strokeDasharray="5,5"
              />

              {/* Area under curve */}
              <Path
                d={`
                  M 0 ${GRAPH_HEIGHT * 0.2}
                  C ${GRAPH_WIDTH * 0.33} ${GRAPH_HEIGHT * 0.35},
                    ${GRAPH_WIDTH * 0.66} ${GRAPH_HEIGHT * 0.55},
                    ${GRAPH_WIDTH} ${GRAPH_HEIGHT * 0.8}
                  L ${GRAPH_WIDTH} ${GRAPH_HEIGHT}
                  L 0 ${GRAPH_HEIGHT}
                  Z
                `}
                fill="url(#gradient)"
              />

              {/* Curve line */}
              <Path
                d={`
                  M 0 ${GRAPH_HEIGHT * 0.2}
                  C ${GRAPH_WIDTH * 0.33} ${GRAPH_HEIGHT * 0.35},
                    ${GRAPH_WIDTH * 0.66} ${GRAPH_HEIGHT * 0.55},
                    ${GRAPH_WIDTH} ${GRAPH_HEIGHT * 0.8}
                `}
                stroke="#000"
                strokeWidth="2"
                fill="none"
              />

              {/* Data points */}
              <Circle 
                cx="0" 
                cy={GRAPH_HEIGHT * 0.2} 
                r="6" 
                fill="#fff" 
                stroke="#000" 
                strokeWidth="2" 
              />
              <Circle 
                cx={GRAPH_WIDTH * 0.33} 
                cy={GRAPH_HEIGHT * 0.35} 
                r="6" 
                fill="#fff" 
                stroke="#000" 
                strokeWidth="2" 
              />
              <Circle 
                cx={GRAPH_WIDTH * 0.66} 
                cy={GRAPH_HEIGHT * 0.55} 
                r="6" 
                fill="#fff" 
                stroke="#000" 
                strokeWidth="2" 
              />

              {/* Flag at the end */}
              <Circle 
                cx={GRAPH_WIDTH} 
                cy={GRAPH_HEIGHT * 0.8} 
                r="12" 
                fill="#000" 
              />
              <Path
                d={`M ${GRAPH_WIDTH} ${GRAPH_HEIGHT * 0.8} L ${GRAPH_WIDTH} ${GRAPH_HEIGHT * 0.8 - 24}`}
                stroke="#000"
                strokeWidth="2"
              />
            </Svg>

            <View style={styles.timeLabels}>
              <Text style={styles.timeLabel}>3 Days</Text>
              <Text style={styles.timeLabel}>7 Days</Text>
              <Text style={styles.timeLabel}>30 Days</Text>
            </View>

            <Text style={styles.graphDescription}>
              According to user weight loss data, it takes an average of 7 days, you can burn fat like crazy!
            </Text>
          </View>
        </Animated.View>
      </View>

      <TouchableOpacity
        style={styles.nextButton}
        onPress={() => router.push('/(onboarding)/macro-goals')}
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
    width: '100%',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 40,
    lineHeight: 40,
  },
  graphCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  graphTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 24,
    alignSelf: 'flex-start',
  },
  graph: {
    marginBottom: 16,
  },
  timeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  timeLabel: {
    fontSize: 14,
    color: '#666',
  },
  graphDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
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
  progressFill: {
    width: '79.92%',
    height: '100%',
    backgroundColor: '#000',
    borderRadius: 2,
  },
}); 