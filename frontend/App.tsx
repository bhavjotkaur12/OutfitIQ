/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import firebase from '@react-native-firebase/app';

// Usually, you do NOT need to call initializeApp() with @react-native-firebase
// If you do, only do it if (!firebase.apps.length) { ... }

const App = () => {
  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
};

export default App;
