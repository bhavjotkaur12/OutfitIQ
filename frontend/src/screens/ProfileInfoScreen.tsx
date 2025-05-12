import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/types'; // Adjust the path as needed

type ProfileInfoScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'ProfileInfo'>;
};

const ProfileInfoScreen: React.FC<ProfileInfoScreenProps> = ({ navigation }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  // Add more fields as needed

  const handleSubmit = async () => {
    if (!firstName || !lastName || !age || !gender) {
      Alert.alert('Please fill all fields');
      return;
    }
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.post(
        'http://10.0.2.2:5000/api/user/profile-info',
        { firstName, lastName, age, gender },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigation.navigate('StyleQuiz');
    } catch (error) {
      Alert.alert('Error', 'Failed to save profile info');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Tell us about yourself</Text>
      <TextInput
        style={styles.input}
        placeholder="First Name"
        value={firstName}
        onChangeText={setFirstName}
      />
      <TextInput
        style={styles.input}
        placeholder="Last Name"
        value={lastName}
        onChangeText={setLastName}
      />
      <TextInput
        style={styles.input}
        placeholder="Age"
        value={age}
        onChangeText={setAge}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Gender"
        value={gender}
        onChangeText={setGender}
      />
      {/* Add more fields as needed */}
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#fff' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, alignSelf: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 12 },
  button: { backgroundColor: '#222', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 24 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});

export default ProfileInfoScreen;
