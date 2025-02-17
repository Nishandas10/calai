import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { useOnboarding } from '@/context/onboarding';
import { OnboardingHeader } from '@/components/onboarding/OnboardingHeader';
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';
import { OnboardingButton } from '@/components/onboarding/OnboardingButton';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const PICKER_HEIGHT = SCREEN_HEIGHT * 0.4;

const YEARS = Array.from({ length: 59 }, (_, i) => 1998 - i);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

export default function BirthdayScreen() {
  const { setBirthday } = useOnboarding();
  const [selectedYear, setSelectedYear] = useState(1998);
  const [selectedMonth, setSelectedMonth] = useState(1);
  const [selectedDay, setSelectedDay] = useState(1);

  const handleNext = () => {
    setBirthday(new Date(selectedYear, selectedMonth - 1, selectedDay));
    router.push('/(onboarding)/height');
  };

  const formatMonth = (month: number) => {
    return month.toString().padStart(2, '0');
  };

  const formatDay = (day: number) => {
    return day.toString().padStart(2, '0');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <OnboardingHeader 
          title="When's your birthday?" 
          showBackButton
        />
        <OnboardingProgress step={1} totalSteps={8} />
      </View>

      <View style={styles.content}>
        <View style={styles.datePickerContainer}>
          <View style={styles.dateColumns}>
            <View style={styles.column}>
              <Text style={styles.columnLabel}>Month</Text>
              <ScrollView 
                style={styles.scrollColumn}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
              >
                {MONTHS.map((month) => (
                  <TouchableOpacity
                    key={month}
                    style={[
                      styles.dateOption,
                      selectedMonth === month && styles.selectedOption
                    ]}
                    onPress={() => setSelectedMonth(month)}
                  >
                    <Text style={[
                      styles.dateText,
                      selectedMonth === month && styles.selectedText
                    ]}>
                      {formatMonth(month)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.column}>
              <Text style={styles.columnLabel}>Day</Text>
              <ScrollView 
                style={styles.scrollColumn}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
              >
                {DAYS.map((day) => (
                  <TouchableOpacity
                    key={day}
                    style={[
                      styles.dateOption,
                      selectedDay === day && styles.selectedOption
                    ]}
                    onPress={() => setSelectedDay(day)}
                  >
                    <Text style={[
                      styles.dateText,
                      selectedDay === day && styles.selectedText
                    ]}>
                      {formatDay(day)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.column}>
              <Text style={styles.columnLabel}>Year</Text>
              <ScrollView 
                style={styles.scrollColumn}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
              >
                {YEARS.map((year) => (
                  <TouchableOpacity
                    key={year}
                    style={[
                      styles.dateOption,
                      selectedYear === year && styles.selectedOption
                    ]}
                    onPress={() => setSelectedYear(year)}
                  >
                    <Text style={[
                      styles.dateText,
                      selectedYear === year && styles.selectedText
                    ]}>
                      {year}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <OnboardingButton 
          label="Continue"
          onPress={handleNext}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  datePickerContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  dateColumns: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: PICKER_HEIGHT,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  column: {
    flex: 1,
    marginHorizontal: 4,
  },
  columnLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  scrollColumn: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 8,
  },
  dateOption: {
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
  },
  selectedOption: {
    backgroundColor: '#000',
  },
  dateText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  selectedText: {
    color: '#fff',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
}); 