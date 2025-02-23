import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Card } from '@/components/ui/card';
import { firestore, auth } from '@/lib/firebase';
import { useAuth } from '@/context/auth';
import { FoodAnalysis } from '@/lib/services/food-analysis';
import FoodAnalysisCard from './FoodAnalysisCard';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';

interface FoodLog {
  id: string;
  image_path: string;
  ai_analysis: FoodAnalysis;
  user_adjustments: FoodAnalysis | null;
  created_at: string;
}

export default function RecentFoodLogs() {
  const { user } = useAuth();
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<FoodLog | null>(null);

  useEffect(() => {
    fetchRecentFoodLogs();
  }, []);

  const fetchRecentFoodLogs = async () => {
    if (!user?.uid) return;

    try {
      const foodLogsRef = collection(firestore, 'food_logs');
      const q = query(
        foodLogsRef,
        where('user_id', '==', user.uid),
        orderBy('created_at', 'desc'),
        limit(10)
      );

      const querySnapshot = await getDocs(q);
      const logs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as FoodLog));

      setFoodLogs(logs);
    } catch (error) {
      console.error('Error fetching food logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogPress = (log: FoodLog) => {
    setSelectedLog(selectedLog?.id === log.id ? null : log);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  if (loading) {
    return (
      <View style={styles.emptyState}>
        <Text>Loading recent meals...</Text>
      </View>
    );
  }

  if (foodLogs.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyStateText}>
          You haven't uploaded any food
        </Text>
        <Text style={styles.emptyStateSubtext}>
          Start tracking Today's meals by taking quick pictures
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {foodLogs.map((log) => (
        <TouchableOpacity 
          key={log.id} 
          onPress={() => handleLogPress(log)}
          style={styles.logItem}
        >
          <Card style={styles.logCard}>
            <View style={styles.logHeader}>
              <Image 
                source={{ uri: log.image_path }} 
                style={styles.foodImage} 
              />
              <View style={styles.logInfo}>
                <Text style={styles.logTime}>{formatTime(log.created_at)}</Text>
                <Text style={styles.totalCalories}>
                  {(log.user_adjustments || log.ai_analysis).total.calories.toFixed(1)} cal
                </Text>
              </View>
            </View>

            {selectedLog?.id === log.id && (
              <View style={styles.analysisContainer}>
                <FoodAnalysisCard 
                  analysis={log.user_adjustments || log.ai_analysis}
                  imagePath={log.image_path}
                  onSave={fetchRecentFoodLogs}
                />
              </View>
            )}
          </Card>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  logItem: {
    marginBottom: 12,
  },
  logCard: {
    padding: 12,
  },
  logHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  foodImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  logInfo: {
    flex: 1,
  },
  logTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  totalCalories: {
    fontSize: 18,
    fontWeight: '600',
  },
  analysisContainer: {
    marginTop: 12,
  },
}); 