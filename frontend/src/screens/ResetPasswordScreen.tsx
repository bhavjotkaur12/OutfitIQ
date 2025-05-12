import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axios from 'axios';

const ResetPasswordScreen = ({ route, navigation }: { route: any, navigation: any }) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { token } = route.params; // Pass the token via navigation

  const handleResetPassword = async () => {
    setLoading(true);
    try {
      await axios.post('http://10.0.2.2:5000/api/auth/reset-password', { token, password });
      Alert.alert('Success', 'Your password has been reset.');
      setPassword('');
      navigation.navigate('Login');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter new password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleResetPassword} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Resetting...' : 'Reset Password'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 24 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 16 },
  button: { backgroundColor: '#000', borderRadius: 8, padding: 14, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});

export default ResetPasswordScreen;
