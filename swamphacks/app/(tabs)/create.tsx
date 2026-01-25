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
    all.forEach((i: any) => (map[i.id] = i.imageUri));
    setImages(map);

    const res = await getPeakOutfit(40.7, -74.0, 'Casual aesthetic');
    setOutfit(res);
    setLoading(false);
  };

  return (
    /* EXACT SAME BACKGROUND AS INDEX */
    <LinearGradient colors={['#d8cfaf', '#e6b89c']} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        
        <View style={styles.header}>
          <Image source={{ uri: LOGO_URI }} style={styles.logo} />
          <Text style={styles.title}>Stylist</Text>
        </View>

        <View style={styles.glassCanvas}>
          {loading ? (
            <ActivityIndicator size="large" color="#2F3E46" />
          ) : !outfit ? (
            <TouchableOpacity style={styles.generateBtn} onPress={generate}>
              <Text style={styles.btnText}>Curate Look</Text>
            </TouchableOpacity>
          ) : (
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
              <Text style={styles.reasoning}>{outfit.reasoning}</Text>

              <View style={styles.collage}>
                {['top', 'bottom', 'shoes'].map(
                  (part) =>
                    outfit.outfit_ids?.[part] &&
                    images[outfit.outfit_ids[part]] && (
                      <Image
                        key={part}
                        source={{ uri: images[outfit.outfit_ids[part]] }}
                        style={styles.piece}
                      />
                    )
                )}
              </View>

              <TouchableOpacity style={styles.refreshBtn} onPress={generate}>
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

  header: {
    padding: 25,
    paddingBottom: 10,
  },

  logo: {
    width: 100,
    height: 30,
    resizeMode: 'contain',
    opacity: 0.5,
    marginBottom: 8,
  },

  title: {
    fontSize: 28,
    fontWeight: '300',
    color: '#2F3E46', // EXACT MATCH
  },

  glassCanvas: {
    flex: 1,
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 110,
    backgroundColor: 'rgba(255,255,255,0.6)', // SAME AS INDEX
    borderRadius: 40,
    padding: 25,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#fff',
  },

  scrollContent: {
    alignItems: 'center',
    paddingBottom: 20,
  },

  generateBtn: {
    backgroundColor: '#2F3E46', // SAME AS INDEX BUTTONS
    paddingVertical: 18,
    paddingHorizontal: 45,
    borderRadius: 30,
  },

  btnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '500',
    letterSpacing: 1,
  },

  reasoning: {
    color: '#52796F', // SAME SECONDARY COLOR
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 25,
    paddingHorizontal: 10,
  },

  collage: {
    gap: 18,
    alignItems: 'center',
  },

  piece: {
    width: 210,
    height: 210,
    borderRadius: 25,
    resizeMode: 'cover',
  },

  refreshBtn: {
    marginTop: 30,
    paddingVertical: 10,
    paddingHorizontal: 30,
  },

  refreshText: {
    color: '#2F3E46',
    fontWeight: '600',
    letterSpacing: 1,
  },
});
