import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';
import type { AuthStackParamList, StyleQuizStackParamList } from '../../navigation/types'; // Adjust path as needed

const ACTIVITIES = ['Work', 'Social Events', 'Gym', 'Casual Outings', 'Formal Occasions'];

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
      ...route.params,
      comfort,
      activities,
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Comfort & Lifestyle</Text>
      <Text style={styles.label}>Comfort vs. Fashion</Text>
      <View style={styles.row}>
        {['Mostly Comfort', 'Balanced', 'Mostly Fashion'].map(option => (
          <TouchableOpacity
            key={option}
            style={[styles.option, comfort === option && styles.selected]}
            onPress={() => setComfort(option)}
          >
            <Text>{option}</Text>
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
          >
            <Text>{activity}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  label: { fontWeight: 'bold', marginTop: 16, marginBottom: 4 },
  row: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 },
  option: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginRight: 8, marginBottom: 8 },
  selected: { backgroundColor: '#e0e0e0' },
  button: { backgroundColor: '#000', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 24 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});

export default Step4ComfortLifestyle;
