import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useOnboarding } from '@/context/onboarding';
import { Button } from '@/components/ui/button';
import { Ionicons } from '@expo/vector-icons';

const ACTIVITY_LEVELS = [
  {
    id: 'not_active',
    title: 'Not active',
    description: 'I rarely exercise',
    icon: 'walk-outline',
    level: 1,
  },
  {
    id: 'lightly_active',
    title: 'Lightly active',
    description: '1 or 2 times a week',
    icon: 'bicycle-outline',
    level: 2,
  },
  {
    id: 'moderately_active',
    title: 'Moderately active',
    description: '2 to 4 times a week',
    icon: 'barbell-outline',
    level: 3,
  },
  {
    id: 'very_active',
    title: 'Very active',
    description: 'more than 4 times a week',
    icon: 'fitness-outline',
    level: 4,
  },
  {
    id: 'super_active',
    title: 'Super active',
    description: 'all day everyday 💪',
    icon: 'trophy-outline',
    level: 5,
  },
];

export default function ActivityScreen() {
  const { data, setActivityLevel } = useOnboarding();
  const [selected, setSelected] = useState<string | null>(null);

  const handleNext = () => {
    if (selected) {
      const selectedLevel = ACTIVITY_LEVELS.find(level => level.id === selected);
      if (selectedLevel) {
        setActivityLevel(selectedLevel.level);
        router.push('/(onboarding)/comparison');
      }
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>How active are you?</Text>
        <View style={styles.progressBar}>
          <View style={styles.progressFill} />
        </View>
      </View>

      <View style={styles.optionsContainer}>
        {ACTIVITY_LEVELS.map((level) => (
          <TouchableOpacity
            key={level.id}
            style={[
              styles.activityOption,
              selected === level.id && styles.selectedOption
            ]}
            onPress={() => setSelected(level.id)}
          >
            <View style={styles.optionContent}>
              <View style={[
                styles.iconContainer,
                selected === level.id && styles.selectedIconContainer
              ]}>
                <Ionicons 
                  name={level.icon as any}
                  size={28} 
                  color={selected === level.id ? '#fff' : '#666'} 
                />
              </View>
              <View style={styles.textContainer}>
                <Text style={[
                  styles.optionTitle,
                  selected === level.id && styles.selectedText
                ]}>{level.title}</Text>
                <Text style={[
                  styles.optionDescription,
                  selected === level.id && styles.selectedDescription
                ]}>{level.description}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <Button
        onPress={handleNext}
        style={[
          styles.nextButton,
          !selected && styles.nextButtonDisabled
        ]}
        disabled={!selected}
      >
        <Text style={styles.buttonText}>Next</Text>
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
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
    width: '40%',
    height: '100%',
    backgroundColor: '#000',
    borderRadius: 2,
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 32,
  },
  activityOption: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedOption: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  selectedIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  textContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
  },
  selectedText: {
    color: '#fff',
  },
  selectedDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
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
  nextButtonDisabled: {
    backgroundColor: '#999',
  },
}); 