'use client'

import React from 'react'
import { View, Text, StyleSheet, Pressable } from 'react-native'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { Button } from '@/components/ui'
import { useOnboardingStore } from '@/store/onboardingStore'

export default function WelcomeScreen() {
  const router = useRouter()
  const { resetOnboarding } = useOnboardingStore()
  
  const handlePlanTrip = () => {
    resetOnboarding()
    router.push('/onboarding/mood')
  }
  
  const handleSignIn = () => {
    router.push('/auth/signin')
  }

  return (
    <View className="flex-1 bg-canvas">
      <View className="flex-1 relative justify-end p-6 pb-12">
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&h=1600&fit=crop' }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
        />
        <View className="flex-1 bg-[#202822]/60 -m-6 p-6 justify-end">
          <View className="max-w-[320px] gap-4">
            <Text className="font-sans text-[32px] leading-[38px] tracking-tight font-medium text-white">
              Your next trip starts here.
            </Text>
            <Text className="font-sans text-[17px] leading-[26px] text-white/90">
              Find places that fit your mood, time and budget.
            </Text>
            <View className="gap-3 mt-2">
              <Button variant="primary" size="lg" fullWidth onPress={handlePlanTrip}>
                Plan a trip
              </Button>
              <Pressable onPress={handleSignIn} accessibilityRole="button" className="self-center mt-2">
                <Text className="font-sans font-medium text-base text-white/90 underline">
                  I already have an account
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </View>
  )
}
