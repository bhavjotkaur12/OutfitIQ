import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';
import type { StyleQuizStackParamList } from '../../navigation/types';

const COMFORT_OPTIONS = [
  'Mostly Comfort', 'Balanced', 'Mostly Fashion', 'Depends on Occasion'
];

const ACTIVITIES = [
  'Work', 'Social Events', 'Gym', 'Casual Outings', 'Formal Occasions',
  'Travel', 'Outdoor', 'Date Night', 'Lounging', 'School', 'Errands', 'Parties', 'Family Time'
];

type Step4ComfortLifestyleProps = {
  navigation: StackNavigationProp<StyleQuizStackParamList, 'Step4ComfortLifestyle'>;
  route: RouteProp<StyleQuizStackParamList, 'Step4ComfortLifestyle'>;
};

const Step4ComfortLifestyle: React.FC<Step4ComfortLifestyleProps> = ({ navigation, route }) => {
  const [comfort, setComfort] = useState('');
  const [activities, setActivities] = useState<string[]>([]);

  const toggleActivity = (activity: string) => {
    setActivities(prev =>
      prev.includes(activity) ? prev.filter(a => a !== activity) : [...prev, activity]
    );
  };

  const handleNext = () => {
    navigation.navigate('Step5OutfitPreferences', {
      ...(route.params || {}),
      comfort,
      activities,
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.outerContainer}>
      <View style={styles.card}>
        <Text style={styles.progress}>Step 4 of 5</Text>
        <Text style={styles.title}>Comfort & Lifestyle</Text>
        <Text style={styles.subtitle}>Tell us about your daily life and priorities</Text>
        <Text style={styles.label}>Comfort vs. Fashion</Text>
        <View style={styles.row}>
          {COMFORT_OPTIONS.map(option => (
            <TouchableOpacity
              key={option}
              style={[styles.option, comfort === option && styles.selected]}
              onPress={() => setComfort(option)}
              activeOpacity={0.8}
            >
              <Text style={comfort === option ? styles.selectedText : styles.optionText}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.label}>Typical Activities</Text>
        <View style={styles.row}>
          {ACTIVITIES.map(activity => (
            <TouchableOpacity
              key={activity}
              style={[styles.option, activities.includes(activity) && styles.selected]}
              onPress={() => toggleActivity(activity)}
              activeOpacity={0.8}
            >
              <Text style={activities.includes(activity) ? styles.selectedText : styles.optionText}>{activity}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity
          style={[
            styles.button,
            (!comfort || activities.length === 0) && styles.buttonDisabled
          ]}
          onPress={handleNext}
          disabled={!comfort || activities.length === 0}
        >
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flexGrow: 1,
    backgroundColor: '#f6f6f6',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 24,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  progress: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
    textAlign: 'right',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 18,
    textAlign: 'center',
  },
  label: {
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 4,
    fontSize: 15,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  option: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#f5f5f5',
  },
  selected: {
    backgroundColor: '#222',
    borderColor: '#222',
  },
  optionText: {
    color: '#222',
    fontWeight: '500',
  },
  selectedText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#000',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonDisabled: {
    backgroundColor: '#bbb',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default Step4ComfortLifestyle;
