import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput } from 'react-native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';
import type { StyleQuizStackParamList } from '../../navigation/types';

const STYLES = ['Casual', 'Formal', 'Sporty', 'Minimalistic'];

type Step3StyleTypeProps = {
  navigation: StackNavigationProp<StyleQuizStackParamList, 'Step3StyleType'>;
  route: RouteProp<StyleQuizStackParamList, 'Step3StyleType'>;
};

const Step3StyleType: React.FC<Step3StyleTypeProps> = ({ navigation, route }) => {
  const [styleTypes, setStyleTypes] = useState<string[]>([]);
  const [brands, setBrands] = useState('');
  const [influences, setInfluences] = useState('');

  const toggleStyle = (style: string) => {
    setStyleTypes(prev =>
      prev.includes(style) ? prev.filter(s => s !== style) : [...prev, style]
    );
  };

  const handleNext = () => {
    navigation.navigate('Step4ComfortLifestyle', {
      ...route.params,
      styleTypes,
      brands,
      influences,
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Style Type & Influences</Text>
      <Text style={styles.label}>Select Style Types</Text>
      <View style={styles.row}>
        {STYLES.map(style => (
          <TouchableOpacity
            key={style}
            style={[styles.option, styleTypes.includes(style) && styles.selected]}
            onPress={() => toggleStyle(style)}
          >
            <Text>{style}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.label}>Favorite Brands or Stores</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Zara, H&M"
        value={brands}
        onChangeText={setBrands}
      />
      <Text style={styles.label}>Style Icons / Influences</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Zendaya, Harry Styles"
        value={influences}
        onChangeText={setInfluences}
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
  option: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginRight: 8, marginBottom: 8 },
  selected: { backgroundColor: '#e0e0e0' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 8 },
  button: { backgroundColor: '#000', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 24 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});

export default Step3StyleType;
