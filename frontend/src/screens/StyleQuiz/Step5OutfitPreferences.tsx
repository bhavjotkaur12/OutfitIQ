import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';
import type { AuthStackParamList, StyleQuizStackParamList } from '../../navigation/types'; // Adjust path as needed

type Step5OutfitPreferencesProps = {
  navigation: StackNavigationProp<StyleQuizStackParamList, 'Step5OutfitPreferences'>;
  route: RouteProp<StyleQuizStackParamList, 'Step5OutfitPreferences'>;
};

const DENIM = ['Skinny', 'Straight-leg', 'Relaxed'];
const OUTERWEAR = ['Leather Jacket', 'Puffer Jacket', 'Trench Coat'];
const DRESS_TOP = ['Long', 'Short', 'Cropped'];

const Step5OutfitPreferences: React.FC<Step5OutfitPreferencesProps> = ({ navigation, route }) => {
  const [denim, setDenim] = useState('');
  const [outerwear, setOuterwear] = useState('');
  const [dressTop, setDressTop] = useState('');

  const handleNext = () => {
    navigation.navigate('QuizSummary', {
      ...route.params,
      denim,
      outerwear,
      dressTop,
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Outfit Preferences</Text>
      <Text style={styles.label}>Preferred Denim Fit</Text>
      <View style={styles.row}>
        {DENIM.map(option => (
          <TouchableOpacity
            key={option}
            style={[styles.option, denim === option && styles.selected]}
            onPress={() => setDenim(option)}
          >
            <Text>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.label}>Outerwear Preferences</Text>
      <View style={styles.row}>
        {OUTERWEAR.map(option => (
          <TouchableOpacity
            key={option}
            style={[styles.option, outerwear === option && styles.selected]}
            onPress={() => setOuterwear(option)}
          >
            <Text>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.label}>Dress/Top Length</Text>
      <View style={styles.row}>
        {DRESS_TOP.map(option => (
          <TouchableOpacity
            key={option}
            style={[styles.option, dressTop === option && styles.selected]}
            onPress={() => setDressTop(option)}
          >
            <Text>{option}</Text>
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

export default Step5OutfitPreferences;
