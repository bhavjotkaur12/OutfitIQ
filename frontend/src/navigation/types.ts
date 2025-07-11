import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LikedOutfit } from '../types/outfit';

export type AuthStackParamList = {
    Login: undefined;
    Signup: undefined;
    ForgotPassword: undefined;
    ResetPassword: { token: string } | undefined;
    StyleQuiz: undefined;
    ProfileInfo: undefined;
    Profile: undefined;
    Home: undefined;
  };

type StyleQuizParams = {
  weight: string;
  gender: string;
  styleGoals: string;
  location: string;
  age: string;
  firstName: string;
  lastName: string;
  height?: string;
  build?: string;
  bodyType?: string;
  fit?: string;
  preferredColors?: string[];
  avoidColors?: string;
  styleTypes?: string[];
  brands?: string;
  influences?: string;
  comfort?: string;
  activities?: string[];
  denim?: string[];
  outerwear?: string[];
  dressTop?: string[];
};

export type StyleQuizStackParamList = {
  Step1BodyType: StyleQuizParams;
  Step2ColorPreferences: StyleQuizParams;
  Step3StyleType: StyleQuizParams;
  Step4ComfortLifestyle: StyleQuizParams;
  Step5OutfitPreferences: StyleQuizParams;
  QuizSummary: StyleQuizParams;
};

export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token: string } | undefined;
  StyleQuiz: {
    screen?: keyof StyleQuizStackParamList;
    params?: Partial<StyleQuizStackParamList[keyof StyleQuizStackParamList]>;
  };
  VisualOutfitTest: undefined;
  StyleProfileSummary: undefined;
  ProfileInfo: undefined;
  Profile: undefined;
  Home: undefined;
  Recommendations: {
    weather?: any;
    activity?: string;
    comfortLevel?: string;
    formality?: string;
    selectedOutfit?: LikedOutfit;
  };
  VirtualCloset: undefined;
  StyleBoost: {
    weather: {
      temp: number;
      description: string;
      feelsLike: number;
      icon: string;
      city: string;
      region: string;
    } | null;
  };
};

// Make sure to export this type
export type ProfileScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Profile'
>;