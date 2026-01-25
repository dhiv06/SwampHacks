import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, Image, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { getFullCloset, deconstructItem, deleteItem, seedProjectAssets } from '../../src/api/geminiapi';

const LOGO_URI = 'https://via.placeholder.com/150x50/transparent/000000?text=LOGO';

const CATEGORIES = [
  { id: 'all', label: 'All', icon: '✨' },
  { id: 'top', label: 'Tops', icon: '👕' },
  { id: 'bottom', label: 'Pants', icon: '👖' },
  { id: 'outerwear', label: 'Jackets', icon: '🧥' },
  { id: 'shoes', label: 'Shoes', icon: '👟' },
  { id: 'accessory', label: 'Accessories', icon: '💍' },
];

export default function Closet() {
  const [closet, setCloset] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const loadClosetData = async () => {
    try {
      setLoading(true);
      await seedProjectAssets(); 
      const data = await getFullCloset();
      setCloset([...data].reverse());
    } catch (error) {
      console.error("Failed to load closet:", error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => { loadClosetData(); }, []);

  const filteredData = selectedCategory === 'all' ? closet : closet.filter(item => item.category === selectedCategory);

  const handleGalleryUpload = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsMultipleSelection: true, quality: 0.8,
    });
    if (!result.canceled) {
      setLoading(true);
      try {
        await Promise.all(result.assets.map((asset) => deconstructItem(asset.uri)));
        const updatedData = await getFullCloset();
        setCloset([...updatedData].reverse());
      } finally { setLoading(false); }
    }
  };

  const handleCameraCapture = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return;
    let result = await ImagePicker.launchCameraAsync({ quality: 0.8, allowsEditing: true });
    if (!result.canceled) {
      setLoading(true);
      try {
        await deconstructItem(result.assets[0].uri);
        const updatedData = await getFullCloset();
        setCloset([...updatedData].reverse());
      } finally { setLoading(false); }
    }
  };

  const confirmDelete = (item: any) => {
    if (item.isStatic) { Alert.alert("System Item", "Cannot delete base collection."); return; }
    Alert.alert("Remove?", "Delete item?", [{ text: "Cancel", style: "cancel" }, { text: "Delete", style: "destructive", onPress: async () => { await deleteItem(item.id); const d = await getFullCloset(); setCloset([...d].reverse()); } }]);
  };

  return (
    <LinearGradient colors={['#d8cfaf', '#e6b89c']} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <Image source={{ uri: LOGO_URI }} style={styles.logo} />
          <Text style={styles.title}>My Closet</Text>
        </View>
        <View style={{ height: 60, marginBottom: 15 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity key={cat.id} onPress={() => setSelectedCategory(cat.id)} style={[styles.categoryBox, selectedCategory === cat.id && styles.categoryBoxSelected]}>
                <Text style={styles.categoryIcon}>{cat.icon}</Text>
                <Text style={[styles.categoryText, selectedCategory === cat.id && styles.categoryTextSelected]}>{cat.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        {loading && <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#52796F" /><Text style={styles.loadingText}>AI processing...</Text></View>}
        <FlatList
          data={filteredData} numColumns={2} keyExtractor={item => item.id}
          contentContainerStyle={{ paddingHorizontal: 15, paddingBottom: 200 }}
          ListEmptyComponent={!loading ? <Text style={styles.emptyText}>No items found.</Text> : null}
          renderItem={({ item }) => (
            <TouchableOpacity onLongPress={() => confirmDelete(item)} style={styles.glassItem} activeOpacity={0.7}>
              <Image source={{ uri: item.imageUri }} style={styles.image} />
              <View style={styles.itemOverlay}><Text style={styles.itemCategory} numberOfLines={1}>{item.sub_category || 'Item'}</Text></View>
              {item.isStatic && <View style={styles.staticBadge}><Text style={styles.staticBadgeText}>Base</Text></View>}
            </TouchableOpacity>
          )}
        />
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.fab} onPress={handleCameraCapture}><Text style={styles.fabText}>📸 Camera</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.fab, { backgroundColor: '#52796F' }]} onPress={handleGalleryUpload}><Text style={styles.fabText}>📂 Gallery</Text></TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 25, paddingTop: 10, paddingBottom: 15 },
  logo: { width: 100, height: 30, resizeMode: 'contain', marginBottom: 5, opacity: 0.5 },
  title: { fontSize: 28, fontWeight: '300', color: '#2F3E46' },
  categoryScroll: { paddingHorizontal: 20, gap: 10, alignItems: 'center' },
  categoryBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 15, borderWidth: 1, borderColor: '#cad2c5' },
  categoryBoxSelected: { backgroundColor: '#52796F', borderColor: '#52796F' },
  categoryIcon: { marginRight: 6, fontSize: 16 },
  categoryText: { color: '#2F3E46', fontWeight: '600' },
  categoryTextSelected: { color: '#fff' },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#84a98c', fontSize: 16 },
  loadingContainer: { alignItems: 'center', marginVertical: 10 },
  loadingText: { color: '#52796F', marginTop: 5, fontSize: 12, fontWeight: '600' },
  glassItem: { flex: 1, margin: 8, height: 220, borderRadius: 20, backgroundColor: '#fff', overflow: 'hidden', elevation: 3, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  itemOverlay: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: 'rgba(255,255,255,0.9)', padding: 10 },
  itemCategory: { fontSize: 12, color: '#2F3E46', fontWeight: 'bold', textAlign: 'center' },
  staticBadge: { position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(82, 121, 111, 0.8)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  staticBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  buttonRow: { position: 'absolute', bottom: 90, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 15 },
  fab: { backgroundColor: 'rgba(47, 62, 70, 0.9)', paddingVertical: 15, paddingHorizontal: 20, borderRadius: 30, minWidth: 140, alignItems: 'center', elevation: 8 },
  fabText: { color: '#fff', fontWeight: '600', letterSpacing: 0.5 }
});