import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { getMorningWardrobePrep } from '../../src/api/geminiapi';

const COLORS = {
  text: '#49463b',
  accent: '#73634f',
};

// PLACEHOLDER LOGO (Replace uri with your own or require('../../assets...'))
const LOGO_URI = require('../../assets/images/newicons/theLogo.png');

export default function HomeScreen() {
  const router = useRouter();
  const [prep, setPrep] = useState<any>(null);

  useEffect(() => {
    getMorningWardrobePrep(40.7128, -74.0060).then(setPrep);
  }, []);

  return (
    <LinearGradient colors={['#d8cfaf', '#e6b89c']} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          {/* 1. LOGO HEADER */}
          <View style={styles.logoContainer}>
            <Image source={{ uri: LOGO_URI }} style={styles.logo} />
          </View>

          <Text style={styles.welcomeText}>Good Morning.</Text>

          {/* OOTD GLASS CARD */}
          <TouchableOpacity style={styles.glassCard} onPress={() => router.push('/(tabs)/create')}>
            <View>
              <Text style={styles.cardTitle}>Daily Look</Text>
              <Text style={styles.cardSubtitle}>Generate your fit check ✨</Text>
            </View>
            <View style={styles.arrowBtn}>
               <Text style={{fontSize: 20}}>→</Text>
            </View>
          </TouchableOpacity>

          {/* INFO GLASS CARDS */}
          <View style={styles.glassCardSmall}>
             <Text style={styles.cardHeader}>Vibe Check</Text>
             <Text style={styles.cardBody}>{prep?.briefing || "Loading vibes..."}</Text>
          </View>

          <View style={styles.glassCardSmall}>
             <Text style={styles.cardHeader}>Stylist Tip</Text>
             <Text style={styles.cardBody}>{prep?.outfit_tip || "Stay chic."}</Text>
          </View>

        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 25, paddingBottom: 100 },
  logoContainer: { height: 60, justifyContent: 'center', marginBottom: 20 },
  logo: { width: 120, height: 40, resizeMode: 'contain' },
  
  welcomeText: { fontSize: 32, fontWeight: '300', color: COLORS.text, marginBottom: 25, letterSpacing: 1 },
  
  glassCard: {
    backgroundColor: '#d8cfaf',
    borderRadius: 30,
    padding: 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e6b89c',
    shadowColor: '#ed9390',
    shadowOpacity: 0.1,
    shadowRadius: 15,
  },
  glassCardSmall: {
    backgroundColor: '#d8cfaf',
    borderRadius: 25,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e6b89c',
  },
  cardTitle: { fontFamily: 'AesthetNova', fontSize: 24, fontWeight: '600', color: COLORS.text },
  cardSubtitle: { fontSize: 14, color: COLORS.accent, marginTop: 5 },
  cardHeader: { fontWeight: '700', color: COLORS.accent, marginBottom: 5, textTransform: 'uppercase', fontSize: 12, letterSpacing: 1 },
  cardBody: { color: COLORS.text, fontSize: 16 },
  arrowBtn: { backgroundColor: '#fff', width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' }
});