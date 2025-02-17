import { View, StyleSheet } from 'react-native';
import { theme } from '@/constants/theme';

interface OnboardingProgressProps {
  step: number;
  totalSteps: number;
}

export function OnboardingProgress({ step, totalSteps }: OnboardingProgressProps) {
  const progress = (step / totalSteps) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.track}>
        <View style={[styles.progress, { width: `${progress}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
  },
  track: {
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
  },
  progress: {
    height: '100%',
    backgroundColor: '#000',
    borderRadius: 2,
  },
}); 