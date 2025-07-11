// frontend/src/screens/StyleBoostScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { RouteProp } from '@react-navigation/native';

type StyleBoostScreenRouteProp = RouteProp<RootStackParamList, 'StyleBoost'>;

interface Props {
  route: StyleBoostScreenRouteProp;
}

interface StyleBoost {
  _id: string;
  text: string;
  completed: boolean;
  rating?: number;
  completedAt?: Date; // Added for completedAt
  weatherContext?: { // Added for weatherContext
    temperature: number;
    condition: string;
    recommendation: string;
  };
}

const StyleBoostScreen: React.FC<Props> = ({ route }) => {
  const { weather } = route.params;
  const [dailyBoost, setDailyBoost] = useState<StyleBoost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDailyBoost();
  }, []);

  const fetchDailyBoost = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get('http://10.0.2.2:3000/api/style-boost/daily', {
        headers: { 
          Authorization: `Bearer ${token}` 
        },
        params: {
          weather: weather // Pass weather data to backend
        }
      });
      setDailyBoost(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch daily style boost');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!dailyBoost) return;
    
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.post(
        `http://10.0.2.2:3000/api/style-boost/${dailyBoost._id}/complete`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local state
      setDailyBoost(prev => prev ? { ...prev, completed: true, completedAt: new Date() } : null);
    } catch (error) {
      Alert.alert('Error', 'Failed to mark boost as complete');
    }
  };

  const handleRate = async (rating: number) => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.post(
        `http://10.0.2.2:3000/api/style-boost/${dailyBoost?._id}/rate`,
        { rating },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDailyBoost(prev => prev ? { ...prev, rating } : null);
    } catch (error) {
      Alert.alert('Error', 'Failed to rate boost');
    }
  };

  const generateWeatherRecommendation = (weather: any) => {
    const temp = weather.temp;
    const condition = weather.description.toLowerCase();

    if (condition.includes('rain')) {
      return "Don't forget your raincoat or umbrella!";
    } else if (temp < 10) {
      return "Bundle up with warm layers today!";
    } else if (temp > 25) {
      return "Opt for light, breathable fabrics today!";
    } else {
      return "Perfect weather for a versatile outfit! Consider light layers that you can adjust throughout the day.";
    }
  };

  // Update the render to show completed state
  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Today's Style Boost</Text>
        
        <Text style={styles.boostText}>
          {dailyBoost?.text || "Elevate your casual look with a structured blazer"}
        </Text>

        {/* Weather Alert Section - Always show if weather is available */}
        {weather && (
          <View style={styles.weatherAlert}>
            <View style={styles.weatherHeader}>
              <Icon name="wb-sunny" size={24} color="#FFD700" />
              <Text style={styles.weatherTitle}>Weather Style Alert</Text>
            </View>
            <Text style={styles.weatherText}>
              {weather.temp}°C - {weather.description}
            </Text>
            <Text style={styles.weatherRecommendation}>
              {generateWeatherRecommendation(weather)}
            </Text>
          </View>
        )}

        {/* Show different button based on completion status */}
        {dailyBoost?.completed ? (
          <View style={styles.completedContainer}>
            <Icon name="check-circle" size={24} color="#4CAF50" />
            <Text style={styles.completedText}>Completed Today!</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.completeButton}
            onPress={handleComplete}
          >
            <Text style={styles.completeButtonText}>Mark as Complete</Text>
          </TouchableOpacity>
        )}

        {/* Rating section only shows if not completed */}
        {!dailyBoost?.completed && (
          <View style={styles.ratingSection}>
            <Text style={styles.ratingTitle}>Rate this boost:</Text>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => handleRate(star)}
                  style={styles.starButton}
                >
                  <Icon
                    name={star <= (dailyBoost?.rating || 0) ? 'star' : 'star-outline'}
                    size={32}
                    color="#FFD700"
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  boostText: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 28,
    color: '#333',
  },
  // Add these missing styles for WeatherContext component
  weatherContainer: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
    marginBottom: 24,
  },
  weatherTemp: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 8,
  },
  weatherCondition: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  // Existing weather-related styles
  weatherAlert: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginVertical: 16,
  },
  weatherHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  weatherTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  weatherText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  weatherRecommendation: {
    fontSize: 15,
    color: '#444',
    fontStyle: 'italic',
    marginTop: 8,
  },
  completeButton: {
    backgroundColor: '#000',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 24,
  },
  completedButton: {
    backgroundColor: '#4CAF50',
  },
  completeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  ratingSection: {
    alignItems: 'center',
  },
  ratingTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  starButton: {
    padding: 4,
  },
  completedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5E9',
    padding: 16,
    borderRadius: 12,
    marginVertical: 16,
    gap: 8
  },
  completedText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '600'
  }
});

export default StyleBoostScreen;

