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
    <LinearGradient colors={['#EAF4F4', '#F6FFF8']} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <Image source={{ uri: LOGO_URI }} style={styles.logo} />
          <Text style={styles.title}>My Collection</Text>
        </View>
        
        {loading && <ActivityIndicator size="large" color="#52796F" style={{ margin: 20 }} />}
        
        <FlatList
          data={closet}
          numColumns={2}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingHorizontal: 15, paddingBottom: 100 }}
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
  header: { padding: 25 },
  logo: { width: 100, height: 30, resizeMode: 'contain', marginBottom: 10, opacity: 0.5 },
  title: { fontSize: 28, fontWeight: '300', color: '#2F3E46' },
  
  glassItem: { 
    flex: 1, 
    margin: 8, 
    height: 200, 
    borderRadius: 20, 
    backgroundColor: '#fff',
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 
  },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  
  fab: { 
    position: 'absolute', bottom: 110, alignSelf: 'center', 
    backgroundColor: 'rgba(47, 62, 70, 0.9)', 
    paddingVertical: 15, paddingHorizontal: 30, borderRadius: 30,
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10
  },
  fabText: { color: '#fff', fontWeight: '600', letterSpacing: 1 }
});