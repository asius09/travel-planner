'use client'

import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useThemeStore } from '@/store/themeStore'

export default function TabsLayout() {
  const { tokens } = useThemeStore()
  
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: tokens.primary,
        tabBarInactiveTintColor: '#777F78',
        tabBarLabelStyle: {
          fontFamily: 'Geist_Medium',
          fontSize: 12,
        },
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E7DF',
          paddingTop: 8,
          paddingBottom: 8,
          height: 90,
        },
      }}
    >
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons 
              name={focused ? 'compass' : 'compass-outline'} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="trip"
        options={{
          title: 'My Trip',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons 
              name={focused ? 'bookmark' : 'bookmark-outline'} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons 
              name={focused ? 'settings' : 'settings-outline'} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
    </Tabs>
  )
}