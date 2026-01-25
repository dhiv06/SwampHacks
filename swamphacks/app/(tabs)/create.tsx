import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView, Image, ActivityIndicator, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getFullCloset, getPeakOutfit } from '../../src/api/geminiapi';

const LOGO_URI = 'https://via.placeholder.com/150x50/transparent/000000?text=LOGO';

export default function CreateScreen() {
  const [outfit, setOutfit] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<any>({});

  const generate = async () => {
    setLoading(true);
    setOutfit(null); // Clear previous look
    
    // 1. Prepare Inventory Map
    const all = await getFullCloset();
    const map: any = {};
    all.forEach((i: any) => (map[i.id] = i.imageUri));
    setImages(map);
    
    // 2. Call API
    const res = await getPeakOutfit(40.7, -74.0, "Stylish day out");
    console.log("Outfit Result:", res); // Debug log
    
    setOutfit(res);
    setLoading(false);
  };

  const openSearch = (term: string) => {
    const url = `https://www.google.com/search?q=${encodeURIComponent(term)}`;
    Linking.openURL(url);
  };

  // Helper to safely render image if it exists in map
  const renderItem = (id: string, style: any) => {
    if (id && images[id]) {
      return <Image source={{ uri: images[id] }} style={style} />;
    }
    return null;
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
            <View style={{alignItems: 'center'}}>
                <ActivityIndicator size="large" color="#52796F" />
                <Text style={styles.loadingText}>Scouring the internet & your closet...</Text>
            </View>
          ) : !outfit ? (
            <TouchableOpacity onPress={generate} style={styles.generateBtn}>
              <Text style={styles.btnText}>Curate Look</Text>
            </TouchableOpacity>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{alignItems:'center', paddingBottom: 40}}>
              
              {/* --- OUTFIT LAYOUT --- */}
              <View style={styles.layoutRow}>
                
                {/* LEFT COLUMN: Outerwear */}
                <View style={styles.colSide}>
                   {outfit.outfit_ids?.outerwear && images[outfit.outfit_ids.outerwear] ? (
                      <View style={styles.pieceWrapper}>
                        <Text style={styles.label}>JACKET</Text>
                        {renderItem(outfit.outfit_ids.outerwear, styles.sideImage)}
                      </View>
                   ) : <Text style={styles.emptyLabel}>NO{"\n"}COAT</Text>}
                </View>

                {/* CENTER COLUMN: Top -> Bottom -> Shoes */}
                <View style={styles.colCenter}>
                    {renderItem(outfit.outfit_ids?.top, styles.centerImage)}
                    
                    {outfit.outfit_ids?.bottom && images[outfit.outfit_ids.bottom] && (
                        <Image source={{ uri: images[outfit.outfit_ids.bottom] }} style={[styles.centerImage, {marginTop: -15}]} />
                    )}
                    
                    {outfit.outfit_ids?.shoes && images[outfit.outfit_ids.shoes] && (
                        <Image source={{ uri: images[outfit.outfit_ids.shoes] }} style={[styles.centerImage, {height: 100, marginTop: 5}]} />
                    )}
                </View>

                {/* RIGHT COLUMN: Accessory + Color */}
                <View style={styles.colSide}>
                    {outfit.outfit_ids?.accessory && images[outfit.outfit_ids.accessory] ? (
                      <View style={styles.pieceWrapper}>
                        <Text style={styles.label}>ACC</Text>
                        {renderItem(outfit.outfit_ids.accessory, styles.accImage)}
                      </View>
                   ) : <Text style={styles.emptyLabel}>NO{"\n"}ACC</Text>}

                   <View style={styles.colorInfoBox}>
                      <Text style={styles.label}>PALETTE</Text>
                      <View style={styles.colorCircle} />
                      <Text style={styles.colorText}>
                        {outfit.color_scheme_analysis ? "See Analysis" : "Matching"}
                      </Text>
                   </View>
                </View>

              </View>

              {/* --- REASONING --- */}
              <View style={styles.textBox}>
                <Text style={styles.sectionHeader}>Why this works:</Text>
                <Text style={styles.reasoning}>{outfit.reasoning}</Text>
                {outfit.color_scheme_analysis && (
                   <Text style={[styles.reasoning, {marginTop: 10, fontStyle:'italic'}]}>
                     🎨 {outfit.color_scheme_analysis}
                   </Text>
                )}
              </View>

              {/* --- SHOPPING SECTION --- */}
              {outfit.shopping_suggestions && outfit.shopping_suggestions.length > 0 && (
                <View style={styles.shoppingSection}>
                   <Text style={styles.sectionHeader}>Elevate this look (Shopping):</Text>
                   {outfit.shopping_suggestions.map((item: any, index: number) => (
                      <TouchableOpacity key={index} style={styles.shopCard} onPress={() => openSearch(item.item_name)}>
                         <View style={{flex: 1}}>
                            <Text style={styles.shopName}>{item.item_name}</Text>
                            <Text style={styles.shopReason}>{item.why}</Text>
                            <Text style={styles.shopStore}>{item.store}</Text>
                         </View>
                         <View style={styles.priceTag}>
                            <Text style={styles.priceText}>{item.price_estimate}</Text>
                         </View>
                      </TouchableOpacity>
                   ))}
                </View>
              )}

              <TouchableOpacity onPress={generate} style={styles.refreshBtn}>
                <Text style={styles.refreshText}>Shuffle Look</Text>
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
  loadingText: {
  marginTop: 12,
  fontSize: 14,
  color: '#52796F',
  fontStyle: 'italic',
  textAlign: 'center',
},

  
  generateBtn: { backgroundColor: '#2F3E46', padding: 20, borderRadius: 20, width: '80%', alignItems: 'center', alignSelf:'center', marginTop: '50%' },
  btnText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  
  layoutRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 20 },
  colSide: { width: '22%', alignItems: 'center', justifyContent: 'flex-start', paddingTop: 20 },
  colCenter: { width: '50%', alignItems: 'center', justifyContent: 'flex-start' },
  
  pieceWrapper: { alignItems: 'center', marginBottom: 20 },
  label: { fontSize: 9, fontWeight: '800', color: '#CAD2C5', marginBottom: 4, textAlign: 'center' },
  emptyLabel: { fontSize: 9, color: '#ccc', textAlign: 'center', marginTop: 20 },

  sideImage: { width: 70, height: 100, borderRadius: 10, resizeMode: 'cover', backgroundColor: '#fff' },
  centerImage: { width: 150, height: 160, borderRadius: 15, resizeMode: 'cover', backgroundColor: '#fff', marginBottom: 2 },
  accImage: { width: 60, height: 60, borderRadius: 30, resizeMode: 'cover', borderWidth: 2, borderColor: '#fff' },

  colorInfoBox: { alignItems: 'center', marginTop: 10 },
  colorCircle: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#d4a373', marginBottom: 2 },
  colorText: { fontSize: 8, color: '#52796F', textAlign: 'center' },

  textBox: { backgroundColor: 'rgba(255,255,255,0.5)', padding: 15, borderRadius: 15, width: '100%', marginBottom: 15 },
  sectionHeader: { fontSize: 14, fontWeight: '700', color: '#2F3E46', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 1 },
  reasoning: { color: '#52796F', fontSize: 13, lineHeight: 18 },

  shoppingSection: { width: '100%' },
  shopCard: { flexDirection: 'row', backgroundColor: '#fff', padding: 12, borderRadius: 12, marginBottom: 8, alignItems: 'center', shadowColor:'#000', shadowOpacity:0.05, shadowRadius:5 },
  shopName: { fontSize: 14, fontWeight: '600', color: '#2F3E46' },
  shopReason: { fontSize: 10, color: '#888', marginTop: 2 },
  shopStore: { fontSize: 10, color: '#52796F', fontWeight: 'bold', marginTop: 2 },
  priceTag: { backgroundColor: '#EAF4F4', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginLeft: 10 },
  priceText: { color: '#2F3E46', fontWeight: 'bold', fontSize: 12 },

  refreshBtn: { marginTop: 10, backgroundColor: '#fff', paddingHorizontal: 25, paddingVertical: 10, borderRadius: 20, alignSelf: 'center' },
  refreshText: { color: '#2F3E46', fontWeight: '700' }
});

//   scrollContent: {
//     alignItems: 'center',
//     paddingBottom: 20,
//   },

//   generateBtn: {
//     backgroundColor: '#2F3E46', // SAME AS INDEX BUTTONS
//     paddingVertical: 18,
//     paddingHorizontal: 45,
//     borderRadius: 30,
//   },

//   btnText: {
//     color: '#fff',
//     fontSize: 18,
//     fontWeight: '500',
//     letterSpacing: 1,
//   },

//   reasoning: {
//     color: '#52796F', // SAME SECONDARY COLOR
//     fontStyle: 'italic',
//     textAlign: 'center',
//     marginBottom: 25,
//     paddingHorizontal: 10,
//   },

//   collage: {
//     gap: 18,
//     alignItems: 'center',
//   },

//   piece: {
//     width: 210,
//     height: 210,
//     borderRadius: 25,
//     resizeMode: 'cover',
//   },

//   refreshBtn: {
//     marginTop: 30,
//     paddingVertical: 10,
//     paddingHorizontal: 30,
//   },

//   refreshText: {
//     color: '#2F3E46',
//     fontWeight: '600',
//     letterSpacing: 1,
//   },
// });
