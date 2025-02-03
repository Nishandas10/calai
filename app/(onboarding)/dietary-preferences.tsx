import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useOnboarding } from '@/context/onboarding';

const DIETARY_PREFERENCES = ['Vegetarian', 'Vegan', 'Gluten-free', 'Dairy-free'] as const;
const DIET_STYLES = ['Keto', 'Low-carb', 'Mediterranean', 'None'] as const;

export default function DietaryPreferencesScreen() {
  const { data, setDietaryPreferences } = useOnboarding();
  const [selectedPreferences, setSelectedPreferences] = useState<Set<typeof DIETARY_PREFERENCES[number]>>(
    new Set(data.dietaryPreferences)
  );
  const [selectedStyle, setSelectedStyle] = useState<typeof DIET_STYLES[number]>(
    data.dietStyle || 'None'
  );

  const togglePreference = (preference: typeof DIETARY_PREFERENCES[number]) => {
    setSelectedPreferences(prev => {
      const newSet = new Set(prev);
      if (newSet.has(preference)) {
        newSet.delete(preference);
      } else {
        newSet.add(preference);
      }
      return newSet;
    });
  };

  const handleNext = () => {
    setDietaryPreferences(Array.from(selectedPreferences), selectedStyle);
    router.push('/(onboarding)/macro-goals');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Dietary Preferences</Text>

        <Text style={styles.sectionTitle}>Restrictions</Text>
        <View style={styles.preferencesContainer}>
          {DIETARY_PREFERENCES.map((preference) => (
            <TouchableOpacity
              key={preference}
              style={[
                styles.preferenceButton,
                selectedPreferences.has(preference) && styles.preferenceButtonSelected,
              ]}
              onPress={() => togglePreference(preference)}
            >
              <Text
                style={[
                  styles.preferenceButtonText,
                  selectedPreferences.has(preference) && styles.preferenceButtonTextSelected,
                ]}
              >
                {preference}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Diet Style</Text>
        <View style={styles.dietStylesContainer}>
          {DIET_STYLES.map((style) => (
            <TouchableOpacity
              key={style}
              style={[
                styles.dietStyleButton,
                selectedStyle === style && styles.dietStyleButtonSelected,
              ]}
              onPress={() => setSelectedStyle(style)}
            >
              <Text
                style={[
                  styles.dietStyleButtonText,
                  selectedStyle === style && styles.dietStyleButtonTextSelected,
                ]}
              >
                {style}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  preferencesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 30,
  },
  preferenceButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    minWidth: '45%',
    alignItems: 'center',
  },
  preferenceButtonSelected: {
    backgroundColor: '#2f95dc',
    borderColor: '#2f95dc',
  },
  preferenceButtonText: {
    fontSize: 16,
    color: '#333',
  },
  preferenceButtonTextSelected: {
    color: '#fff',
  },
  dietStylesContainer: {
    gap: 10,
    marginBottom: 30,
  },
  dietStyleButton: {
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  dietStyleButtonSelected: {
    backgroundColor: '#2f95dc',
    borderColor: '#2f95dc',
  },
  dietStyleButtonText: {
    fontSize: 16,
    color: '#333',
  },
  dietStyleButtonTextSelected: {
    color: '#fff',
  },
  nextButton: {
    backgroundColor: '#2f95dc',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 