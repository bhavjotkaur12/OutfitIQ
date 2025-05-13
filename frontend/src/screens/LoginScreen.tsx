import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { AuthStackParamList } from '../navigation/types';
import axios from 'axios';
import GoogleSignInButton from '../components/GoogleSignInButton';

const LoginScreen = () => {
  const navigation = useNavigation<StackNavigationProp<AuthStackParamList>>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await axios.post('http://10.0.2.2:3000/api/auth/login', {
        email,
        password,
      });
      Alert.alert('Success', 'Login successful!');
      setEmail('');
      setPassword('');
      // Navigate to the next screen (e.g., Home)
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/logo.png')}
        style={styles.logo}
      />
      <Text style={styles.title}>OutfitIQ</Text>
      <Text style={styles.subtitle}>Your style companion</Text>
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
      <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
        <Text style={{ color: '#4285F4', textAlign: 'right', marginBottom: 16 }}>Forgot Password?</Text>
      </TouchableOpacity>
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.iconButton} onPress={handleLogin} disabled={loading}>
          <Text>🔒</Text>
          <Text>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Signup')}>
          <Text>✉️</Text>
          <Text>Sign Up</Text>
        </TouchableOpacity>
      </View>
      <GoogleSignInButton />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff', justifyContent: 'center' },
  logo: {
    width: 80,
    height: 80,
    alignSelf: 'center',
    marginBottom: 12,
  },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: 16, textAlign: 'center', marginBottom: 24, color: '#888' },
  label: { fontSize: 16, fontWeight: '500', marginTop: 12 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginTop: 4 },
  helper: { fontSize: 12, color: '#888', marginBottom: 8 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 16 },
  iconButton: { alignItems: 'center', flex: 1, marginHorizontal: 8, padding: 12, borderWidth: 1, borderColor: '#eee', borderRadius: 8 },
});

export default LoginScreen; 