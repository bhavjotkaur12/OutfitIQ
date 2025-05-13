import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput } from 'react-native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';
import type { StyleQuizStackParamList } from '../../navigation/types';

const STYLES = [
  'Casual', 'Formal', 'Sporty', 'Minimalistic', 'Bohemian', 'Streetwear', 'Preppy', 'Vintage',
  'Edgy', 'Chic', 'Glam', 'Business', 'Artsy', 'Classic', 'Trendy', 'Grunge', 'Punk', 'Athleisure'
];

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
      ...(route.params || {}),
      styleTypes,
      brands,
      influences,
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.outerContainer}>
      <View style={styles.card}>
        <Text style={styles.progress}>Step 3 of 5</Text>
        <Text style={styles.title}>Style Type & Influences</Text>
        <Text style={styles.subtitle}>Pick all the styles that resonate with you</Text>
        <Text style={styles.label}>Select Style Types</Text>
        <View style={styles.row}>
          {STYLES.map(style => (
            <TouchableOpacity
              key={style}
              style={[styles.option, styleTypes.includes(style) && styles.selected]}
              onPress={() => toggleStyle(style)}
              activeOpacity={0.8}
            >
              <Text style={styleTypes.includes(style) ? styles.selectedText : styles.optionText}>{style}</Text>
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
        <TouchableOpacity
          style={[
            styles.button,
            styleTypes.length === 0 && styles.buttonDisabled
          ]}
          onPress={handleNext}
          disabled={styleTypes.length === 0}
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

export default Step3StyleType;
