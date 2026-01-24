import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView, Image, ActivityIndicator } from 'react-native';
import { getFullCloset, getPeakOutfit } from '../../src/api/geminiapi';

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
    
    const res = await getPeakOutfit(40.7, -74.0, "Casual day");
    setOutfit(res);
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{padding: 20}}><Text style={{fontSize: 22, fontWeight:'500'}}>Create an Outfit</Text></View>
      
      <View style={styles.canvas}>
        {loading ? <ActivityIndicator size="large" /> : !outfit ? (
          <TouchableOpacity onPress={generate} style={{padding:20, backgroundColor:'#fff'}}><Text>Generate</Text></TouchableOpacity>
        ) : (
          <ScrollView contentContainerStyle={{alignItems:'center'}}>
            <Text style={{marginBottom:10, fontStyle:'italic', textAlign:'center'}}>{outfit.reasoning}</Text>
            {['top', 'bottom', 'shoes'].map(part => (
              outfit.outfit_ids?.[part] && images[outfit.outfit_ids[part]] && 
              <Image key={part} source={{ uri: images[outfit.outfit_ids[part]] }} style={styles.piece} />
            ))}
            <TouchableOpacity onPress={generate} style={{marginTop:20, padding:10, backgroundColor:'#ccc'}}><Text>Refresh</Text></TouchableOpacity>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F2' },
  canvas: { flex: 1, margin: 20, backgroundColor: '#D9D9D9', justifyContent: 'center', alignItems: 'center', padding: 20 },
  piece: { width: 150, height: 150, marginBottom: 10, backgroundColor: '#eee' }
});