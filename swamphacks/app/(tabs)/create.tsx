import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView, Image, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getFullCloset, getPeakOutfit } from '../../src/api/geminiapi';

const LOGO_URI = 'https://via.placeholder.com/150x50/transparent/000000?text=LOGO';

export default function CreateScreen() {
  const [outfit, setOutfit] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<any>({});

  const generate = async () => {
    setLoading(true);
    const all = await getFullCloset();
    const map: any = {};
    all.forEach((i: any) => map[i.id] = i.imageUri);
    setImages(map);
    
    const res = await getPeakOutfit(40.7, -74.0, "Casual aesthetic");
    setOutfit(res);
    setLoading(false);
  };

  return (
    <LinearGradient colors={['#F6FFF8', '#EAF4F4']} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
           <Image source={{ uri: LOGO_URI }} style={styles.logo} />
           <Text style={styles.title}>Stylist</Text>
        </View>
        
        <View style={styles.glassCanvas}>
          {loading ? <ActivityIndicator size="large" color="#52796F" /> : !outfit ? (
            <TouchableOpacity onPress={generate} style={styles.generateBtn}>
              <Text style={styles.btnText}>Curate Look</Text>
            </TouchableOpacity>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{alignItems:'center'}}>
              <Text style={styles.reasoning}>{outfit.reasoning}</Text>
              
              <View style={styles.collage}>
                {['top', 'bottom', 'shoes'].map(part => (
                  outfit.outfit_ids?.[part] && images[outfit.outfit_ids[part]] && 
                  <Image key={part} source={{ uri: images[outfit.outfit_ids[part]] }} style={styles.piece} />
                ))}
              </View>

              <TouchableOpacity onPress={generate} style={styles.refreshBtn}>
                <Text style={styles.refreshText}>Shuffle</Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 25 },
  logo: { width: 100, height: 30, resizeMode: 'contain', marginBottom: 10, opacity: 0.5 },
  title: { fontSize: 28, fontWeight: '300', color: '#2F3E46' },
  
  glassCanvas: { 
    flex: 1, 
    margin: 20, marginBottom: 100,
    backgroundColor: 'rgba(255,255,255,0.6)', 
    borderRadius: 40, 
    justifyContent: 'center', alignItems: 'center', 
    padding: 20,
    borderWidth: 1, borderColor: '#fff'
  },
  
  generateBtn: { backgroundColor: '#2F3E46', padding: 20, borderRadius: 20, width: '80%', alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 18, fontWeight: '500' },
  
  reasoning: { color: '#52796F', fontStyle: 'italic', marginBottom: 20, textAlign: 'center' },
  collage: { flexDirection: 'column', gap: 15 },
  piece: { width: 200, height: 200, borderRadius: 20, resizeMode: 'cover' },
  
  refreshBtn: { marginTop: 30, padding: 10 },
  refreshText: { color: '#2F3E46', fontWeight: 'bold' }
});