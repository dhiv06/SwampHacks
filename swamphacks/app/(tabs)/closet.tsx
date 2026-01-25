import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, Image, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { getFullCloset, deconstructItem, deleteItem } from '../../src/api/geminiapi';

const LOGO_URI = 'https://via.placeholder.com/150x50/transparent/000000?text=LOGO';

export default function ClosetScreen() {
  const [closet, setCloset] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadCloset = async () => setCloset((await getFullCloset()).reverse());
  useEffect(() => { loadCloset(); }, []);

  const handleUpload = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return;
    let result = await ImagePicker.launchCameraAsync({ quality: 0.8, allowsEditing: true });
    
    if (!result.canceled) {
      setLoading(true);
      await deconstructItem(result.assets[0].uri);
      await loadCloset();
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#d8cfaf', '#e6b89c']} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <Image source={{ uri: LOGO_URI }} style={styles.logo} />
          <Text style={styles.title}>My Closet</Text>
        </View>

        
        {loading && <ActivityIndicator size="large" color="#52796F" style={{ margin: 20 }} />}
        {/* MY OUTFITS CARD */}
        <View style={styles.outfitsCard}>
          <View style={styles.outfitsHeader}>
            <Text style={styles.outfitsTitle}>My outfits</Text>
            <Text style={styles.heart}>♥</Text>
          </View>

          <View style={styles.outfitsRow}>
            <View style={styles.outfitSquare} />
            <View style={styles.outfitSquare} />
            <View style={styles.outfitSquare} />
          </View>
        </View>
        
        <FlatList
          data={closet}
          numColumns={2}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingHorizontal: 15,paddingBottom: 180}}
          renderItem={({ item }) => (
            <TouchableOpacity onLongPress={() => deleteItem(item.id).then(loadCloset)} style={styles.glassItem}>
              <Image source={{ uri: item.imageUri }} style={styles.image} />
            </TouchableOpacity>
          )}
        />
        


        {/* Floating Glass Button */}
        <TouchableOpacity style={styles.fab} onPress={handleUpload}>
          <Text style={styles.fabText}>+ Add Item</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    paddingTop: 20,
    paddingBottom: 10,
    alignItems: 'center',
  },

  logo: {
    width: 120,
    height: 40,
    resizeMode: 'contain',
    opacity: 0.6,
    marginBottom: 6,
  },

  title: {
    fontSize: 26,
    fontWeight: '300',
    letterSpacing: 1,
    color: '#49463b',
  },

  glassItem: { 
    flex: 1,
    margin: 8,
    height: 200,
    borderRadius: 25,
    backgroundColor: '#f1e7c5',
    borderWidth: 1,
    borderColor: '#e6b89c',
    overflow: 'hidden',
    shadowColor: '#ed9390',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },

  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  fab: { 
    position: 'absolute',
    bottom: 110,
    alignSelf: 'center',
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 34,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#e6b89c',
    shadowColor: '#ed9390',
    shadowOpacity: 0.15,
    shadowRadius: 15,
  },

  fabText: {
    color: '#73634f',
    fontWeight: '600',
    letterSpacing: 1,
  },
  outfitsCard: {
  marginHorizontal: 20,
  marginTop: 25,
  marginBottom: 15,
  backgroundColor: '#f1e7c5',
  borderRadius: 30,
  padding: 18,
  
  borderWidth: 1,
  borderColor: '#e6b89c',
  shadowColor: '#ed9390',
  shadowOpacity: 0.08,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 6 },
},

outfitsHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 12,
},

outfitsTitle: {
  fontSize: 16,
  fontWeight: '600',
  color: '#49463b',
  letterSpacing: 0.5,
},

heart: {
  fontSize: 18,
  color: '#73634f',
},

outfitsRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
},

outfitSquare: {
  width: '30%',
  aspectRatio: 1,
  borderRadius: 16,
  backgroundColor: '#e6b89c',
  opacity: 0.6,
},

});
