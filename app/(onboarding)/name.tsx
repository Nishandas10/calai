import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useOnboarding } from '@/context/onboarding';
import { Button } from '@/components/ui/button';
import { Ionicons } from '@expo/vector-icons';

export default function NameScreen() {
  const { data, setName } = useOnboarding();
  const [value, setValue] = useState('');

  const handleNext = () => {
    if (value.trim()) {
      setName(value.trim());
      router.push('/(onboarding)/gender');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.scrollContent}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.push('/(auth)/sign-in')}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>What's your name?</Text>
          <View style={styles.progressBar}>
            <View style={styles.progressFill} />
          </View>
        </View>
        
        <View style={styles.content}>
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={setValue}
            placeholder="Name"
            placeholderTextColor="#999"
            autoFocus
            autoCorrect={false}
            autoCapitalize="words"
          />
        </View>

        <Button
          onPress={handleNext}
          style={[
            styles.nextButton,
            !value.trim() && styles.nextButtonDisabled
          ]}
          disabled={!value.trim()}
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
    width: '6.66%',
    height: '100%',
    backgroundColor: '#000',
    borderRadius: 2,
  },
  content: {
    marginBottom: 'auto',
  },
  input: {
    fontSize: 24,
    fontWeight: '500',
    color: '#000',
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  buttonText: {
    color: 'white',
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
    backgroundColor: '#000000',
  },
}); 