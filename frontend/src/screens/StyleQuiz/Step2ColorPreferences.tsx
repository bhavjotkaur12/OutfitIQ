import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput } from 'react-native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';
import type { AuthStackParamList, StyleQuizStackParamList } from '../../navigation/types'; // Adjust path as needed

const COLORS = [
  '#FF4C4C', '#FF7EB9', '#FFB259', '#FFD93B', '#4CFF88', '#4C6FFF', '#A259FF', '#B0B0B0', '#A0522D', '#222222', '#FFFFFF',
  '#00B8A9', '#F6416C', '#43E97B', '#28C7FA', '#F9EA8F', '#F6D365', '#FF5858', '#6A89CC', '#2C3A47', '#E17055', '#00B894',
  '#636E72', '#D35400', '#E84393', '#F8EFBA', '#303952', '#B33771', '#3B3B98', '#BDC581'
];

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
      ...(route.params || {}),
      preferredColors,
      avoidColors,
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.outerContainer}>
      <View style={styles.card}>
        <Text style={styles.progress}>Step 2 of 5</Text>
        <Text style={styles.title}>Color Preferences</Text>
        <Text style={styles.subtitle}>Choose the colors you love to wear</Text>
        <Text style={styles.label}>Select Preferred Colors</Text>
        <View style={styles.swatchGrid}>
          {COLORS.map(color => {
            const selected = preferredColors.includes(color);
            // For white, add a border for visibility
            const isWhite = color.toLowerCase() === '#ffffff';
            return (
              <TouchableOpacity
                key={color}
                style={[
                  styles.swatch,
                  { backgroundColor: color, borderColor: isWhite ? '#ccc' : color },
                  selected && styles.swatchSelected,
                  selected && { borderColor: '#222', borderWidth: 3 }
                ]}
                onPress={() => toggleColor(color)}
                activeOpacity={0.8}
              >
                {selected && (
                  <View style={styles.checkmarkContainer}>
                    <Text style={styles.checkmark}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
        <Text style={styles.label}>Colors to Avoid</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Orange, Brown"
          value={avoidColors}
          onChangeText={setAvoidColors}
        />
        <TouchableOpacity
          style={[
            styles.button,
            preferredColors.length === 0 && styles.buttonDisabled
          ]}
          onPress={handleNext}
          disabled={preferredColors.length === 0}
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
  swatchGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  swatch: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#ccc',
    marginRight: 10,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  swatchSelected: {
    borderColor: '#222',
    borderWidth: 3,
  },
  checkmarkContainer: {
    position: 'absolute',
    right: 2,
    bottom: 2,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 2,
    paddingVertical: 0,
  },
  checkmark: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#fafafa',
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

export default Step2ColorPreferences;
