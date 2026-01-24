// FILE: app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          height: 80,
          backgroundColor: '#D9D9D9',
          borderTopWidth: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={{ width: 30, height: 30, backgroundColor: focused ? '#808080' : '#A0A0A0', borderRadius: 4 }} />
          ),
        }}
      />
      <Tabs.Screen
        name="closet"
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={{ width: 30, height: 30, backgroundColor: focused ? '#808080' : '#A0A0A0', borderRadius: 4 }} />
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={{ width: 30, height: 30, backgroundColor: focused ? '#808080' : '#A0A0A0', borderRadius: 4 }} />
          ),
        }}
      />
    </Tabs>
  );
}