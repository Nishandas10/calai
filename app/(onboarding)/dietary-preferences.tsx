import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Switch, Button, Chip } from 'react-native-paper';
import { router } from 'expo-router';
import { useAuth } from '@/context/auth';
import { supabase } from '@/lib/supabase';

const DIET_STYLES = [
  { label: 'None', value: 'None' },
  { label: 'Keto', value: 'Keto' },
  { label: 'Low-carb', value: 'Low-carb' },
  { label: 'Mediterranean', value: 'Mediterranean' },
  { label: 'Paleo', value: 'Paleo' },
];

export default function DietaryPreferences() {
  const { session } = useAuth();
  const [isVegetarian, setIsVegetarian] = useState(false);
  const [isVegan, setIsVegan] = useState(false);
  const [isGlutenFree, setIsGlutenFree] = useState(false);
  const [isDairyFree, setIsDairyFree] = useState(false);
  const [dietStyle, setDietStyle] = useState('None');
  const [isSaving, setIsSaving] = useState(false);

  const handleNext = async () => {
    if (!session?.user) {
      Alert.alert('Error', 'You must be logged in');
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('user_dietary_preferences')
        .upsert({
          user_id: session.user.id,
          is_vegetarian: isVegetarian,
          is_vegan: isVegan,
          is_gluten_free: isGlutenFree,
          is_dairy_free: isDairyFree,
          diet_style: dietStyle,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      console.log('Dietary preferences saved successfully');
      router.push('/(onboarding)/macro-goals');
    } catch (error: any) {
      console.error('Error saving dietary preferences:', error);
      Alert.alert('Error', error.message || 'Failed to save dietary preferences');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text variant="headlineMedium" style={styles.title}>
          Dietary Preferences
        </Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          Help us understand your dietary needs
        </Text>

        {/* Dietary Restrictions */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Dietary Restrictions
          </Text>
          
          <View style={styles.switchContainer}>
            <View style={styles.switchRow}>
              <Text variant="bodyLarge">Vegetarian</Text>
              <Switch
                value={isVegetarian}
                onValueChange={setIsVegetarian}
                disabled={isSaving}
              />
            </View>

            <View style={styles.switchRow}>
              <Text variant="bodyLarge">Vegan</Text>
              <Switch
                value={isVegan}
                onValueChange={setIsVegan}
                disabled={isSaving}
              />
            </View>

            <View style={styles.switchRow}>
              <Text variant="bodyLarge">Gluten-free</Text>
              <Switch
                value={isGlutenFree}
                onValueChange={setIsGlutenFree}
                disabled={isSaving}
              />
            </View>

            <View style={styles.switchRow}>
              <Text variant="bodyLarge">Dairy-free</Text>
              <Switch
                value={isDairyFree}
                onValueChange={setIsDairyFree}
                disabled={isSaving}
              />
            </View>
          </View>
        </View>

        {/* Diet Style */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Diet Style
          </Text>
          <View style={styles.chipContainer}>
            {DIET_STYLES.map((diet) => (
              <Chip
                key={diet.value}
                selected={dietStyle === diet.value}
                onPress={() => setDietStyle(diet.value)}
                style={styles.chip}
                disabled={isSaving}
                mode={dietStyle === diet.value ? 'flat' : 'outlined'}
              >
                {diet.label}
              </Chip>
            ))}
          </View>
        </View>

        <Button
          mode="contained"
          onPress={handleNext}
          loading={isSaving}
          disabled={isSaving}
          style={styles.button}
        >
          {isSaving ? 'Saving...' : 'Next'}
        </Button>
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
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 32,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  switchContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginBottom: 8,
  },
  button: {
    marginTop: 16,
    padding: 4,
  },
}); 