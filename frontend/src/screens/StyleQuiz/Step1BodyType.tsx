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

  const handleNext = () => {
    navigation.navigate('Step2ColorPreferences', {
      height, build, bodyType, fit
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Style Quiz</Text>
      <Text style={styles.label}>Height</Text>
      <TextInput value={height} onChangeText={setHeight} placeholder="Enter your height in inches" style={styles.input} />

      <Text style={styles.label}>Build Type</Text>
      <View style={styles.row}>
        {['Petite', 'Tall', 'Athletic', 'Curvy'].map(option => (
          <TouchableOpacity
            key={option}
            style={[styles.option, build === option && styles.selected]}
            onPress={() => setBuild(option)}
          >
            <Text>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Body Type</Text>
      <View style={styles.row}>
        {['Pear-shaped', 'Hourglass', 'Rectangle', 'Apple-shaped'].map(option => (
          <TouchableOpacity
            key={option}
            style={[styles.option, bodyType === option && styles.selected]}
            onPress={() => setBodyType(option)}
          >
            <Text>{option}</Text>
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
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 8 },
  row: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 },
  option: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginRight: 8, marginBottom: 8 },
  selected: { backgroundColor: '#e0e0e0' },
  button: { backgroundColor: '#000', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 24 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});

export default Step1BodyType;
