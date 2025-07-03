import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
  Image,
  Modal,
  Alert,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from '@react-native-community/geolocation';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { OutfitItems, RawOutfit, LikedOutfit } from '../types/outfit';

// Add this interface at the top of your file, after imports
interface WeatherData {
  temp: number;
  feelsLike: number;
  description: string;
  icon: string;
  city: string;
  region: string;
}

const HomeScreen = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [comfortLevel, setComfortLevel] = useState('');
  const [selectedOccasion, setSelectedOccasion] = useState('');
  const [loading, setLoading] = useState(true);
  const [userOccasions, setUserOccasions] = useState<string[]>([]);
  const [location, setLocation] = useState<{lat: number; lon: number} | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [formality, setFormality] = useState('');
  const [likedOutfits, setLikedOutfits] = useState<LikedOutfit[]>([]);
  const [loadingLikedOutfits, setLoadingLikedOutfits] = useState(false);
  const [selectedOutfit, setSelectedOutfit] = useState<LikedOutfit | null>(null);
  const [showOutfitDetail, setShowOutfitDetail] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // Updated emoji mapping with more relevant icons
  const occasionEmojis: { [key: string]: string } = {
    'Work': '💼',
    'Gym': '🏋️‍♂️',
    'Casual Outings': '🌅',
    'Outdoor': '🏃‍♂️',
    'Lounging': '🛋️',
  };

  // Replace with your actual API key from OpenWeatherMap
  const WEATHER_API_KEY = '446f29068ac15e57c66945a9dc76cb77';

  const requestLocationPermission = async () => {
    if (Platform.OS === 'ios') {
      Geolocation.requestAuthorization();
      getLocation();
    } else {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: "Location Permission",
            message: "We need your location to get weather information",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK"
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          getLocation();
        }
      } catch (err) {
        console.warn(err);
      }
    }
  };

  const getLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        setLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude
        });
      },
      error => console.log(error),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );
  };

  const fetchWeather = async () => {
    if (!location) return;
    
    setLoadingWeather(true);
    try {
      // First, get location details using reverse geocoding
      const geoResponse = await axios.get(
        `https://api.openweathermap.org/geo/1.0/reverse?lat=${location.lat}&lon=${location.lon}&limit=1&appid=${WEATHER_API_KEY}`
      );
      
      const regionData = geoResponse.data[0];
      const region = regionData.state || regionData.country || 'Unknown';

      // Then get weather data
      const weatherResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lon}&appid=${WEATHER_API_KEY}&units=metric`
      );
      
      const weatherData: WeatherData = {
        temp: Math.round(weatherResponse.data.main.temp),
        feelsLike: Math.round(weatherResponse.data.main.feels_like),
        description: weatherResponse.data.weather[0].main,
        icon: weatherResponse.data.weather[0].icon,
        city: weatherResponse.data.name,
        region: region.includes('Province') ? region.split(' ')[0] : region 
      };
      
      console.log('Location data:', geoResponse.data[0]); 
      console.log('Weather data:', weatherResponse.data); 
      
      setWeather(weatherData);
    } catch (error) {
      console.error('Error fetching data:', error);
      setWeather(null);
    } finally {
      setLoadingWeather(false);
    }
  };

  const fetchLikedOutfits = async () => {
    setLoadingLikedOutfits(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.log('No token found');
        return;
      }

      console.log('Fetching liked outfits...');
      const response = await fetch('http://10.0.2.2:3000/api/closet/liked', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        console.error('Failed to fetch liked outfits:', response.status);
        throw new Error('Failed to fetch liked outfits');
      }

      const data = await response.json();
      console.log('Raw liked outfits data:', data);
      
      if (data.likedOutfits && Array.isArray(data.likedOutfits)) {
        // Use a Map to ensure unique outfits by outfitId
        const uniqueOutfits = new Map();
        
        data.likedOutfits.forEach((outfit: RawOutfit) => {
          const outfitId = outfit.outfitId || outfit._id || '';
          if (!uniqueOutfits.has(outfitId)) {
            let fullImageUrl = outfit.image_url;
            if (fullImageUrl && !fullImageUrl.startsWith('http')) {
              fullImageUrl = `http://10.0.2.2:3000${fullImageUrl.startsWith('/') ? '' : '/'}${fullImageUrl}`;
            }
            
            uniqueOutfits.set(outfitId, {
              outfitId,
              image_url: fullImageUrl,
              outfit_items: outfit.outfit_items || {},
              likedAt: new Date(outfit.likedAt || outfit.dateAdded || Date.now()),
              activity: outfit.activity,
              weather: outfit.weather,
              formality: outfit.formality
            });
          }
        });

        const outfits = Array.from(uniqueOutfits.values());
        console.log('Final mapped outfits:', outfits);
        setLikedOutfits(outfits);
      } else {
        console.log('No liked outfits found or invalid data format');
        setLikedOutfits([]);
      }
    } catch (error) {
      console.error('Error fetching liked outfits:', error);
      setLikedOutfits([]);
    } finally {
      setLoadingLikedOutfits(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
    fetchLikedOutfits();
  }, []);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  useEffect(() => {
    if (location) {
      fetchWeather();
    }
  }, [location]);

  useFocusEffect(
    React.useCallback(() => {
      console.log('Home screen focused - fetching liked outfits');
      fetchLikedOutfits();
    }, [])
  );

  const fetchUserProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      console.log('Token from AsyncStorage:', token);
      const response = await axios.get('http://10.0.2.2:3000/api/user/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Full response data:', response.data);
      
      // Access activities directly from the response
      const activities = response.data.activities || [];
      console.log('Activities:', activities);
      
      setUserOccasions(activities);
      setLoading(false);
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response data:', error.response?.data);
        console.error('Response status:', error.response?.status);
      }
      setLoading(false);
    }
  };

  const getRecommendations = () => {
    // Navigate to recommendations screen with the selected preferences
    navigation.navigate('Recommendations', {
      weather: weather,
      activity: selectedOccasion,
      comfortLevel: comfortLevel,
      formality: formality,
    });
  };

  // Add navigation handler for closet icon
  const handleClosetPress = () => {
    navigation.navigate('VirtualCloset'); // Make sure 'VirtualCloset' is defined in your navigation types
  };

  const handleUnlike = async (outfitId: string) => {
    try {
      console.log('Attempting to unlike outfit:', outfitId);
      // Remove any quotes or ObjectId wrapper if present
      const cleanOutfitId = outfitId.replace(/^ObjectId\(['"](.+)['"]\)$/, '$1');
      
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`http://10.0.2.2:3000/api/closet/like/${cleanOutfitId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Unlike response status:', response.status);
      if (!response.ok) {
        throw new Error('Failed to unlike outfit');
      }

      const data = await response.json();
      console.log('Unlike response data:', data);

      if (response.ok) {
        setLikedOutfits(prev => prev.filter(outfit => outfit.outfitId !== outfitId));
      }
    } catch (error) {
      console.error('Error unliking outfit:', error);
      Alert.alert('Error', 'Failed to unlike outfit');
    }
  };

  const handleAddToCloset = async (outfit: LikedOutfit) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch('http://10.0.2.2:3000/api/closet/add', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ outfit })
      });

      if (response.ok) {
        Alert.alert('Success', 'Outfit added to your closet!');
      }
    } catch (error) {
      console.error('Error adding to closet:', error);
      Alert.alert('Error', 'Failed to add outfit to closet');
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" style={styles.loader} />;
  }

  return (
    <View style={styles.container}>
      {/* Custom Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Outfit IQ</Text>
        <TouchableOpacity 
          style={styles.iconButton}
          onPress={handleClosetPress}  // Add the onPress handler
        >
          <Icon name="checkroom" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Weather Card */}
        <View style={styles.weatherContainer}>
          {loadingWeather ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : weather ? (
            <LinearGradient
              colors={['#4880EC', '#019CAD']}
              style={styles.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.weatherRow}>
                <View style={styles.leftColumn}>
                  <Text style={styles.temperature}>{weather.temp}°</Text>
                  <Text style={styles.feelsLike}>
                    Feels like {weather.feelsLike}°
                  </Text>
                </View>
                <View style={styles.rightColumn}>
                  <Image 
                    source={{ 
                      uri: `https://openweathermap.org/img/wn/${weather.icon}@2x.png` 
                    }}
                    style={styles.weatherIcon}
                    resizeMode="contain"
                  />
                  <Text style={styles.weatherMain}>{weather.description}</Text>
                  <Text style={styles.location}>{weather.city},</Text>
                  <Text style={styles.location}>{weather.region}</Text>
                </View>
              </View>
              <Text style={styles.updateTime}>Updated just now</Text>
            </LinearGradient>
          ) : (
            <Text style={styles.errorText}>Unable to fetch weather</Text>
          )}
        </View>

        {/* Liked Outfits Section */}
        {loadingLikedOutfits ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Liked Outfits</Text>
            <ActivityIndicator size="small" color="#000" />
          </View>
        ) : likedOutfits && likedOutfits.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Liked Outfits</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.likedOutfitsScroll}
            >
              {likedOutfits.map((outfit) => (
                <View key={outfit.outfitId} style={styles.likedOutfitCard}>
                  <TouchableOpacity 
                    style={styles.outfitCardContent}
                    onPress={() => {
                      setSelectedOutfit(outfit);
                      setShowOutfitDetail(true);
                    }}
                  >
                    {outfit.image_url ? (
                      <Image
                        source={{ uri: outfit.image_url }}
                        style={styles.likedOutfitImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={[styles.likedOutfitImage, styles.placeholderContainer]}>
                        <Icon name="image" size={40} color="#999" />
                        <Text style={styles.placeholderText}>No Image</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.likedOutfitOverlay}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleUnlike(outfit.outfitId);
                    }}
                  >
                    <Icon name="favorite" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Liked Outfits</Text>
            <Text style={styles.noOutfitsText}>No liked outfits yet</Text>
          </View>
        )}

        {/* Activities Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose Activity</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.activitiesScroll}
          >
            {userOccasions.map((occasion) => (
              <TouchableOpacity
                key={occasion}
                style={[
                  styles.activityCard,
                  selectedOccasion === occasion && styles.selectedCard
                ]}
                onPress={() => setSelectedOccasion(occasion)}
              >
                <Text style={styles.occasionEmoji}>
                  {occasionEmojis[occasion] || '👕'}
                </Text>
                <Text style={[
                  styles.occasionLabel,
                  selectedOccasion === occasion && styles.selectedLabel
                ]}>
                  {occasion}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Comfort Level Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Comfort Level</Text>
          <View style={styles.comfortContainer}>
            {['Light', 'Warm', 'Layered'].map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.comfortButton,
                  comfortLevel === level && styles.selectedComfort
                ]}
                onPress={() => setComfortLevel(level)}
              >
                <Text style={styles.comfortText}>{level}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Formality Level Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Formality Level</Text>
          <View style={styles.formalityContainer}>
            {['Casual', 'Semi-formal', 'Formal'].map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.formalityButton,
                  formality === level && styles.selectedFormality
                ]}
                onPress={() => setFormality(level)}
              >
                <Text style={styles.formalityText}>{level}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Get Recommendations Button */}
        <TouchableOpacity 
          style={styles.recommendButton}
          onPress={getRecommendations}
        >
          <Text style={styles.recommendButtonText}>Get Recommendations</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Icons */}
      <View style={styles.bottomIcons}>
        <TouchableOpacity style={styles.bottomIconButton}>
          <Icon name="settings" size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomIconButton}>
          <Icon name="account-circle" size={28} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Modify the detail modal */}
      <Modal
        visible={showOutfitDetail}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowOutfitDetail(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedOutfit && (
              <>
                <TouchableOpacity 
                  style={styles.closeIconButton}
                  onPress={() => setShowOutfitDetail(false)}
                >
                  <Icon name="close" size={24} color="#000" />
                </TouchableOpacity>

                <Image
                  source={{ uri: selectedOutfit.image_url }}
                  style={styles.modalImage}
                  resizeMode="contain"
                />
                <View style={styles.modalDetails}>
                  <Text style={styles.modalText}>Activity: {selectedOutfit.activity}</Text>
                  <Text style={styles.modalText}>Weather: {selectedOutfit.weather}</Text>
                  <Text style={styles.modalText}>Formality: {selectedOutfit.formality}</Text>
                </View>
                
                <TouchableOpacity 
                  style={styles.addToClosetButton}
                  onPress={() => {
                    handleAddToCloset(selectedOutfit);
                    setShowOutfitDetail(false);
                  }}
                >
                  <Icon name="checkroom" size={24} color="#fff" />
                  <Text style={styles.buttonText}>Add to Closet</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 48, // Increased top padding
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  iconButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  activitiesScroll: {
    paddingHorizontal: 8,
  },
  activityCard: {
    width: 100,
    height: 100,
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  selectedCard: {
    backgroundColor: '#000',
  },
  recommendButton: {
    backgroundColor: '#000',
    marginHorizontal: 16,
    marginBottom: 32,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  recommendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  weatherContainer: {
    margin: 16,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    minHeight: 120,
  },
  gradient: {
    padding: 16,
  },
  weatherRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  leftColumn: {
    flex: 1,
  },
  rightColumn: {
    alignItems: 'flex-end',
  },
  temperature: {
    fontSize: 64,
    fontWeight: '200',
    color: '#fff',
    lineHeight: 70,
  },
  feelsLike: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  weatherIcon: {
    width: 32,
    height: 32,
    marginBottom: 8,
    tintColor: '#fff',
  },
  weatherMain: {
    fontSize: 20,
    fontWeight: '500',
    color: '#fff',
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '400',
    lineHeight: 18,
  },
  updateTime: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 12,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  errorText: {
    color: '#fff',
    textAlign: 'center',
  },
  comfortContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  comfortButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  selectedComfort: {
    backgroundColor: '#e0e0e0',
    borderWidth: 2,
    borderColor: '#000',
  },
  comfortText: {
    fontWeight: '500',
  },
  occasionEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  occasionLabel: {
    fontSize: 12,
    color: '#1a1a1a',
    textAlign: 'center',
  },
  selectedLabel: {
    color: '#fff',
  },
  bottomIcons: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  bottomIconButton: {
    padding: 16,
    marginHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  formalityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  formalityButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  selectedFormality: {
    backgroundColor: '#e0e0e0',
    borderWidth: 2,
    borderColor: '#000',
  },
  formalityText: {
    fontWeight: '500',
  },
  likedOutfitsScroll: {
    paddingHorizontal: 8,
  },
  likedOutfitCard: {
    width: 120,
    height: 160,
    marginHorizontal: 8,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f8f9fa',
    position: 'relative',
  },
  outfitCardContent: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  likedOutfitImage: {
    width: '100%',
    height: '100%',
  },
  likedOutfitOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 68, 68, 0.8)',
    borderRadius: 12,
    padding: 4,
  },
  placeholderContainer: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#999',
    marginTop: 8,
    fontSize: 12,
  },
  noOutfitsText: {
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '90%',
    position: 'relative',
  },
  modalImage: {
    width: '100%',
    height: 400,
    borderRadius: 10,
    marginTop: 20,
  },
  modalDetails: {
    marginTop: 20,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
  },
  closeIconButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
    padding: 8,
  },
  addToClosetButton: {
    backgroundColor: '#000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    gap: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HomeScreen;
