import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, Modal, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const ProfileScreen = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [showColorModal, setShowColorModal] = useState(false);
  const [showBrandsModal, setShowBrandsModal] = useState(false);
  const [showCategoriesModal, setShowCategoriesModal] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = await AsyncStorage.getItem('token');
      const res = await axios.get('http://10.0.2.2:3000/api/user/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(res.data);
      setLoading(false);
    };
    fetchProfile();
  }, []);

  if (loading) return <ActivityIndicator size="large" />;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Style Profile Setup</Text>
      <View style={styles.profileRow}>
        <Image source={{ uri: profile.avatarUrl }} style={styles.avatar} />
        <View>
          <Text style={styles.name}>{profile.name}</Text>
          <Text style={styles.subtitle}>Your style profile</Text>
        </View>
      </View>
      <Text style={styles.styleSummary}>Your Style - {profile.styleSummary}</Text>
      <View style={styles.row}>
        <TouchableOpacity style={styles.card} onPress={() => setShowCategoriesModal(true)} activeOpacity={0.85}>
          <Text style={styles.emoji}>😊</Text>
          <Text style={styles.cardLabel}>Style Categories</Text>
          <Text style={styles.tapText}>Tap to view</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.card} onPress={() => setShowColorModal(true)} activeOpacity={0.85}>
          <Text style={styles.emoji}>👗</Text>
          <Text style={styles.cardLabel}>Preferred Colors</Text>
          <Text style={styles.tapText}>Tap to view</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.card} onPress={() => setShowBrandsModal(true)} activeOpacity={0.85}>
          <Text style={styles.emoji}>⭐</Text>
          <Text style={styles.cardLabel}>Favorite Brands</Text>
          <Text style={styles.tapText}>Tap to view</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.shareBtn}>
        <Text style={styles.shareText}>Share Profile</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.editBtn}>
        <Text style={styles.editText}>Edit Preferences</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.saveBtn}>
        <Text style={styles.saveText}>Save Profile</Text>
      </TouchableOpacity>
      <Modal
        visible={showCategoriesModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCategoriesModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowCategoriesModal(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Your Style Categories</Text>
            <View style={styles.modalList}>
              {profile.categories.map((cat: string, idx: number) => (
                <Text key={cat + idx} style={styles.modalItem}>{cat}</Text>
              ))}
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setShowCategoriesModal(false)}>
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
      <Modal
        visible={showColorModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowColorModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowColorModal(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Your Preferred Colors</Text>
            <View style={styles.swatchRow}>
              {profile.colors.map((color: string, idx: number) => (
                <View
                  key={color + idx}
                  style={[styles.swatch, { backgroundColor: color, borderColor: color === '#FFFFFF' ? '#ccc' : color }]}
                />
              ))}
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setShowColorModal(false)}>
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
      <Modal
        visible={showBrandsModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowBrandsModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowBrandsModal(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Your Favorite Brands</Text>
            <View style={styles.modalList}>
              {profile.brands.map((brand: string, idx: number) => (
                <Text key={brand + idx} style={styles.modalItem}>{brand}</Text>
              ))}
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setShowBrandsModal(false)}>
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 16, alignSelf: 'center' },
  profileRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  avatar: { width: 60, height: 60, borderRadius: 30, marginRight: 12 },
  name: { fontSize: 18, fontWeight: 'bold' },
  subtitle: { color: '#888' },
  styleSummary: { fontSize: 18, marginVertical: 12, alignSelf: 'center' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 16 },
  card: { flex: 1, alignItems: 'center', marginHorizontal: 4, padding: 12, backgroundColor: '#f5f5f5', borderRadius: 10 },
  emoji: { fontSize: 28 },
  cardLabel: { fontWeight: 'bold', marginTop: 4, marginBottom: 2 },
  swatchRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 16,
  },
  swatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    margin: 6,
  },
  shareBtn: { borderWidth: 1, borderColor: '#000', borderRadius: 8, padding: 14, marginTop: 12, alignItems: 'center' },
  shareText: { color: '#000', fontWeight: 'bold' },
  editBtn: { borderWidth: 1, borderColor: '#000', borderRadius: 8, padding: 14, marginTop: 12, alignItems: 'center' },
  editText: { color: '#000', fontWeight: 'bold' },
  saveBtn: { backgroundColor: '#000', borderRadius: 8, padding: 14, marginTop: 12, alignItems: 'center' },
  saveText: { color: '#fff', fontWeight: 'bold' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    minWidth: 220,
  },
  bigSwatch: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#ccc',
    marginBottom: 16,
  },
  modalText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  closeBtn: {
    backgroundColor: '#222',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 24,
    marginTop: 8,
  },
  closeBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  tapText: {
    color: '#888',
    fontSize: 13,
    marginTop: 6,
  },
  modalTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 16,
  },
  modalList: {
    marginBottom: 16,
    alignItems: 'center',
  },
  modalItem: {
    fontSize: 16,
    marginVertical: 2,
  },
});

export default ProfileScreen;
