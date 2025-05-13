import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Modal, Pressable } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/types'; // Adjust the path as needed

type ProfileInfoScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'ProfileInfo'>;
};

const GENDER_OPTIONS = ['Male', 'Female', 'Prefer not to say'];

const ProfileInfoScreen: React.FC<ProfileInfoScreenProps> = ({ navigation }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [showGenderModal, setShowGenderModal] = useState(false);
  // Add more fields as needed

  const handleSubmit = async () => {
    if (!firstName || !lastName || !age || !gender) {
      Alert.alert('Please fill all fields');
      return;
    }
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.post(
        'http://10.0.2.2:3000/api/user/profile-info',
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
      
      {/* Gender Selector */}
      <Pressable 
        style={styles.input} 
        onPress={() => setShowGenderModal(true)}
      >
        <Text style={gender ? styles.inputText : styles.placeholder}>
          {gender || 'Select Gender'}
        </Text>
      </Pressable>

      {/* Gender Selection Modal */}
      <Modal
        visible={showGenderModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowGenderModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Select Gender</Text>
            {GENDER_OPTIONS.map((option) => (
              <Pressable
                key={option}
                style={styles.optionButton}
                onPress={() => {
                  setGender(option);
                  setShowGenderModal(false);
                }}
              >
                <Text style={styles.optionText}>{option}</Text>
              </Pressable>
            ))}
            <Pressable
              style={styles.cancelButton}
              onPress={() => setShowGenderModal(false)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#fff' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, alignSelf: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 12, justifyContent: 'center' },
  inputText: {
    color: '#000'
  },
  placeholder: {
    color: '#999'
  },
  button: { backgroundColor: '#222', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 24 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center'
  },
  optionButton: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  optionText: {
    fontSize: 16,
    textAlign: 'center'
  },
  cancelButton: {
    marginTop: 10,
    padding: 15
  },
  cancelText: {
    color: 'red',
    textAlign: 'center',
    fontSize: 16
  }
});

export default ProfileInfoScreen;
