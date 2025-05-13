import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
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
  const handleSubmit = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.post(
        'http://10.0.2.2:3000/api/user/style-quiz',
        { ...route.params },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert('Success', 'Your style profile has been saved!');
      navigation.getParent()?.navigate('VisualOutfitTest');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Review & Submit</Text>
      {/* You can display a summary of answers here */}
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  button: { backgroundColor: '#000', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 24 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});

export default QuizSummary;
