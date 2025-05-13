import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { AuthStackParamList } from '../navigation/types';
import axios from 'axios';
import GoogleSignInButton from '../components/GoogleSignInButton';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SignupScreen = () => {
    const navigation = useNavigation<StackNavigationProp<AuthStackParamList>>();
    const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    setLoading(true);
    try {
      console.log('Attempting registration with:', { email, password });
      const response = await axios.post('http://10.0.2.2:3000/api/auth/register', { email, password });
      console.log('Registration response:', response.data);
      
      // Automatically log in after signup
      const loginRes = await axios.post('http://10.0.2.2:3000/api/auth/login', { email, password });
      console.log('Login response:', loginRes.data);
      
      await AsyncStorage.setItem('token', loginRes.data.token);
      setEmail('');
      setPassword('');
      navigation.navigate('ProfileInfo');
    } catch (err: any) {
      console.error('Full error:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      Alert.alert(
        'Error',
        `Registration failed: ${err.response?.data?.message || err.message || 'Unknown error'}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
      <Text style={styles.subtitle}>Create your OutfitIQ account</Text>
      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Text style={styles.helper}>Please enter your email address</Text>
      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Text style={styles.helper}>At least 8 characters</Text>
      <TouchableOpacity style={styles.signUpBtn} onPress={handleSignup} disabled={loading}>
        <Text style={styles.signUpText}>{loading ? 'Signing Up...' : 'Sign Up'}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.loginLink} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.loginLinkText}>Already have an account? Login</Text>
      </TouchableOpacity>
      <GoogleSignInButton title="Sign Up with Google" style={{ marginTop: 24 }} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff', justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: 16, textAlign: 'center', marginBottom: 24, color: '#888' },
  label: { fontSize: 16, fontWeight: '500', marginTop: 12 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginTop: 4 },
  helper: { fontSize: 12, color: '#888', marginBottom: 8 },
  signUpBtn: { backgroundColor: '#000', borderRadius: 8, padding: 14, marginTop: 24, alignItems: 'center' },
  signUpText: { color: '#fff', fontWeight: 'bold' },
  loginLink: { marginTop: 16, alignItems: 'center' },
  loginLinkText: { color: '#000', textDecorationLine: 'underline' },
});

export default SignupScreen; 