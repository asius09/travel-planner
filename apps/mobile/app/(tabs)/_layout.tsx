'use client'

import React from 'react'
import { Tabs } from 'expo-router'
import { FloatingTabBar } from '@/components/navigation/FloatingTabBar'

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarAccessibilityLabel: 'Explore destinations tab',
        }}
      />
      <Tabs.Screen
        name="trip"
        options={{
          title: 'My Trip',
          tabBarAccessibilityLabel: 'My saved trip itinerary tab',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarAccessibilityLabel: 'Settings and preferences tab',
        }}
      />
    </Tabs>
  )
}
