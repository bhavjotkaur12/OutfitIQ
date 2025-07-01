import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image, Modal, Alert } from 'react-native';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/types';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

type RecommendationScreenRouteProp = RouteProp<RootStackParamList, 'Recommendations'>;

interface Props {
  route: RecommendationScreenRouteProp;
  navigation: any;
}

// Define the outfit recommendation type
interface OutfitItems {
  top?: string;
  bottom?: string;
  shoes?: string;
  accessory?: string;
  dress?: string;
}

interface OutfitRecommendation {
  _id: string;
  prompt: string;
  image_url: string;
  outfit_items: OutfitItems;
  weather: string;
  activity: string;
  formality: string;
  gender: string;
}

interface OutfitRating {
  liked: boolean;
  owned: boolean;
}

const RecommendationScreen = ({ route, navigation }: Props) => {
  const [recommendations, setRecommendations] = useState<OutfitRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [ratings, setRatings] = useState<Record<string, OutfitRating>>({});
  const [selectedOutfit, setSelectedOutfit] = useState<OutfitRecommendation | null>(null);
  const { weather, activity, comfortLevel, formality } = route.params;
  const [userCloset, setUserCloset] = useState<string[]>([]);
  const [token, setToken] = useState('');

  const initializeToken = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      console.log('Token from AsyncStorage:', token ? 'Token exists' : 'No token found');
      
      if (!token) {
        Alert.alert(
          'Authentication Required',
          'Please log in to view recommendations',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Login')
            }
          ]
        );
        return null;
      }
      
      setToken(token);
      return token;
    } catch (error) {
      console.error('Error in initializeToken:', error);
      return null;
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      try {
        const token = await initializeToken();
        if (token && isMounted) {
          await Promise.all([
            getRecommendations(),
            fetchUserCloset()
          ]);
        }
      } catch (error) {
        console.error('Initialization error:', error);
      }
    };

    initialize();

    return () => {
      isMounted = false;
    };
  }, []);

  const getRecommendations = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('Sending request with params:', {
        weather,
        activity,
        comfortLevel,
        formality
      });

      const response = await fetch('http://10.0.2.2:3000/api/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          user_profile: {
            gender: 'female' // Get from user profile
          },
          preferences: {
            weather: {
              temp: weather?.temp,
              description: weather?.description
            },
            activity,
            comfortLevel,
            formality
          }
        }),
      });
      
      if (response.status === 401) {
        Alert.alert(
          'Session Expired',
          'Please log in again',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Login')
            }
          ]
        );
        return;
      }

      const responseText = await response.text();
      console.log('Raw response:', responseText);
      
      if (!response.ok) {
        console.error('Server error:', responseText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      try {
        const data = JSON.parse(responseText);
        console.log('Parsed recommendations:', data);
        
        if (Array.isArray(data)) {
          setRecommendations(data);
        } else if (data.error) {
          throw new Error(data.error);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
        throw new Error('Failed to parse server response');
      }
    } catch (error) {
      console.error('Error getting recommendations:', error);
      Alert.alert('Error', 'Failed to get recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserCloset = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.error('No auth token found');
        return;
      }

      const response = await fetch('http://10.0.2.2:3000/api/closet', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch closet');
      }

      const data = await response.json();
      setUserCloset(data.outfits.map((outfit: any) => outfit.outfitId));
    } catch (error) {
      console.error('Error fetching closet:', error);
      Alert.alert('Error', 'Failed to fetch your closet. Please try again.');
    }
  };

  const handleOutfitPress = (outfit: OutfitRecommendation) => {
    setSelectedOutfit(outfit);
  };

  const handleRating = async (outfitId: string, rating: Partial<OutfitRating>) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const newRatings = {
        ...ratings,
        [outfitId]: { ...ratings[outfitId], ...rating }
      };
      setRatings(newRatings);

      if (rating.owned) {
        const outfit = recommendations.find(r => r._id === outfitId);
        if (!outfit) {
          throw new Error('Outfit not found');
        }

        const response = await fetch('http://10.0.2.2:3000/api/closet/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ outfit })
        });

        const responseData = await response.json();
        
        if (!response.ok) {
          throw new Error(responseData.message || 'Failed to add to closet');
        }

        Alert.alert('Success', 'Added to your virtual closet!');
        await fetchUserCloset();
      } else if (rating.owned === false) {
        const response = await fetch(`http://10.0.2.2:3000/api/closet/remove/${outfitId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to remove from closet');
        }
        
        await fetchUserCloset();
      }
    } catch (error) {
      console.error('Error in handleRating:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to update closet. Please try again.');
    }
  };

  const handleRefresh = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      await initializeToken();
      return;
    }
    await getRecommendations();
  };

  const OutfitModal = () => (
    <Modal
      visible={selectedOutfit !== null}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setSelectedOutfit(null)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {selectedOutfit && (
            <>
              <Image
                source={{ uri: selectedOutfit.image_url }}
                style={styles.modalImage}
                resizeMode="cover"
              />
              <View style={styles.outfitItemsContainer}>
                {Object.entries(selectedOutfit.outfit_items).map(([key, value]) => (
                  value && <Text key={key} style={styles.itemText}>{key}: {value}</Text>
                ))}
              </View>
              <View style={styles.ratingContainer}>
                <TouchableOpacity 
                  style={[styles.ratingButton, ratings[selectedOutfit._id]?.liked && styles.ratingButtonActive]}
                  onPress={() => handleRating(selectedOutfit._id, { liked: !ratings[selectedOutfit._id]?.liked })}
                >
                  <Icon name={ratings[selectedOutfit._id]?.liked ? "heart" : "heart-outline"} size={24} color={ratings[selectedOutfit._id]?.liked ? "#ff4444" : "#000"} />
                  <Text style={styles.ratingText}>Like</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.ratingButton, ratings[selectedOutfit._id]?.owned && styles.ratingButtonActive]}
                  onPress={() => handleRating(selectedOutfit._id, { owned: !ratings[selectedOutfit._id]?.owned })}
                >
                  <Icon name={ratings[selectedOutfit._id]?.owned ? "hanger" : "hanger-off"} size={24} color={ratings[selectedOutfit._id]?.owned ? "#4CAF50" : "#000"} />
                  <Text style={styles.ratingText}>I Have This</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setSelectedOutfit(null)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <View style={styles.preferencesContainer}>
        <Text style={styles.subHeader}>Based on:</Text>
        <Text style={styles.preferenceText}>{weather?.temp}°C, {weather?.description}</Text>
        <Text style={styles.preferenceText}>{activity} • {formality}</Text>
        <Text style={styles.preferenceText}>Comfort: {comfortLevel}</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#000" style={styles.loader} />
      ) : (
        <ScrollView contentContainerStyle={styles.outfitsGrid}>
          {recommendations.map((outfit) => (
            <TouchableOpacity
              key={outfit._id}
              style={styles.outfitCard}
              onPress={() => handleOutfitPress(outfit)}
            >
              <Image
                source={{ uri: outfit.image_url }}
                style={styles.outfitImage}
                resizeMode="cover"
              />
              {ratings[outfit._id]?.liked && (
                <View style={styles.likedBadge}>
                  <Icon name="heart" size={16} color="#fff" />
                </View>
              )}
              {ratings[outfit._id]?.owned && (
                <View style={styles.ownedBadge}>
                  <Icon name="hanger" size={16} color="#fff" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <TouchableOpacity 
        style={styles.refreshButton}
        onPress={handleRefresh}
      >
        <Text style={styles.refreshButtonText}>Refresh</Text>
      </TouchableOpacity>

      <OutfitModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  preferencesContainer: {
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  subHeader: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  preferenceText: {
    fontSize: 16,
    marginBottom: 2,
  },
  outfitsGrid: {
    padding: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  outfitCard: {
    width: '48%',
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 3,
    position: 'relative',
  },
  outfitImage: {
    width: '100%',
    aspectRatio: 3/4,
  },
  likedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#ff4444',
    borderRadius: 12,
    padding: 4,
  },
  ownedBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: '90%',
  },
  modalImage: {
    width: '100%',
    height: 400,
    borderRadius: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  ratingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  ratingButtonActive: {
    backgroundColor: '#f0f0f0',
  },
  ratingText: {
    marginLeft: 8,
    fontSize: 16,
  },
  closeButton: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#000',
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  refreshButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: '#000',
    padding: 16,
    borderRadius: 30,
    elevation: 4,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  outfitItemsContainer: {
    marginTop: 12,
  },
  itemText: {
    fontSize: 14,
    marginLeft: 8,
    marginBottom: 4,
  },
  loader: {
    marginVertical: 20,
  },
});

export default RecommendationScreen;
