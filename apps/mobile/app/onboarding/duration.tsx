'use client'

import React from 'react'
import { View } from 'react-native'
import { useRouter } from 'expo-router'
import { OnboardingLayout, DayRulerPicker } from '@/components/ui'
import { useOnboardingStore } from '@/store/onboardingStore'
import { daysToDurationCategory } from '@/utils/duration'
import type { Duration } from '@travel-planner/shared'

export default function DurationOnboardingScreen() {
  const router = useRouter()
  const { data, setDuration } = useOnboardingStore()

  // Default initial days based on existing store duration
  const initialDays = (() => {
    if (data.duration === 'weekend') return 2
    if (data.duration === '3-5-days') return 4
    if (data.duration === 'week-plus') return 7
    return 5
  })()

  const handleDurationChange = (days: number, category: Duration, isFlexible: boolean) => {
    setDuration(isFlexible ? 'flexible' : category)
  }

  const handleContinue = () => {
    if (!data.duration) {
      setDuration(daysToDurationCategory(initialDays))
    }
    router.push('/onboarding/budget')
  }

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back()
    } else {
      router.replace('/onboarding/mood')
    }
  }

  return (
    <OnboardingLayout
      title="How long are you thinking?"
      currentStep={2}
      totalSteps={4}
      scrollable={false}
      primaryButtonText="Continue"
      onPrimaryPress={handleContinue}
      onBack={handleBack}
    >
      <View className="px-6 flex-1 justify-center py-2">
        <DayRulerPicker
          initialDays={initialDays}
          isFlexible={data.duration === 'flexible'}
          onChange={handleDurationChange}
        />
      </View>
    </OnboardingLayout>
  )
}
