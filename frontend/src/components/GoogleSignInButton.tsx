import React from 'react';
import { Button, View, StyleSheet, TouchableOpacity } from 'react-native';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

// Configure Google Signin
GoogleSignin.configure({
  webClientId: '372715579287-2ifiesb9prh59s773rfe5phmjlqgudjq.apps.googleusercontent.com', // <-- Replace with your Web client ID from Firebase
});

interface GoogleSignInButtonProps {
  title?: string;
  style?: object;
  testID?: string;
  accessibilityLabel?: string;
}

const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({ 
  title = 'Sign in with Google', 
  style = {},
  testID,
  accessibilityLabel
}) => {
  const onGoogleButtonPress = async () => {
    try {
      const userInfo: any = await GoogleSignin.signIn();
      const idToken = userInfo.idToken;

      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      await auth().signInWithCredential(googleCredential);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.buttonContainer, style]}
      testID={testID}
      accessibilityLabel={accessibilityLabel}
    >
      <Button
        title={title}
        onPress={onGoogleButtonPress}
        color="#4285F4"
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    marginTop: 24, // Default margin, can be overridden
  },
});

export default GoogleSignInButton;
