import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useOnboarding } from '@/context/onboarding';
import { Button } from '@/components/ui/button';
import { Ionicons } from '@expo/vector-icons';

export default function GenderScreen() {
  const { data, setGender } = useOnboarding();
  const [selected, setSelected] = useState<'male' | 'female' | 'prefer_not_to_say' | null>(null);

  const handleNext = () => {
    if (selected) {
      setGender(selected);
      router.push('/(onboarding)/activity');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.scrollContent}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>What's your gender?</Text>
          <View style={styles.progressBar}>
            <View style={styles.progressFill} />
          </View>
        </View>

        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={[
              styles.genderOption,
              selected === 'male' && styles.selectedOption
            ]}
            onPress={() => setSelected('male')}
          >
            <View style={[
              styles.iconContainer,
              selected === 'male' && styles.selectedIconContainer
            ]}>
              <Ionicons 
                name="male" 
                size={32} 
                color={selected === 'male' ? '#000' : '#666'} 
              />
            </View>
            <Text style={[
              styles.genderText,
              selected === 'male' && styles.selectedText
            ]}>Male</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.genderOption,
              selected === 'female' && styles.selectedOption
            ]}
            onPress={() => setSelected('female')}
          >
            <View style={[
              styles.iconContainer,
              selected === 'female' && styles.selectedIconContainer
            ]}>
              <Ionicons 
                name="female" 
                size={32} 
                color={selected === 'female' ? '#000' : '#666'} 
              />
            </View>
            <Text style={[
              styles.genderText,
              selected === 'female' && styles.selectedText
            ]}>Female</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.genderOption,
              selected === 'prefer_not_to_say' && styles.selectedOption
            ]}
            onPress={() => setSelected('prefer_not_to_say')}
          >
            <Text style={[
              styles.genderText,
              selected === 'prefer_not_to_say' && styles.selectedText
            ]}>Prefer not to say</Text>
          </TouchableOpacity>
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
    width: '13.32%',
    height: '100%',
    backgroundColor: '#000',
    borderRadius: 2,
  },
  optionsContainer: {
    gap: 16,
    marginBottom: 'auto',
  },
  genderOption: {
    flexDirection: 'row',
    alignItems: 'center',
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
    backgroundColor: '#f5f5f5',
  },
  genderText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#000',
  },
  selectedText: {
    color: '#fff',
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