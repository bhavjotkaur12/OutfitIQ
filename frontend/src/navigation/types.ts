export type AuthStackParamList = {
    Login: undefined;
    Signup: undefined;
    ForgotPassword: undefined;
    ResetPassword: { token: string } | undefined;
    StyleQuiz: undefined;
  };

export type StyleQuizStackParamList = {
  Step1BodyType: undefined;
  Step2ColorPreferences: {
    height: string;
    build: string;
    bodyType: string;
    fit: string;
  };
  Step3StyleType: {
    height: string;
    build: string;
    bodyType: string;
    fit: string;
    preferredColors: string[];
    avoidColors: string;
  };
  Step4ComfortLifestyle: any; // Add correct types as you go
  Step5OutfitPreferences: any;
  QuizSummary: any;
};