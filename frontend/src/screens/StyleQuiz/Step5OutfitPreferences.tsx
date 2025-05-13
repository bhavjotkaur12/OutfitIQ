import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';
import type { AuthStackParamList, StyleQuizStackParamList } from '../../navigation/types'; // Adjust path as needed

const DENIM = [
  'Skinny', 'Straight-leg', 'Relaxed', 'Bootcut', 'Wide-leg', 'Mom Jeans', 'Flare', 'Boyfriend'
];
const OUTERWEAR = [
  'Leather Jacket', 'Puffer Jacket', 'Trench Coat', 'Blazer', 'Bomber', 'Denim Jacket', 'Parka', 'Cardigan', 'Windbreaker'
];
const DRESS_TOP = [
  'Long', 'Short', 'Cropped', 'Midi', 'Maxi', 'Tunic', 'Peplum'
];

type Step5OutfitPreferencesProps = {
  navigation: StackNavigationProp<StyleQuizStackParamList, 'Step5OutfitPreferences'>;
  route: RouteProp<StyleQuizStackParamList, 'Step5OutfitPreferences'>;
};

const Step5OutfitPreferences: React.FC<Step5OutfitPreferencesProps> = ({ navigation, route }) => {
  const [denim, setDenim] = useState<string[]>([]);
  const [outerwear, setOuterwear] = useState<string[]>([]);
  const [dressTop, setDressTop] = useState<string[]>([]);

  const handleNext = () => {
    navigation.navigate('QuizSummary', {
      ...(route.params || {}),
      denim,
      outerwear,
      dressTop,
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.outerContainer}>
      <View style={styles.card}>
        <Text style={styles.progress}>Step 5 of 5</Text>
        <Text style={styles.title}>Outfit Preferences</Text>
        <Text style={styles.subtitle}>Let us know your go-to outfit details</Text>
        <Text style={styles.label}>Preferred Denim Fit</Text>
        <View style={styles.row}>
          {DENIM.map(option => (
            <TouchableOpacity
              key={option}
              style={[styles.option, denim.includes(option) && styles.selected]}
              onPress={() => {
                if (denim.includes(option)) {
                  setDenim(denim.filter(item => item !== option));
                } else {
                  setDenim([...denim, option]);
                }
              }}
              activeOpacity={0.8}
            >
              <Text style={denim.includes(option) ? styles.selectedText : styles.optionText}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.label}>Outerwear Preferences</Text>
        <View style={styles.row}>
          {OUTERWEAR.map(option => (
            <TouchableOpacity
              key={option}
              style={[styles.option, outerwear.includes(option) && styles.selected]}
              onPress={() => {
                if (outerwear.includes(option)) {
                  setOuterwear(outerwear.filter(item => item !== option));
                } else {
                  setOuterwear([...outerwear, option]);
                }
              }}
              activeOpacity={0.8}
            >
              <Text style={outerwear.includes(option) ? styles.selectedText : styles.optionText}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.label}>Dress/Top Length</Text>
        <View style={styles.row}>
          {DRESS_TOP.map(option => (
            <TouchableOpacity
              key={option}
              style={[styles.option, dressTop.includes(option) && styles.selected]}
              onPress={() => {
                if (dressTop.includes(option)) {
                  setDressTop(dressTop.filter(item => item !== option));
                } else {
                  setDressTop([...dressTop, option]);
                }
              }}
              activeOpacity={0.8}
            >
              <Text style={dressTop.includes(option) ? styles.selectedText : styles.optionText}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity
          style={[
            styles.button,
            (denim.length === 0 || outerwear.length === 0 || dressTop.length === 0) && styles.buttonDisabled
          ]}
          onPress={handleNext}
          disabled={denim.length === 0 || outerwear.length === 0 || dressTop.length === 0}
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

export default Step5OutfitPreferences;
