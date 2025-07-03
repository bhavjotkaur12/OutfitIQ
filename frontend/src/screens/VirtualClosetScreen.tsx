import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';

const categories = ['all', 'tops', 'bottoms', 'outerwear', 'shoes', 'accessories', 'dresses'] as const;
type CategoryKey = Lowercase<Exclude<typeof categories[number], 'all'>>;

interface OutfitItemDetails {
  name: string;
  color?: string;
  fit?: string;
  notes?: string;
  lastWorn?: Date;
}

interface OutfitItem {
  [key: string]: string | Date | OutfitItemDetails | undefined;
  category?: string;
  name?: string;
  color?: string;
  fit?: string;
  notes?: string;
  lastWorn?: Date;
}

interface Outfit {
  outfitId: string;
  image_url: string;
  outfit_items: Record<string, OutfitItemDetails | string | undefined>;
  activity: string;
  formality: string;
  lastWorn?: Date;
  weather?: string;
  gender?: string;
}

const VirtualClosetScreen = () => {
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedOutfit, setSelectedOutfit] = useState<Outfit | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<OutfitItem | null>(null);
  const navigation = useNavigation();

  useEffect(() => {
    fetchClosetItems();
  }, []);

  const fetchClosetItems = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'Please log in to view your closet');
        return;
      }

      const response = await fetch('http://10.0.2.2:3000/api/closet', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch closet items');
      }

      const data = await response.json();
      
      // Add more detailed debug logging
      console.log('Debug - Raw response data:', data);
      
      // Ensure outfit_items are properly structured
      const processedOutfits = data.outfits.map((outfit: Outfit) => ({
        ...outfit,
        outfit_items: outfit.outfit_items || {}
      }));

      console.log('Debug - Processed outfits:', {
        count: processedOutfits.length,
        sample: processedOutfits[0]
      });

      setOutfits(processedOutfits);
    } catch (error) {
      console.error('Error fetching closet:', error);
      Alert.alert('Error', 'Failed to load your closet items');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (outfitId: string) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`http://10.0.2.2:3000/api/closet/${outfitId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete item');
      }

      setOutfits(prevOutfits => prevOutfits.filter(outfit => outfit.outfitId !== outfitId));
      setIsDetailModalVisible(false);
    } catch (error) {
      console.error('Delete error:', error);
      Alert.alert('Error', 'Failed to delete item');
    }
  };

  const handleUpdateItem = async (outfitId: string, itemKey: string, updatedItem: OutfitItem) => {
    try {
      const token = await AsyncStorage.getItem('token');
      
      console.log('Debug - Updating item:', {
        outfitId,
        itemKey,
        updatedItem
      });

      const response = await fetch(`http://10.0.2.2:3000/api/closet/${outfitId}/${itemKey}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          updates: {
            name: updatedItem.name || '',
            color: updatedItem.color || '',
            fit: updatedItem.fit || '',
            notes: updatedItem.notes || '',
            lastWorn: updatedItem.lastWorn || null
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Update failed:', {
          status: response.status,
          error: errorText
        });
        throw new Error(errorText || 'Failed to update item');
      }

      const result = await response.json();
      console.log('Update successful:', result);

      // First close the edit modal
      setIsEditModalVisible(false);

      // Then refresh the data by fetching the closet items again
      await fetchClosetItems();

      // Finally, if we were looking at the detail modal, update the selected outfit
      if (selectedOutfit && selectedOutfit.outfitId === outfitId) {
        const updatedOutfit = result.outfit; // Get the updated outfit from the response
        setSelectedOutfit(updatedOutfit);
      }

    } catch (error: unknown) {
      console.error('Update error:', error);
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to update item',
        [{ text: 'OK' }]
      );
    }
  };

  // Add this function to validate the update data
  const validateItemUpdate = (item: OutfitItem): boolean => {
    if (!item.category) return false;
    if (!item.name || item.name.trim() === '') return false;
    return true;
  };

  // First, update the type guard function at the top of the file
  const isOutfitItemDetails = (value: any): value is OutfitItemDetails => {
    return typeof value === 'object' && 
           value !== null &&
           'name' in value && 
           !('getTime' in value);
  };

  const renderDetailModal = () => {
    if (selectedOutfit) {
      console.log('Debug - Modal Outfit Data:', {
        outfitId: selectedOutfit.outfitId,
        items: selectedOutfit.outfit_items
      });
    }

    return (
      <Modal
        visible={isDetailModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsDetailModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsDetailModalVisible(false)}
            >
              <Icon name="close" size={24} color="#000" />
            </TouchableOpacity>
            
            {selectedOutfit && (
              <>
                <Image
                  source={{ uri: selectedOutfit.image_url }}
                  style={styles.modalImage}
                />
                <ScrollView style={styles.itemsList}>
                  <View style={styles.outfitInfo}>
                    <Text style={styles.outfitInfoText}>Activity: {selectedOutfit.activity}</Text>
                    <Text style={styles.outfitInfoText}>Formality: {selectedOutfit.formality}</Text>
                    {selectedOutfit.weather && (
                      <Text style={styles.outfitInfoText}>Weather: {selectedOutfit.weather}</Text>
                    )}
                  </View>

                  <View style={styles.itemsContainer}>
                    <Text style={styles.sectionTitle}>Outfit Items:</Text>
                    {selectedOutfit && selectedOutfit.outfit_items && (() => {
                      console.log('Debug - Rendering outfit items:', selectedOutfit.outfit_items);
                      
                      return Object.entries(selectedOutfit.outfit_items).map(([key, value]) => {
                        if (!value) return null;
                        
                        const displayKey = key.charAt(0).toUpperCase() + key.slice(1);
                        const itemName = typeof value === 'string' ? value : value.name;
                        
                        return (
                          <View key={key} style={[styles.itemDetail, { marginBottom: 10 }]}>
                            <View style={styles.itemHeader}>
                              <Text style={[styles.itemCategory, { fontSize: 16, fontWeight: 'bold' }]}>
                                {displayKey}
                              </Text>
                              <TouchableOpacity
                                onPress={() => {
                                  console.log('Debug - Opening edit for:', { key, value });
                                  setEditingItem({
                                    category: key,
                                    name: typeof value === 'string' ? value : value.name || '',
                                    color: typeof value === 'string' ? '' : value.color || '',
                                    fit: typeof value === 'string' ? '' : value.fit || '',
                                    notes: typeof value === 'string' ? '' : value.notes || '',
                                    lastWorn: typeof value === 'string' ? undefined : value.lastWorn
                                  });
                                  setIsEditModalVisible(true);
                                }}
                              >
                                <Icon name="pencil" size={20} color="#666" />
                              </TouchableOpacity>
                            </View>
                            <View style={styles.itemInfo}>
                              <Text style={[styles.itemName, { fontSize: 14, color: '#333' }]}>
                                {itemName}
                              </Text>
                            </View>
                          </View>
                        );
                      });
                    })()}
                  </View>
                </ScrollView>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteItem(selectedOutfit.outfitId)}
                >
                  <Text style={styles.deleteButtonText}>Remove from Closet</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    );
  };

  const renderEditModal = () => (
    <Modal
      visible={isEditModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setIsEditModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setIsEditModalVisible(false)}
          >
            <Icon name="close" size={24} color="#000" />
          </TouchableOpacity>
          
          {editingItem && (
            <View style={styles.editForm}>
              <TextInput
                style={styles.input}
                value={typeof editingItem.name === 'string' ? editingItem.name : ''}
                onChangeText={(text) => setEditingItem({...editingItem, name: text})}
                placeholder="Item name"
              />
              <TextInput
                style={styles.input}
                value={typeof editingItem.color === 'string' ? editingItem.color : ''}
                onChangeText={(text) => setEditingItem({...editingItem, color: text})}
                placeholder="Color"
              />
              <TextInput
                style={styles.input}
                value={typeof editingItem.fit === 'string' ? editingItem.fit : ''}
                onChangeText={(text) => setEditingItem({...editingItem, fit: text})}
                placeholder="Fit"
              />
              <TextInput
                style={styles.input}
                value={typeof editingItem.notes === 'string' ? editingItem.notes : ''}
                onChangeText={(text) => setEditingItem({...editingItem, notes: text})}
                placeholder="Notes"
                multiline
              />
              <TouchableOpacity
                style={styles.saveButton}
                onPress={() => {
                  if (selectedOutfit && editingItem && editingItem.category) {
                    if (!validateItemUpdate(editingItem)) {
                      Alert.alert('Error', 'Please fill in at least the item name');
                      return;
                    }
                    handleUpdateItem(selectedOutfit.outfitId, editingItem.category, editingItem);
                  } else {
                    Alert.alert('Error', 'Missing category information');
                  }
                }}
              >
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Virtual Closet</Text>
      </View>

      <ScrollView horizontal style={styles.categoriesContainer}>
        {categories.map(category => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              selectedCategory === category && styles.selectedCategory
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text style={[
              styles.categoryText,
              selectedCategory === category && styles.selectedCategoryText
            ]}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      <ScrollView contentContainerStyle={styles.outfitsGrid}>
        {outfits
          .filter((outfit: Outfit) => 
            selectedCategory === 'all' || 
            (outfit.outfit_items && outfit.outfit_items[
              selectedCategory.toLowerCase().replace(/s$/, '') as CategoryKey
            ])
          )
          .map((outfit: Outfit) => (
            <TouchableOpacity
              key={outfit.outfitId}
              style={styles.outfitCard}
              onPress={() => {
                setSelectedOutfit(outfit);
                setIsDetailModalVisible(true);
              }}
            >
              <Image
                source={{ uri: outfit.image_url }}
                style={styles.outfitImage}
                resizeMode="cover"
              />
              <View style={styles.outfitDetails}>
                <Text style={styles.outfitText}>
                  {outfit.activity} • {outfit.formality}
                </Text>
                <Text style={styles.lastWornText}>
                  Last worn: {outfit.lastWorn ? new Date(outfit.lastWorn).toLocaleDateString() : 'Never'}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
      </ScrollView>

      {renderDetailModal()}
      {renderEditModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
  },
  categoriesContainer: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  selectedCategory: {
    backgroundColor: '#000',
  },
  categoryText: {
    color: '#666',
  },
  selectedCategoryText: {
    color: '#fff',
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
  },
  outfitImage: {
    width: '100%',
    aspectRatio: 3/4,
  },
  outfitDetails: {
    padding: 8,
  },
  outfitText: {
    fontSize: 12,
    color: '#666',
  },
  lastWornText: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '90%',
    maxHeight: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  modalImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 8,
  },
  itemsList: {
    maxHeight: '60%',
    marginVertical: 16,
  },
  itemDetail: {
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemCategory: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  deleteButton: {
    backgroundColor: '#ff4444',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  deleteButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  editForm: {
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  saveButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  itemInfo: {
    marginLeft: 10,
  },
  itemName: {
    fontSize: 14,
    color: '#666',
  },
  itemSubtext: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  outfitInfo: {
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  outfitInfoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  itemsContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
});

export default VirtualClosetScreen;
