import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
import StyleQuizStack from './StyleQuizStack';
import VisualOutfitTestScreen from '../screens/VisualOutfitTestScreen';
import ProfileInfoScreen from '../screens/ProfileInfoScreen';
import ProfileScreen from '../screens/ProfileScreen';
import HomeScreen from '../screens/HomeScreen';
import RecommendationScreen from '../screens/RecommendationScreen';
import VirtualClosetScreen from '../screens/VirtualClosetScreen';
import type { AuthStackParamList, RootStackParamList } from './types';
import StyleBoostScreen from '../screens/StyleBoostScreen';

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => (
  <Stack.Navigator initialRouteName="Login">
    <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
    <Stack.Screen name="Signup" component={SignupScreen} options={{ headerShown: false }} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />   
    <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    <Stack.Screen name="StyleQuiz" component={StyleQuizStack} options={{ headerShown: false }} />
    <Stack.Screen name="VisualOutfitTest" component={VisualOutfitTestScreen} options={{title: 'Visual Outfit Test'}} />
    <Stack.Screen name="ProfileInfo" component={ProfileInfoScreen} options={{title: 'Profile Information'}} />
    <Stack.Screen name="Profile" component={ProfileScreen} options={{title: 'Profile'}} />
    <Stack.Screen name="Home" component={HomeScreen} options={{headerShown: false}} />
    <Stack.Screen 
      name="Recommendations" 
      component={RecommendationScreen} 
      options={{
        title: 'Recommendations',
        headerShown: true
      }} 
    />
    <Stack.Screen 
      name="VirtualCloset" 
      component={VirtualClosetScreen}
      options={{
        headerShown: false
      }}
    />
    <Stack.Screen 
      name="StyleBoost" 
      component={StyleBoostScreen}
      options={{
        title: 'Daily Style Boost',
        headerShown: true,
        // Add custom header styling
        headerStyle: {
          backgroundColor: '#fff',
        },
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        
      }}
    />
  </Stack.Navigator>
);

export default AppNavigator; 