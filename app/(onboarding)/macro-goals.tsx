import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { useOnboarding } from '@/context/onboarding';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth';
import { UserModel } from '@/lib/models/user';
import { Ionicons } from '@expo/vector-icons';

const MACRO_PRESETS = [
  {
    name: 'General',
    description: 'A balanced diet',
    protein: 30,
    carbs: 50,
    fat: 20,
  },
  {
    name: 'Fitness',
    description: 'Muscle building',
    protein: 40,
    carbs: 40,
    fat: 20,
  },
  {
    name: 'Keto',
    description: 'High protein and fat',
    protein: 25,
    carbs: 5,
    fat: 70,
  },
  {
    name: 'Low Carb',
    description: 'Restrict carbs to 20%',
    protein: 40,
    carbs: 20,
    fat: 40,
  },
];

export default function MacroGoalsScreen() {
  const { data, setMacros } = useOnboarding();
  const { session } = useAuth();
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const handlePresetSelect = (index: number) => {
    setSelectedPreset(index);
    const preset = MACRO_PRESETS[index];
    setMacros(
      preset.protein,
      preset.carbs,
      preset.fat,
      false // useAutoMacros
    );
  };

  const handleNext = async () => {
    setIsSaving(true);
    try {
      const preset = MACRO_PRESETS[selectedPreset];
      await UserModel.createMacroGoals({
        user_id: session?.user.id,
        protein: preset.protein,
        carbs: preset.carbs,
        fat: preset.fat,
        use_auto_macros: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      router.push('/(onboarding)/loader');
    } catch (error: any) {
      console.error('Error saving macro goals:', error);
      Alert.alert('Error', error.message || 'Failed to save macro goals');
    } finally {
      setIsSaving(false);
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
        <Text style={styles.title}>Final touch! Set your macro goals</Text>
        <View style={styles.progressBar}>
          <View style={styles.progressFill} />
        </View>
      </View>

      <View style={styles.presetList}>
        {MACRO_PRESETS.map((preset, index) => (
          <TouchableOpacity
            key={preset.name}
            style={[
              styles.presetCard,
              selectedPreset === index && styles.selectedPresetCard
            ]}
            onPress={() => handlePresetSelect(index)}
          >
            <View style={styles.presetInfo}>
              <Text style={styles.presetName}>{preset.name}</Text>
              <Text style={styles.presetRatio}>{preset.carbs} : {preset.protein} : {preset.fat}</Text>
              <Text style={styles.presetDescription}>{preset.description}</Text>
            </View>
            <View style={styles.macroCircles}>
              <View style={[styles.circle, styles.carbsCircle]} />
              <View style={[styles.circle, styles.proteinCircle]} />
              <View style={[styles.circle, styles.fatCircle]} />
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#FFD700' }]} />
          <Text style={styles.legendText}>Carbs</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#FF6B6B' }]} />
          <Text style={styles.legendText}>Protein</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#4ECDC4' }]} />
          <Text style={styles.legendText}>Fat</Text>
        </View>
      </View>

      <Text style={styles.note}>
        Note: You can fine-tune your macro goals anytime in profile
      </Text>

      <Button 
        onPress={handleNext}
        disabled={isSaving}
        style={styles.nextButton}
      >
        {isSaving ? 'Saving...' : 'Next'}
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
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#000',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#f0f0f0',
    borderRadius: 2,
  },
  progressFill: {
    width: '86.58%',
    height: '100%',
    backgroundColor: '#000',
    borderRadius: 2,
  },
  presetList: {
    gap: 12,
    marginBottom: 20,
  },
  presetCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedPresetCard: {
    borderColor: '#000',
    backgroundColor: '#fff',
  },
  presetInfo: {
    flex: 1,
    marginRight: 12,
  },
  presetName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#000',
  },
  presetRatio: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  presetDescription: {
    fontSize: 12,
    color: '#999',
  },
  macroCircles: {
    flexDirection: 'row',
    gap: -6,
    alignItems: 'center',
  },
  circle: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  carbsCircle: {
    backgroundColor: '#FFD700',
    zIndex: 3,
  },
  proteinCircle: {
    backgroundColor: '#FF6B6B',
    zIndex: 2,
  },
  fatCircle: {
    backgroundColor: '#4ECDC4',
    zIndex: 1,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  note: {
    textAlign: 'center',
    color: '#999',
    fontSize: 12,
    marginBottom: 24,
  },
  nextButton: {
    backgroundColor: '#000',
    paddingVertical: 14,
    borderRadius: 25,
    marginBottom: 16,
  }
}); 