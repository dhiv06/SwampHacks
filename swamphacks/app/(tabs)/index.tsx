import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getMorningWardrobePrep } from '../../src/api/geminiapi';

export default function HomeScreen() {
  const router = useRouter();
  const [prep, setPrep] = useState<any>(null);

  useEffect(() => {
    getMorningWardrobePrep(40.7128, -74.0060).then(setPrep);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.welcomeText}>Welcome!</Text>

        {/* OOTD Card - Navigate to Create Tab */}
        <TouchableOpacity style={styles.ootdCard} onPress={() => router.push('/(tabs)/create')}>
          <View>
            <Text style={styles.ootdTitle}>OOTD</Text>
            <Text style={styles.ootdSubtitle}>Create your outfit for the day</Text>
          </View>
          <Ionicons name="arrow-forward" size={24} color="black" />
        </TouchableOpacity>

        {/* Info Cards */}
        <View style={styles.infoCard}>
           <Text style={styles.cardHeader}>Today&apos;s Vibe</Text>
           <Text>{prep?.briefing || "Loading..."}</Text>
        </View>

        <View style={styles.infoCard}>
           <Text style={styles.cardHeader}>Stylist Tip</Text>
           <Text>{prep?.outfit_tip || "Loading..."}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F2' },
  scrollContent: { padding: 20 },
  welcomeText: { fontSize: 24, fontWeight: '500', marginBottom: 20, marginTop: 10 },
  ootdCard: { backgroundColor: '#D9D9D9', height: 120, padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 },
  ootdTitle: { fontSize: 18, fontWeight: 'bold' },
  ootdSubtitle: { fontSize: 12, marginTop: 5 },
  infoCard: { backgroundColor: '#D9D9D9', padding: 15, marginBottom: 15, height: 100, justifyContent: 'center' },
  cardHeader: { fontWeight: 'bold', marginBottom: 5 },
});