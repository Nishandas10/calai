import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { Button } from '@/components/ui/button';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Svg, { Path, Circle, Defs, LinearGradient, Stop, Text as SvgText } from 'react-native-svg';

const { width } = Dimensions.get('window');
const GRAPH_WIDTH = width - 80;
const GRAPH_HEIGHT = 200;

// Path data for the curves
const withoutAIPath = `
  M 0 ${GRAPH_HEIGHT}
  C 50 ${GRAPH_HEIGHT * 0.9} 100 ${GRAPH_HEIGHT * 0.85} 150 ${GRAPH_HEIGHT * 0.8}
  S 250 ${GRAPH_HEIGHT * 0.75} ${GRAPH_WIDTH} ${GRAPH_HEIGHT * 0.7}
`;

const withAIPath = `
  M 0 ${GRAPH_HEIGHT}
  C 50 ${GRAPH_HEIGHT * 0.8} 100 ${GRAPH_HEIGHT * 0.6} 150 ${GRAPH_HEIGHT * 0.4}
  S 250 ${GRAPH_HEIGHT * 0.2} ${GRAPH_WIDTH} ${GRAPH_HEIGHT * 0.1}
`;

export default function ComparisonScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.scrollContent}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Lose twice as much weight with Cal AI vs on your own</Text>
          <View style={styles.progressBar}>
            <View style={styles.progressFill} />
          </View>
        </View>

        <Animated.View 
          entering={FadeInDown.delay(300)}
          style={styles.comparisonCard}
        >
          <View style={styles.graphContainer}>
            <View style={styles.legendContainer}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#000' }]} />
                <Text style={styles.legendText}>With Cal AI</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#E0E0E0' }]} />
                <Text style={styles.legendText}>Without Cal AI</Text>
              </View>
            </View>

            <View style={styles.yAxisLabels}>
              <Text style={styles.axisLabel}>Weight Loss</Text>
            </View>

            <Svg width={GRAPH_WIDTH} height={GRAPH_HEIGHT} style={styles.graph}>
              <Defs>
                <LinearGradient id="gradientWithAI" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor="#000" stopOpacity="0.1" />
                  <Stop offset="1" stopColor="#000" stopOpacity="0" />
                </LinearGradient>
                <LinearGradient id="gradientWithoutAI" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor="#E0E0E0" stopOpacity="0.1" />
                  <Stop offset="1" stopColor="#E0E0E0" stopOpacity="0" />
                </LinearGradient>
              </Defs>

              {/* Without AI Path */}
              <Path
                d={withoutAIPath}
                stroke="#E0E0E0"
                strokeWidth={3}
                fill="url(#gradientWithoutAI)"
              />
              <Circle
                cx={GRAPH_WIDTH}
                cy={GRAPH_HEIGHT * 0.7}
                r={6}
                fill="#E0E0E0"
              />
              <SvgText
                x={GRAPH_WIDTH + 10}
                y={GRAPH_HEIGHT * 0.7}
                fill="#666"
                fontSize="12"
              >
                20%
              </SvgText>

              {/* With AI Path */}
              <Path
                d={withAIPath}
                stroke="#000"
                strokeWidth={3}
                fill="url(#gradientWithAI)"
              />
              <Circle
                cx={GRAPH_WIDTH}
                cy={GRAPH_HEIGHT * 0.1}
                r={6}
                fill="#000"
              />
              <SvgText
                x={GRAPH_WIDTH + 10}
                y={GRAPH_HEIGHT * 0.1}
                fill="#000"
                fontSize="12"
                fontWeight="bold"
              >
                2X
              </SvgText>
            </Svg>

            <View style={styles.xAxisLabels}>
              <Text style={styles.axisLabel}>Time</Text>
            </View>
          </View>

          <Text style={styles.description}>
            Cal AI makes it easy and holds you accountable.
          </Text>
        </Animated.View>

        <Button
          onPress={() => router.push('/(onboarding)/goals')}
          style={styles.nextButton}
        >
          <Text style={styles.buttonText}>Next</Text>
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flex: 1,
    padding: 16,
    paddingTop: '15%',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
    lineHeight: 40,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#f0f0f0',
    borderRadius: 2,
  },
  progressFill: {
    width: '30%',
    height: '100%',
    backgroundColor: '#000',
    borderRadius: 2,
  },
  comparisonCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 20,
    padding: 24,
    marginBottom: 'auto',
    marginTop: 20,
  },
  graphContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 14,
    color: '#666',
  },
  graph: {
    marginVertical: 10,
  },
  yAxisLabels: {
    position: 'absolute',
    left: -40,
    top: '50%',
    transform: [{ rotate: '-90deg' }],
  },
  xAxisLabels: {
    alignItems: 'center',
    marginTop: 8,
  },
  axisLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: '#000',
    paddingVertical: 14,
    borderRadius: 25,
    marginTop: 'auto',
    alignItems: 'center',
  },
}); 