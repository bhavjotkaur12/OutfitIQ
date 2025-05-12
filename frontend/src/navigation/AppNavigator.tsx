import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
import StyleQuizStack from './StyleQuizStack';
import VisualOutfitTestScreen from '../screens/VisualOutfitTestScreen';
import type { AuthStackParamList, RootStackParamList } from './types';

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => (
  <Stack.Navigator initialRouteName="Login">
    <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
    <Stack.Screen name="Signup" component={SignupScreen} options={{ headerShown: false }} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />   
    <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    <Stack.Screen name="StyleQuiz" component={StyleQuizStack} options={{ headerShown: false }} />
    <Stack.Screen name="VisualOutfitTest" component={VisualOutfitTestScreen} />
  </Stack.Navigator>
);

export default AppNavigator; 