import React, { useState, useRef } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, Alert, Animated, Easing } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type RootStackParamList = {
  VisualOutfitTest: undefined;
  StyleProfileSummary: undefined;
  Profile: undefined;
  // ...other screens
};

type VisualOutfitTestScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'VisualOutfitTest'>;
  route: RouteProp<RootStackParamList, 'VisualOutfitTest'>;
};

type OutfitResponse = {
  response: 'yes' | 'no' | 'partial';
  parts: string[];
};

type ResponsesState = {
  [outfitId: number]: OutfitResponse;
};

const outfits = [
    {
      id: 1,
      image: require('../assets/Outfit1.jpg'),
      title: 'Casual Comfy',
      style: 'Relaxed',
      items: ['Jacket', 'Pants', 'Shoes'],
    },
    {
      id: 2,
      image: require('../assets/Outfit2.jpg'),
      title: 'Casual Chic',
      style: 'Relaxed',
      items: ['Scarf', 'Coat', 'Boots'],
    },
    // ...more outfits
  ];

const VisualOutfitTestScreen: React.FC<VisualOutfitTestScreenProps> = ({ navigation }) => {
  const [responses, setResponses] = useState<ResponsesState>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const handleResponse = (
    outfitId: number,
    response: 'yes' | 'no' | 'partial',
    parts: string[] = []
  ) => {
    setResponses(prev => ({
      ...prev,
      [outfitId]: { response, parts }
    }));

    // Only auto-advance for "yes" or "no"
    if (response === 'yes' || response === 'no') {
      if (currentIndex < outfits.length - 1) {
        animateToNextCard();
      }
    }
    // For "partial", stay on the card and let user pick items
  };

  const handlePartialItemSelect = (outfitId: number, item: string) => {
    const prevParts = responses[outfitId]?.parts || [];
    const isSelected = prevParts.includes(item);
    const newParts = isSelected
      ? prevParts.filter(i => i !== item)
      : [...prevParts, item];

    setResponses(prev => ({
      ...prev,
      [outfitId]: { response: 'partial', parts: newParts }
    }));

    // If this is the first item being selected, advance to next card
    if (!isSelected && prevParts.length === 0 && currentIndex < outfits.length - 1) {
      setTimeout(() => animateToNextCard(), 300); // slight delay for feedback
    }
  };

  const handleSubmit = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.post(
        'http://10.0.2.2:3000/api/user/outfit-test',
        { responses },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      Alert.alert('Success', 'Your outfit test has been submitted!');
      navigation.navigate('Profile');
    } catch (error) {
      console.error('Failed to submit outfit test:', error);
      Alert.alert('Error', 'Failed to submit your outfit test. Please try again.');
    }
  };

  const animateToNextCard = () => {
    // Slide out current card to the left
    Animated.timing(slideAnim, {
      toValue: -400, // slide left (adjust based on your card width)
      duration: 300,
      useNativeDriver: true,
      easing: Easing.out(Easing.ease),
    }).start(() => {
      // After animation, reset position and show next card
      slideAnim.setValue(400); // start next card off-screen right
      setCurrentIndex(prev => prev + 1);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }).start();
    });
  };

  const outfit = outfits[currentIndex];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Visual Outfit Test</Text>
      <Animated.View style={[styles.outfitCard, { transform: [{ translateX: slideAnim }] }]}>
        <Image source={outfit.image} style={styles.image} />
        <Text style={styles.title}>{outfit.title}</Text>
        <Text style={styles.style}>{outfit.style}</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[
              styles.button,
              responses[outfit.id]?.response === 'no' && styles.buttonSelected
            ]}
            onPress={() => handleResponse(outfit.id, 'no')}
          >
            <Text style={responses[outfit.id]?.response === 'no' ? { color: '#fff' } : { color: '#222' }}>
              No, it's not my style
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.button,
              responses[outfit.id]?.response === 'partial' && styles.buttonSelected
            ]}
            onPress={() => handleResponse(outfit.id, 'partial')}
          >
            <Text style={responses[outfit.id]?.response === 'partial' ? { color: '#fff' } : { color: '#222' }}>
              I'd wear parts of it
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.button,
              responses[outfit.id]?.response === 'yes' && styles.buttonPrimary
            ]}
            onPress={() => handleResponse(outfit.id, 'yes')}
          >
            <Text style={responses[outfit.id]?.response === 'yes' ? { color: '#fff' } : { color: '#222' }}>
              Yes, I would wear it all
            </Text>
          </TouchableOpacity>
        </View>
        {responses[outfit.id]?.response === 'partial' && (
          <View style={styles.refineRow}>
            {outfit.items.map(item => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.refineButton,
                  responses[outfit.id]?.parts?.includes(item) && styles.refineButtonSelected
                ]}
                onPress={() => handlePartialItemSelect(outfit.id, item)}
              >
                <Text>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </Animated.View>
      {currentIndex === outfits.length - 1 && (
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Submit</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    alignSelf: 'center',
  },
  outfitCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 400,
    borderRadius: 8,
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  style: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
  },
  buttonRow: {
    flexDirection: 'column',
    gap: 8,
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#fff',
    borderColor: '#222',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 6,
  },
  buttonPrimary: {
    backgroundColor: '#222',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 6,
  },
  refineRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
    marginBottom: 8,
  },
  refineButton: {
    backgroundColor: '#eee',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  refineButtonSelected: {
    backgroundColor: '#ffd700',
  },
  submitButton: {
    backgroundColor: '#222',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  buttonSelected: {
    backgroundColor: '#222',
    borderColor: '#222',
  },
});

export default VisualOutfitTestScreen;
