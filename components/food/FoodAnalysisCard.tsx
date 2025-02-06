import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Card } from '@/components/ui/card';
import type { FoodAnalysis } from '@/lib/services/food-analysis';

interface FoodAnalysisCardProps {
  analysis: FoodAnalysis;
}

export function FoodAnalysisCard({ analysis }: FoodAnalysisCardProps) {
  return (
    <Card style={styles.container}>
      <Text style={styles.title}>Food Analysis</Text>
      
      <ScrollView style={styles.ingredientsList}>
        {analysis.ingredients.map((ingredient, index) => (
          <View key={index} style={styles.ingredientItem}>
            <Text style={styles.ingredientName}>{ingredient.name}</Text>
            <View style={styles.macros}>
              <Text style={styles.macroText}>{ingredient.calories} cal</Text>
              <Text style={styles.macroText}>{ingredient.protein}g protein</Text>
              <Text style={styles.macroText}>{ingredient.carbs}g carbs</Text>
              <Text style={styles.macroText}>{ingredient.fat}g fat</Text>
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
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