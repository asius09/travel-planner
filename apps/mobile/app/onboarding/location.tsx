'use client'

import React, { useState } from 'react'
import { View, Text, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import * as Location from 'expo-location'
import { OnboardingLayout } from '@/components/ui'

export default function LocationPermissionScreen() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const handleEnableLocation = async () => {
    setLoading(true)
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status === 'granted') {
        setStatusMessage('Location enabled ✓')
      }
    } catch {
      // Graceful fallback for mock or unsupported environments
    } finally {
      setLoading(false)
      // Smoothly advance to notifications
      setTimeout(() => {
        router.push('/onboarding/notifications')
      }, 250)
    }
  }

  const handleSkip = () => {
    router.push('/onboarding/notifications')
  }

  return (
    <OnboardingLayout
      title="Find places near you"
      subtitle="Discover nearby destinations, regional getaways, and day trips from where you are."
      primaryButtonText={statusMessage || 'Enable location'}
      primaryButtonLoading={loading}
      onPrimaryPress={handleEnableLocation}
      secondaryButtonText="Not now"
      onSecondaryPress={handleSkip}
    >
      <View className="px-6 flex-1 justify-center py-2">
        {/* Stylized Editorial Route Map Card (inspired by reference image) */}
        <View className="bg-[#EBF2F0] rounded-[26px] border border-[#D5E2DE] p-6 overflow-hidden relative shadow-sm mb-6">
          {/* Subtle Decorative Route Map Nodes and Curves */}
          <View className="flex-row justify-between items-center mb-6">
            <View className="flex-row items-center gap-2 px-3 py-1.5 bg-white/90 rounded-full border border-border/60">
              <View className="w-2.5 h-2.5 rounded-full bg-primary" />
              <Text className="font-sans text-xs font-semibold text-primary">
                Explore nearby
              </Text>
            </View>
            <View className="w-8 h-8 rounded-full bg-white/80 items-center justify-center">
              <Ionicons name="compass-outline" size={18} color="#263F35" />
            </View>
          </View>

          {/* Map Graphic Container */}
          <View className="h-44 relative justify-center items-center">
            {/* Soft decorative waypoint loops */}
            <View
              className="absolute w-48 h-32 rounded-[60px] border-[2px] border-primary/20"
              style={{ transform: [{ rotate: '-12deg' }] }}
            />
            <View
              className="absolute w-40 h-24 rounded-[40px] border-[2px] border-dashed border-primary/30"
              style={{ transform: [{ rotate: '8deg' }] }}
            />

            {/* Waypoint 1: Coastal Escape */}
            <View
              className="absolute top-2 left-4 bg-white/95 px-3 py-1.5 rounded-full shadow-sm border border-border/80 flex-row items-center gap-1.5"
            >
              <Ionicons name="water-outline" size={12} color="#176C70" />
              <Text className="font-sans text-[11px] font-semibold text-text">
                Coastal route
              </Text>
            </View>

            {/* Central Location Beacon */}
            <View className="items-center z-10">
              <View className="w-14 h-14 rounded-full bg-white shadow-md items-center justify-center border-2 border-primary">
                <Ionicons name="location" size={26} color="#263F35" />
              </View>
              <View className="mt-2 bg-primary px-3 py-1 rounded-full shadow-sm">
                <Text className="font-sans text-[11px] font-semibold text-white">
                  Your location
                </Text>
              </View>
            </View>

            {/* Waypoint 2: Mountain Trail */}
            <View
              className="absolute bottom-2 right-4 bg-white/95 px-3 py-1.5 rounded-full shadow-sm border border-border/80 flex-row items-center gap-1.5"
            >
              <Ionicons name="trail-sign-outline" size={12} color="#963F32" />
              <Text className="font-sans text-[11px] font-semibold text-text">
                Weekend trail
              </Text>
            </View>
          </View>
        </View>

        {/* Privacy Note */}
        <View className="flex-row items-center gap-2.5 px-3 py-2 bg-surface rounded-xl border border-border/60">
          <Ionicons name="shield-checkmark-outline" size={18} color="#263F35" />
          <Text className="font-sans text-xs text-muted flex-1 leading-5">
            Your location is used on-device only for sorting recommendations. It is never sold or shared.
          </Text>
        </View>
      </View>
    </OnboardingLayout>
  )
}

