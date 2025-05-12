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
    <Stack.Screen name="Step2ColorPreferences" component={Step2ColorPreferences} />
    <Stack.Screen name="Step3StyleType" component={Step3StyleType} />
    <Stack.Screen name="Step4ComfortLifestyle" component={Step4ComfortLifestyle} />
    <Stack.Screen name="Step5OutfitPreferences" component={Step5OutfitPreferences} />
    <Stack.Screen name="QuizSummary" component={QuizSummary} />
  </Stack.Navigator>
);

export default StyleQuizStack;
