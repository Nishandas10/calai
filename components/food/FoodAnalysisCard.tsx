import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Card } from '@/components/ui/card';
import type { FoodAnalysis } from '@/lib/services/food-analysis';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/auth';

interface FoodAnalysisCardProps {
  analysis: FoodAnalysis;
  imagePath: string;
  onSave?: () => void;
}

export function FoodAnalysisCard({ analysis: initialAnalysis, imagePath, onSave }: FoodAnalysisCardProps) {
  const { session } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [analysis, setAnalysis] = useState(initialAnalysis);
  const [isSaving, setIsSaving] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!session?.user?.id) {
      Alert.alert('Error', 'You must be logged in to save adjustments');
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('food_logs')
        .upsert({
          user_id: session.user.id,
          image_path: imagePath,
          ai_analysis: initialAnalysis,
          user_adjustments: analysis,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      setIsEditing(false);
      onSave?.();
      Alert.alert('Success', 'Your adjustments have been saved');
    } catch (error) {
      console.error('Error saving adjustments:', error);
      Alert.alert('Error', 'Failed to save adjustments');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setAnalysis(initialAnalysis);
    setIsEditing(false);
  };

  const updateIngredient = (index: number, field: keyof typeof analysis.ingredients[0], value: string) => {
    const newValue = parseFloat(value) || 0;
    const newAnalysis = { ...analysis };
    newAnalysis.ingredients[index][field] = newValue;

    // Recalculate totals
    newAnalysis.total = newAnalysis.ingredients.reduce(
      (acc, curr) => ({
        calories: acc.calories + curr.calories,
        protein: acc.protein + curr.protein,
        carbs: acc.carbs + curr.carbs,
        fat: acc.fat + curr.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    setAnalysis(newAnalysis);
  };

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Food Analysis</Text>
        {!isEditing ? (
          <TouchableOpacity onPress={handleEdit} style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.editActions}>
            <TouchableOpacity onPress={handleCancel} style={[styles.actionButton, styles.cancelButton]}>
              <Text style={styles.actionButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={handleSave} 
              style={[styles.actionButton, styles.saveButton]}
              disabled={isSaving}
            >
              <Text style={styles.actionButtonText}>{isSaving ? 'Saving...' : 'Save'}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      
      <ScrollView style={styles.ingredientsList}>
        {analysis.ingredients.map((ingredient, index) => (
          <View key={index} style={styles.ingredientItem}>
            <Text style={styles.ingredientName}>{ingredient.name}</Text>
            <View style={styles.macros}>
              {isEditing ? (
                <>
                  <View style={styles.macroInput}>
                    <Text style={styles.macroLabel}>Calories:</Text>
                    <TextInput
                      style={styles.input}
                      value={ingredient.calories.toString()}
                      onChangeText={(value) => updateIngredient(index, 'calories', value)}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.macroInput}>
                    <Text style={styles.macroLabel}>Protein (g):</Text>
                    <TextInput
                      style={styles.input}
                      value={ingredient.protein.toString()}
                      onChangeText={(value) => updateIngredient(index, 'protein', value)}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.macroInput}>
                    <Text style={styles.macroLabel}>Carbs (g):</Text>
                    <TextInput
                      style={styles.input}
                      value={ingredient.carbs.toString()}
                      onChangeText={(value) => updateIngredient(index, 'carbs', value)}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.macroInput}>
                    <Text style={styles.macroLabel}>Fat (g):</Text>
                    <TextInput
                      style={styles.input}
                      value={ingredient.fat.toString()}
                      onChangeText={(value) => updateIngredient(index, 'fat', value)}
                      keyboardType="numeric"
                    />
                  </View>
                </>
              ) : (
                <>
                  <Text style={styles.macroText}>{ingredient.calories} cal</Text>
                  <Text style={styles.macroText}>{ingredient.protein}g protein</Text>
                  <Text style={styles.macroText}>{ingredient.carbs}g carbs</Text>
                  <Text style={styles.macroText}>{ingredient.fat}g fat</Text>
                </>
              )}
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.totalContainer}>
        <Text style={styles.totalTitle}>Total</Text>
        <View style={styles.totalMacros}>
          <Text style={styles.totalText}>{analysis.total.calories} calories</Text>
          <Text style={styles.totalText}>{analysis.total.protein}g protein</Text>
          <Text style={styles.totalText}>{analysis.total.carbs}g carbs</Text>
          <Text style={styles.totalText}>{analysis.total.fat}g fat</Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 16,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  editButton: {
    backgroundColor: '#2f95dc',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  editButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  editActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#ff3b30',
  },
  saveButton: {
    backgroundColor: '#34c759',
  },
  ingredientsList: {
    maxHeight: 300,
  },
  ingredientItem: {
    marginBottom: 12,
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  ingredientName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  macros: {
    gap: 8,
  },
  macroInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  macroLabel: {
    fontSize: 14,
    color: '#666',
    width: 80,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 14,
  },
  macroText: {
    fontSize: 14,
    color: '#666',
  },
  totalContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  totalMacros: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  totalText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2f95dc',
  },
}); 