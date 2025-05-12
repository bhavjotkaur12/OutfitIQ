import React from 'react';
import { Button, View, StyleSheet } from 'react-native';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

// Configure Google Signin
GoogleSignin.configure({
  webClientId: '372715579287-2ifiesb9prh59s773rfe5phmjlqgudjq.apps.googleusercontent.com', // <-- Replace with your Web client ID from Firebase
});

const GoogleSignInButton = ({ title = "Sign In with Google", style = {} }) => {
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
    <View style={[styles.buttonContainer, style]}>
      <Button
        title={title}
        onPress={onGoogleButtonPress}
        color="#4285F4"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    marginTop: 24, // Default margin, can be overridden
  },
});

export default GoogleSignInButton;
