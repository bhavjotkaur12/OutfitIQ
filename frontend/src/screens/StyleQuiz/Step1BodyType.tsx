import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';
import type { StyleQuizStackParamList } from '../../navigation/types';

type Step1BodyTypeProps = {
  navigation: StackNavigationProp<StyleQuizStackParamList, 'Step1BodyType'>;
  route: RouteProp<StyleQuizStackParamList, 'Step1BodyType'>;
};

const Step1BodyType: React.FC<Step1BodyTypeProps> = ({ navigation, route }) => {
  const [height, setHeight] = useState('');
  const [build, setBuild] = useState('');
  const [bodyType, setBodyType] = useState('');
  const [fit, setFit] = useState('');

  const buildTypes = [
    'Petite', 'Tall', 'Athletic', 'Curvy', 'Average', 'Plus Size', 'Slim', 'Broad', 'Muscular'
  ];

  const bodyTypes = [
    'Pear-shaped', 'Hourglass', 'Rectangle', 'Apple-shaped', 'Inverted Triangle',
    'Triangle', 'Oval', 'Diamond', 'Straight', 'Round'
  ];

  const handleNext = () => {
    navigation.navigate('Step2ColorPreferences', {
      ...(route.params || {}),
      height, build, bodyType, fit,
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.outerContainer}>
      <View style={styles.card}>
        <Text style={styles.progress}>Step 1 of 5</Text>
        <Text style={styles.title}>Style Quiz</Text>
        <Text style={styles.subtitle}>Let's get to know your body type and fit preferences</Text>

        <Text style={styles.label}>Height</Text>
        <TextInput
          value={height}
          onChangeText={setHeight}
          placeholder="Enter your height in inches"
          style={styles.input}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Build Type</Text>
        <View style={styles.row}>
          {buildTypes.map(option => (
            <TouchableOpacity
              key={option}
              style={[styles.option, build === option && styles.selected]}
              onPress={() => setBuild(option)}
              activeOpacity={0.8}
            >
              <Text style={build === option ? styles.selectedText : styles.optionText}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Body Type</Text>
        <View style={styles.row}>
          {bodyTypes.map(option => (
            <TouchableOpacity
              key={option}
              style={[styles.option, bodyType === option && styles.selected]}
              onPress={() => setBodyType(option)}
              activeOpacity={0.8}
            >
              <Text style={bodyType === option ? styles.selectedText : styles.optionText}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Preferred Clothing Fit</Text>
        <View style={styles.row}>
          {['Slim fit', 'Relaxed', 'Oversized'].map(option => (
            <TouchableOpacity
              key={option}
              style={[styles.option, fit === option && styles.selected]}
              onPress={() => setFit(option)}
              activeOpacity={0.8}
            >
              <Text style={fit === option ? styles.selectedText : styles.optionText}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.button,
            (!height || !build || !bodyType || !fit) && styles.buttonDisabled
          ]}
          onPress={handleNext}
          disabled={!height || !build || !bodyType || !fit}
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
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#fafafa',
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

export default Step1BodyType;
