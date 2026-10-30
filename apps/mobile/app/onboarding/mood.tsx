'use client'

import React from 'react'
import { View, Text, ScrollView, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Button, ProgressIndicator, OnboardingOption } from '@/components/ui'
import { useOnboardingStore } from '@/store/onboardingStore'
import { useThemeStore } from '@/store/themeStore'
import { MOOD_OPTIONS } from '@/constants/onboarding'

export default function MoodOnboardingScreen() {
  const router = useRouter()
  const { data, setMood } = useOnboardingStore()
  const { setTheme } = useThemeStore()
  
  const handleSelectMood = (mood: import('@travel-planner/shared').TravelMood) => {
    setMood(mood)
    setTheme(mood)
  }
  
  const handleContinue = () => {
    if (data.mood) {
      router.push('/onboarding/duration')
    }
  }
  
  const handleSkip = () => {
    router.push('/onboarding/duration')
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
        <ProgressIndicator currentStep={1} totalSteps={5} className="px-6 mb-2" />
        
        <View className="pb-6">
          <Text className="font-sans font-medium text-[26px] text-text mx-6 mt-2 mb-1">
            What kind of places do you love?
          </Text>
          <Text className="font-sans text-[15px] text-muted mx-6 mb-6">
            This helps us recommend destinations you'll enjoy.
          </Text>
          
          <View className="px-6 gap-3">
            {MOOD_OPTIONS.map((option) => (
              <OnboardingOption
                key={option.value}
                label={option.label}
                description={option.description}
                icon={option.icon}
                selected={data.mood === option.value}
                onPress={() => handleSelectMood(option.value)}
              />
            ))}
          </View>
        </View>
      </ScrollView>
      
      <View className="px-6 pb-8 gap-3">
        <Button 
          variant="primary" 
          size="lg" 
          fullWidth 
          onPress={handleContinue}
          disabled={!data.mood}
        >
          Continue
        </Button>
        <Pressable onPress={handleSkip} accessibilityLabel="Skip this question" className="p-2 items-center">
          <Text className="font-sans text-[15px] text-muted text-center">Skip for now</Text>
        </Pressable>
      </View>
    </View>
  )
}
