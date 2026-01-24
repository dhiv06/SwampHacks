import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, Image, TouchableOpacity, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { getFullCloset, deconstructItem, deleteItem } from '../../src/api/geminiapi';

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

  const handleDelete = (id: string) => {
    Alert.alert("Delete?", "", [{ text: "Cancel" }, { text: "Delete", style: "destructive", onPress: async () => { await deleteItem(id); loadCloset(); } }]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}><Text style={styles.title}>My outfits</Text></View>
      
      {loading && <ActivityIndicator size="large" style={{ margin: 20 }} />}
      
      <FlatList
        data={closet}
        numColumns={2}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onLongPress={() => handleDelete(item.id)} style={styles.gridItem}>
            <Image source={{ uri: item.imageUri }} style={styles.image} />
          </TouchableOpacity>
        )}
        ListHeaderComponent={<View style={styles.placeholder}><Text style={{color:'#888'}}>Featured Look</Text></View>}
      />

      <TouchableOpacity style={styles.fab} onPress={handleUpload}>
        <Text style={{fontWeight: 'bold'}}>Upload / Search</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F2' },
  header: { padding: 20 },
  title: { fontSize: 22, fontWeight: '500' },
  gridItem: { flex: 1, backgroundColor: '#D9D9D9', height: 180, margin: 5 },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  placeholder: { height: 150, backgroundColor: '#D9D9D9', margin: 5, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  fab: { position: 'absolute', bottom: 20, alignSelf: 'center', backgroundColor: '#C4C4C4', paddingVertical: 12, paddingHorizontal: 40, borderRadius: 5 }
});