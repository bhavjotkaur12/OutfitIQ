import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Step1BodyType from '../screens/StyleQuiz/Step1BodyType';
import Step2ColorPreferences from '../screens/StyleQuiz/Step2ColorPreferences';
import Step3StyleType from '../screens/StyleQuiz/Step3StyleType';
import Step4ComfortLifestyle from '../screens/StyleQuiz/Step4ComfortLifestyle';
import Step5OutfitPreferences from '../screens/StyleQuiz/Step5OutfitPreferences';
import QuizSummary from '../screens/StyleQuiz/QuizSummary';
import type { StyleQuizStackParamList } from './types';

const Stack = createStackNavigator<StyleQuizStackParamList>();

const StyleQuizStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="Step1BodyType" component={Step1BodyType} options={{ title: 'Style Quiz' }} />
    <Stack.Screen name="Step2ColorPreferences" component={Step2ColorPreferences} options={{title: 'Color Preferences'}} />
    <Stack.Screen name="Step3StyleType" component={Step3StyleType} options={{title: 'Style Type'}} />
    <Stack.Screen name="Step4ComfortLifestyle" component={Step4ComfortLifestyle} options={{title: 'Comfort Lifestyle'}} />
    <Stack.Screen name="Step5OutfitPreferences" component={Step5OutfitPreferences} options={{title: 'Outfit Preferences'}} />
    <Stack.Screen name="QuizSummary" component={QuizSummary} options={{title: 'Quiz Summary'}} />
  </Stack.Navigator>
);

export default StyleQuizStack;
