import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput } from 'react-native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';
import type { AuthStackParamList, StyleQuizStackParamList } from '../../navigation/types'; // Adjust path as needed

const COLORS = ['Red', 'Blue', 'Green', 'Yellow', 'Black', 'White', 'Pink', 'Purple', 'Orange', 'Brown', 'Gray'];

type Step2ColorPreferencesProps = {
  navigation: StackNavigationProp<StyleQuizStackParamList, 'Step2ColorPreferences'>;
  route: RouteProp<StyleQuizStackParamList, 'Step2ColorPreferences'>;
};

const Step2ColorPreferences: React.FC<Step2ColorPreferencesProps> = ({ navigation, route }) => {
  const [preferredColors, setPreferredColors] = useState<string[]>([]);
  const [avoidColors, setAvoidColors] = useState('');

  const toggleColor = (color: string) => {
    setPreferredColors(prev =>
      prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
    );
  };

  const handleNext = () => {
    navigation.navigate('Step3StyleType', {
      ...route.params,
      preferredColors,
      avoidColors,
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Color Preferences</Text>
      <Text style={styles.label}>Select Preferred Colors</Text>
      <View style={styles.row}>
        {COLORS.map(color => (
          <TouchableOpacity
            key={color}
            style={[styles.colorOption, preferredColors.includes(color) && styles.selected]}
            onPress={() => toggleColor(color)}
          >
            <Text>{color}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.label}>Colors to Avoid</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Orange, Brown"
        value={avoidColors}
        onChangeText={setAvoidColors}
      />
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
  colorOption: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginRight: 8, marginBottom: 8 },
  selected: { backgroundColor: '#e0e0e0' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 8 },
  button: { backgroundColor: '#000', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 24 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});

export default Step2ColorPreferences;
