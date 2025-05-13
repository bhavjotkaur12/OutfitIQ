import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Modal, Pressable, Platform } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/types';

const GENDER_OPTIONS = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];
const BODY_TYPE_OPTIONS = ['Petite', 'Athletic', 'Curvy', 'Tall', 'Average', 'Other'];
const STYLE_GOALS_OPTIONS = ['Find my style', 'Refresh my wardrobe', 'Get outfit inspiration', 'Other'];
const WEIGHT_OPTIONS = [
  'Under 120 lbs',
  '120-140 lbs',
  '141-160 lbs',
  '161-180 lbs',
  '181-200 lbs',
  'Over 200 lbs'
];

type ProfileInfoScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'ProfileInfo'>;
};

const ProfileInfoScreen: React.FC<ProfileInfoScreenProps> = ({ navigation }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [location, setLocation] = useState('');
  const [styleGoals, setStyleGoals] = useState('');
  const [weight, setWeight] = useState('');
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [showStyleGoalsModal, setShowStyleGoalsModal] = useState(false);
  const [showWeightModal, setShowWeightModal] = useState(false);

  const handleSubmit = async () => {
    if (!firstName || !lastName || !age || !gender || !location || !styleGoals || !weight) {
      Alert.alert('Please fill all fields');
      return;
    }
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.post(
        'http://10.0.2.2:3000/api/user/profile-info',
        { firstName, lastName, age, gender, location, styleGoals, weight },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigation.navigate('StyleQuiz', {
        screen: 'Step1BodyType',
        params: {
          weight,
          gender,
          styleGoals,
          location,
          age,
          firstName,
          lastName,
        }
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to save profile info');
    }
  };

  return (
    <View style={styles.outerContainer}>
      <View style={styles.card}>
        <Text style={styles.header}>Tell us about yourself</Text>
        <Text style={styles.subtitle}>This helps us personalize your style recommendations</Text>
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
          placeholder="Location (City, Country)"
          value={location}
          onChangeText={setLocation}
        />

        {/* Add Weight Selector after Location input */}
        <Pressable style={styles.input} onPress={() => setShowWeightModal(true)}>
          <Text style={weight ? styles.inputText : styles.placeholder}>
            {weight || 'Select Weight Range'}
          </Text>
        </Pressable>

        {/* Gender Selector */}
        <Pressable style={styles.input} onPress={() => setShowGenderModal(true)}>
          <Text style={gender ? styles.inputText : styles.placeholder}>
            {gender || 'Select Gender'}
          </Text>
        </Pressable>
        {/* Style Goals Selector */}
        <Pressable style={styles.input} onPress={() => setShowStyleGoalsModal(true)}>
          <Text style={styleGoals ? styles.inputText : styles.placeholder}>
            {styleGoals || 'Select Style Goal'}
          </Text>
        </Pressable>

        {/* Gender Modal */}
        <Modal
          visible={showGenderModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowGenderModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalHeader}>Select Gender</Text>
              {GENDER_OPTIONS.map(option => (
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
              <Pressable style={styles.cancelButton} onPress={() => setShowGenderModal(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
        {/* Style Goals Modal */}
        <Modal
          visible={showStyleGoalsModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowStyleGoalsModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalHeader}>Select Style Goal</Text>
              {STYLE_GOALS_OPTIONS.map(option => (
                <Pressable
                  key={option}
                  style={styles.optionButton}
                  onPress={() => {
                    setStyleGoals(option);
                    setShowStyleGoalsModal(false);
                  }}
                >
                  <Text style={styles.optionText}>{option}</Text>
                </Pressable>
              ))}
              <Pressable style={styles.cancelButton} onPress={() => setShowStyleGoalsModal(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        {/* Add Weight Modal */}
        <Modal
          visible={showWeightModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowWeightModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalHeader}>Select Weight Range</Text>
              {WEIGHT_OPTIONS.map(option => (
                <Pressable
                  key={option}
                  style={styles.optionButton}
                  onPress={() => {
                    setWeight(option);
                    setShowWeightModal(false);
                  }}
                >
                  <Text style={styles.optionText}>{option}</Text>
                </Pressable>
              ))}
              <Pressable style={styles.cancelButton} onPress={() => setShowWeightModal(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: { flex: 1, backgroundColor: '#f6f6f6', justifyContent: 'center', alignItems: 'center' },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    alignSelf: 'center',
  },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 6, textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#888', marginBottom: 18, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 12, backgroundColor: '#fafafa' },
  inputText: { color: '#000' },
  placeholder: { color: '#999' },
  button: { backgroundColor: '#222', borderRadius: 8, padding: 16, alignItems: 'center', marginTop: 12 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  modalContainer: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  modalContent: { backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  modalHeader: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  optionButton: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
  optionText: { fontSize: 16, textAlign: 'center' },
  cancelButton: { marginTop: 10, padding: 15 },
  cancelText: { color: 'red', textAlign: 'center', fontSize: 16 },
});

export default ProfileInfoScreen;