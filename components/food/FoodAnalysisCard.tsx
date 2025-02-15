import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Card } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/auth';

interface Ingredient {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

interface EditableIngredient {
  name: string;
  calories: number | string;
  protein: number | string;
  carbs: number | string;
  fat: number | string;
  fiber: number | string;
}

interface FoodAnalysis {
  ingredients: Ingredient[];
  total: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
}

interface FoodAnalysisCardProps {
  analysis: FoodAnalysis;
  imagePath: string;
  onSave?: () => void;
}

export default function FoodAnalysisCard({ analysis: initialAnalysis, imagePath, onSave }: FoodAnalysisCardProps) {
  const { session } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<FoodAnalysis | null>(null);
  const [editableAnalysis, setEditableAnalysis] = useState<{ ingredients: EditableIngredient[] }>({ 
    ingredients: []
  });
  const [isSaving, setIsSaving] = useState(false);

  // Initialize data with mounted check
  useEffect(() => {
    let mounted = true;

    const initializeData = async () => {
      try {
        if (!initialAnalysis?.ingredients?.length || !initialAnalysis?.total) {
          throw new Error('Invalid analysis data');
        }

        // Ensure all numeric values are properly initialized
        const safeIngredients: Ingredient[] = initialAnalysis.ingredients.map(ing => ({
          name: ing.name || 'Unknown Item',
          calories: typeof ing.calories === 'number' ? ing.calories : 0,
          protein: typeof ing.protein === 'number' ? ing.protein : 0,
          carbs: typeof ing.carbs === 'number' ? ing.carbs : 0,
          fat: typeof ing.fat === 'number' ? ing.fat : 0,
          fiber: typeof ing.fiber === 'number' ? ing.fiber : 0
        }));

        const safeTotal: FoodAnalysis['total'] = {
          calories: typeof initialAnalysis.total.calories === 'number' ? initialAnalysis.total.calories : 0,
          protein: typeof initialAnalysis.total.protein === 'number' ? initialAnalysis.total.protein : 0,
          carbs: typeof initialAnalysis.total.carbs === 'number' ? initialAnalysis.total.carbs : 0,
          fat: typeof initialAnalysis.total.fat === 'number' ? initialAnalysis.total.fat : 0,
          fiber: typeof initialAnalysis.total.fiber === 'number' ? initialAnalysis.total.fiber : 0
        };

        const safeAnalysis: FoodAnalysis = {
          ingredients: safeIngredients,
          total: safeTotal
        };

        if (mounted) {
          // Set analysis with safe values
          setAnalysis(safeAnalysis);

          // Initialize editable analysis with safe string values
          setEditableAnalysis({
            ingredients: safeIngredients.map(ing => ({
              name: ing.name,
              calories: ing.calories.toString(),
              protein: ing.protein.toString(),
              carbs: ing.carbs.toString(),
              fat: ing.fat.toString(),
              fiber: ing.fiber.toString()
            }))
          });

          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError('Failed to load analysis data');
          console.error('Error initializing FoodAnalysisCard:', err);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeData();

    // Cleanup function to prevent memory leaks
    return () => {
      mounted = false;
    };
  }, [initialAnalysis]);

  // Safe number formatting helper
  const formatNumber = (value: number | undefined | null): string => {
    if (typeof value !== 'number' || isNaN(value)) return '0.0';
    return value.toFixed(1);
  };

  // Update ingredient with safe number handling
  const updateIngredient = (index: number, field: keyof Omit<EditableIngredient, 'name'>, value: string) => {
    try {
      // Allow empty string for better UX while typing
      if (value === '' || value === '.') {
        const newEditableAnalysis = { ...editableAnalysis };
        if (newEditableAnalysis.ingredients[index]) {
          newEditableAnalysis.ingredients[index][field] = value;
          setEditableAnalysis(newEditableAnalysis);
        }
        return;
      }

      // Parse float and handle invalid inputs
      const newValue = parseFloat(value);
      if (isNaN(newValue)) return;

      const newEditableAnalysis = { ...editableAnalysis };
      if (!newEditableAnalysis.ingredients[index]) return;

      newEditableAnalysis.ingredients[index][field] = value;
      setEditableAnalysis(newEditableAnalysis);

      // Update the actual analysis with numbers
      if (!analysis) return;
      const newAnalysis: FoodAnalysis = {
        ingredients: [...analysis.ingredients],
        total: { ...analysis.total }
      };
      if (!newAnalysis.ingredients[index]) return;

      newAnalysis.ingredients[index][field] = newValue;

      // Safely recalculate totals using the helper
      const totals = newAnalysis.ingredients.reduce(
        (acc, curr) => ({
          calories: (acc.calories || 0) + (curr.calories || 0),
          protein: (acc.protein || 0) + (curr.protein || 0),
          carbs: (acc.carbs || 0) + (curr.carbs || 0),
          fat: (acc.fat || 0) + (curr.fat || 0),
          fiber: (acc.fiber || 0) + (curr.fiber || 0)
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
      );

      newAnalysis.total = {
        calories: Number(formatNumber(totals.calories)),
        protein: Number(formatNumber(totals.protein)),
        carbs: Number(formatNumber(totals.carbs)),
        fat: Number(formatNumber(totals.fat)),
        fiber: Number(formatNumber(totals.fiber))
      };

      setAnalysis(newAnalysis);
    } catch (err) {
      console.error('Error updating ingredient:', err);
      setError('Failed to update values');
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <Card style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Food Analysis</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2f95dc" />
          <Text style={styles.loadingText}>Loading analysis...</Text>
        </View>
      </Card>
    );
  }

  // Show error state
  if (error || !analysis) {
    return (
      <Card style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Food Analysis</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || 'No analysis data available'}</Text>
        </View>
      </Card>
    );
  }

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
      const { error: saveError } = await supabase
        .from('food_logs')
        .upsert({
          user_id: session.user.id,
          image_path: imagePath,
          ai_analysis: initialAnalysis,
          user_adjustments: analysis,
          updated_at: new Date().toISOString(),
        });

      if (saveError) throw saveError;

      setIsEditing(false);
      onSave?.();
      Alert.alert('Success', 'Your adjustments have been saved');
    } catch (err) {
      console.error('Error saving adjustments:', err);
      Alert.alert('Error', 'Failed to save adjustments');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    try {
      // Reset to initial values with validation
      if (!initialAnalysis?.ingredients) {
        throw new Error('Invalid initial analysis data');
      }

      setAnalysis(initialAnalysis);
      setEditableAnalysis({
        ingredients: initialAnalysis.ingredients.map(ing => ({
          name: ing.name || 'Unknown Item',
          calories: (ing.calories || 0).toString(),
          protein: (ing.protein || 0).toString(),
          carbs: (ing.carbs || 0).toString(),
          fat: (ing.fat || 0).toString(),
          fiber: (ing.fiber || 0).toString()
        }))
      });
      setIsEditing(false);
      setError(null);
    } catch (err) {
      console.error('Error resetting analysis:', err);
      setError('Failed to reset analysis data');
    }
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
                      value={editableAnalysis.ingredients[index].calories.toString()}
                      onChangeText={(value) => updateIngredient(index, 'calories', value)}
                      keyboardType="decimal-pad"
                      maxLength={5}
                    />
                  </View>
                  <View style={styles.macroInput}>
                    <Text style={styles.macroLabel}>Protein (g):</Text>
                    <TextInput
                      style={styles.input}
                      value={editableAnalysis.ingredients[index].protein.toString()}
                      onChangeText={(value) => updateIngredient(index, 'protein', value)}
                      keyboardType="decimal-pad"
                      maxLength={5}
                    />
                  </View>
                  <View style={styles.macroInput}>
                    <Text style={styles.macroLabel}>Carbs (g):</Text>
                    <TextInput
                      style={styles.input}
                      value={editableAnalysis.ingredients[index].carbs.toString()}
                      onChangeText={(value) => updateIngredient(index, 'carbs', value)}
                      keyboardType="decimal-pad"
                      maxLength={5}
                    />
                  </View>
                  <View style={styles.macroInput}>
                    <Text style={styles.macroLabel}>Fat (g):</Text>
                    <TextInput
                      style={styles.input}
                      value={editableAnalysis.ingredients[index].fat.toString()}
                      onChangeText={(value) => updateIngredient(index, 'fat', value)}
                      keyboardType="decimal-pad"
                      maxLength={5}
                    />
                  </View>
                  <View style={styles.macroInput}>
                    <Text style={styles.macroLabel}>Fiber (g):</Text>
                    <TextInput
                      style={styles.input}
                      value={editableAnalysis.ingredients[index].fiber.toString()}
                      onChangeText={(value) => updateIngredient(index, 'fiber', value)}
                      keyboardType="decimal-pad"
                      maxLength={5}
                    />
                  </View>
                </>
              ) : (
                <>
                  <Text style={styles.macroText}>{ingredient.calories.toFixed(1)} cal</Text>
                  <Text style={styles.macroText}>{ingredient.protein.toFixed(1)}g protein</Text>
                  <Text style={styles.macroText}>{ingredient.carbs.toFixed(1)}g carbs</Text>
                  <Text style={styles.macroText}>{ingredient.fat.toFixed(1)}g fat</Text>
                  <Text style={styles.macroText}>{ingredient.fiber.toFixed(1)}g fiber</Text>
                </>
              )}
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.totalContainer}>
        <Text style={styles.totalTitle}>Total</Text>
        <View style={styles.totalMacros}>
          <Text style={styles.totalText}>{analysis.total.calories.toFixed(1)} calories</Text>
          <Text style={styles.totalText}>{analysis.total.protein.toFixed(1)}g protein</Text>
          <Text style={styles.totalText}>{analysis.total.carbs.toFixed(1)}g carbs</Text>
          <Text style={styles.totalText}>{analysis.total.fat.toFixed(1)}g fat</Text>
          <Text style={styles.totalText}>{analysis.total.fiber.toFixed(1)}g fiber</Text>
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
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    color: '#ff3b30',
    textAlign: 'center',
  }
}); 