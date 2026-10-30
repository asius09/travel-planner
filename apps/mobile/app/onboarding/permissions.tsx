'use client'

import React from 'react'
import { View, Text, ScrollView, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Button } from '@/components/ui'
import { useOnboardingStore } from '@/store/onboardingStore'

export default function PermissionsOnboardingScreen() {
  const router = useRouter()
  const { completeOnboarding } = useOnboardingStore()
  
  const handleEnableLocation = () => {
    completeOnboarding()
    router.push('/(tabs)')
  }
  
  const handleEnableNotifications = () => {
    completeOnboarding()
    router.push('/(tabs)')
  }
  
  const handleSkip = () => {
    completeOnboarding()
    router.push('/(tabs)')
  }
  
  const handleBack = () => {
    router.back()
  }

  return (
    <View className="flex-1 bg-canvas">
      <View className="flex-row items-center justify-between px-6 pt-5 pb-3">
        <Pressable onPress={handleBack} accessibilityLabel="Back" className="p-2 -ml-2">
          <Ionicons name="chevron-back" size={28} color="#202822" />
        </Pressable>
      </View>
      
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="pb-6">
          <Text className="font-sans font-medium text-[26px] text-text mx-6 mt-2 mb-1">
            Make planning a little easier
          </Text>
          <Text className="font-sans text-[15px] text-muted mx-6 mb-6">
            These are optional. You can enable them later in Settings.
          </Text>
          
          <View className="bg-surface rounded-2xl border border-border p-5 mx-6 mb-4 gap-3">
            <View className="flex-row items-start gap-3">
              <View className="w-12 h-12 rounded-[14px] items-center justify-center bg-soft">
                <Ionicons name="location-outline" size={24} color="#263F35" />
              </View>
              <View className="flex-1">
                <Text className="font-sans font-medium text-[17px] text-text">Use your location</Text>
                <Text className="font-sans text-sm text-muted leading-5 mt-0.5">Help sort nearby ideas and find local recommendations.</Text>
              </View>
            </View>
            <View className="flex-row gap-3 mt-2">
              <Button variant="primary" size="sm" onPress={handleEnableLocation} className="flex-1">
                Enable location
              </Button>
              <Button variant="ghost" size="sm" onPress={() => {}} className="flex-1">
                Not now
              </Button>
            </View>
          </View>
          
          <View className="bg-surface rounded-2xl border border-border p-5 mx-6 mb-4 gap-3">
            <View className="flex-row items-start gap-3">
              <View className="w-12 h-12 rounded-[14px] items-center justify-center bg-soft">
                <Ionicons name="notifications-outline" size={24} color="#263F35" />
              </View>
              <View className="flex-1">
                <Text className="font-sans font-medium text-[17px] text-text">Get useful reminders</Text>
                <Text className="font-sans text-sm text-muted leading-5 mt-0.5">Receive trip reminders when you choose to plan.</Text>
              </View>
            </View>
            <View className="flex-row gap-3 mt-2">
              <Button variant="primary" size="sm" onPress={handleEnableNotifications} className="flex-1">
                Enable notifications
              </Button>
              <Button variant="ghost" size="sm" onPress={() => {}} className="flex-1">
                Maybe later
              </Button>
            </View>
          </View>
        </View>
      </ScrollView>
      
      <View className="px-6 pb-8 gap-3">
        <Button 
          variant="primary" 
          size="lg" 
          fullWidth 
          onPress={() => {
            completeOnboarding()
            router.push('/(tabs)')
          }}
        >
          Explore destinations
        </Button>
        <Pressable onPress={handleSkip} accessibilityLabel="Skip permissions" className="p-2 items-center">
          <Text className="font-sans text-[15px] text-muted text-center">Not now</Text>
        </Pressable>
      </View>
    </View>
  )
}
