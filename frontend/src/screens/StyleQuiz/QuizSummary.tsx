import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import axios from 'axios';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';
import type { StyleQuizStackParamList } from '../../navigation/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

type QuizSummaryProps = {
  navigation: StackNavigationProp<StyleQuizStackParamList, 'QuizSummary'>;
  route: RouteProp<StyleQuizStackParamList, 'QuizSummary'>;
};

const QuizSummary: React.FC<QuizSummaryProps> = ({ navigation, route }) => {
  const { params } = route;

  const handleSubmit = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.post(
        'http://10.0.2.2:3000/api/user/style-quiz',
        { ...params },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert('Success', 'Your style profile has been saved!');
      navigation.getParent()?.navigate('VisualOutfitTest');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Something went wrong');
    }
  };

  const renderSection = (title: string, items: string[] | string | undefined) => {
    if (!items) return null;
    const displayItems = Array.isArray(items) ? items : [items];
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={styles.tagsContainer}>
          {displayItems.map((item, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{item}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.outerContainer}>
      <View style={styles.card}>
        <Text style={styles.progress}>Final Step</Text>
        <Text style={styles.title}>Review Your Style Profile</Text>
        <Text style={styles.subtitle}>Please review your selections before submitting</Text>

        {renderSection('Body Type', params?.bodyType)}
        {renderSection('Height', params?.height)}
        {renderSection('Weight', params?.weight)}
        {renderSection('Comfort Level', params?.comfort)}
        {renderSection('Activities', params?.activities)}
        {renderSection('Denim Preferences', params?.denim)}
        {renderSection('Outerwear Preferences', params?.outerwear)}
        {renderSection('Dress/Top Length', params?.dressTop)}

        <TouchableOpacity 
          style={styles.button} 
          onPress={handleSubmit}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Submit Style Profile</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#f6f6f6',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 24,
    margin: 16,
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
    marginBottom: 24,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  tagText: {
    color: '#333',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#000',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default QuizSummary;
