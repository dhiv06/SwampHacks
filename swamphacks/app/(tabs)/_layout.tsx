import { Tabs } from 'expo-router';
import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// REPLACE THESE WITH YOUR OWN ICONS IF NEEDED
const ICONS = {
  home: require('../../assets/images/newicons/homeButton.png'),   // Replace with your Home icon path
  closet: require('../../assets/images/newicons/closetButton.png'), // Replace with your Closet icon path
  create: require('../../assets/images/newicons/createButton.png'), // Replace with your Create icon path
};

export default function TabLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: {
            position: 'absolute',
            bottom: 25,
            left: 20,
            right: 20,
            elevation: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.85)', // Glass effect
            borderRadius: 25,
            height: 70,
            borderTopWidth: 0,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.1,
            shadowRadius: 10,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            tabBarIcon: ({ focused }) => (
              <View style={[styles.iconContainer, focused && styles.activeIcon]}>
                <Image 
                  source={ICONS.home}
                  style={{ 
                    width: 50, 
                    height: 50,
                    resizeMode: 'contain'
                  }} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="closet"
          options={{
            tabBarIcon: ({ focused }) => (
              <View style={[styles.iconContainer, focused && styles.activeIcon]}>
                <Image 
                  source={ICONS.closet}
                  style={{ 
                    width: 50, 
                    height: 50,
                    resizeMode: 'contain'
                  }}
                />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="create"
          options={{
            tabBarIcon: ({ focused }) => (
              <View style={[styles.iconContainer, focused && styles.activeIcon]}>
                <Image 
                  source={ICONS.create}
                style={{ 
                  width: 50, 
                  height: 50, 
                  resizeMode: 'contain'
                }}
               />
              </View>
            ),
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    top: 15, // Centers icons vertically in the floating bar
  },
  activeIcon: {
    transform: [{ scale: 1.1 }], // Subtle pop when selected
  },
  icon: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
  }
});