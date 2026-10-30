'use client'

import React, { useState, useRef, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Animated,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { OnboardingLayout, TextMorph } from '@/components/ui'
import { useOnboardingStore } from '@/store/onboardingStore'
import { formatDurationLabel, daysToDurationCategory } from '@/utils/duration'
import type { Duration } from '@travel-planner/shared'

const DAY_OPTIONS = Array.from({ length: 21 }, (_, i) => i + 1)

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

  const [selectedDays, setSelectedDays] = useState<number>(initialDays)
  const [isFlexible, setIsFlexible] = useState<boolean>(data.duration === 'flexible')

  const fadeAnim = useRef(new Animated.Value(1)).current
  const slideAnim = useRef(new Animated.Value(0)).current
  const scrollRef = useRef<React.ElementRef<typeof ScrollView>>(null)

  const triggerTextAnimation = () => {
    fadeAnim.setValue(0.3)
    slideAnim.setValue(6)
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start()
  }

  const handleSelectDays = (days: number) => {
    setIsFlexible(false)
    setSelectedDays(days)
    setDuration(daysToDurationCategory(days))
    triggerTextAnimation()
  }

  const handleSelectFlexible = () => {
    setIsFlexible(true)
    setDuration('flexible')
    triggerTextAnimation()
  }

  const handleIncrement = () => {
    setIsFlexible(false)
    const next = Math.min(selectedDays + 1, 22)
    setSelectedDays(next)
    setDuration(daysToDurationCategory(next))
    triggerTextAnimation()
  }

  const handleDecrement = () => {
    setIsFlexible(false)
    const next = Math.max(selectedDays - 1, 1)
    setSelectedDays(next)
    setDuration(daysToDurationCategory(next))
    triggerTextAnimation()
  }

  const handleContinue = () => {
    if (!data.duration) {
      setDuration(isFlexible ? 'flexible' : daysToDurationCategory(selectedDays))
    }
    router.push('/onboarding/budget')
  }

  const handleSkip = () => {
    router.push('/onboarding/budget')
  }

  const displayLabel = isFlexible ? 'Flexible dates' : formatDurationLabel(selectedDays)
  const categoryDescriptor = isFlexible
    ? 'Open to spontaneous trips or multi-month explorations'
    : selectedDays <= 2
      ? 'Perfect for a weekend escape'
      : selectedDays <= 6
        ? 'Great for a short discovery getaway'
        : 'Ideal for an immersive journey'

  return (
    <OnboardingLayout
      title="How long are you thinking?"
      subtitle="Choose a rough duration so we can match destinations."
      currentStep={2}
      totalSteps={4}
      primaryButtonText="Continue"
      onPrimaryPress={handleContinue}
      secondaryButtonText="Skip for now"
      onSecondaryPress={handleSkip}
    >
      <View className="px-6 flex-1 justify-center py-2">
        {/* Central Expressive Duration Display */}
        <View className="items-center justify-center my-6 bg-surface rounded-[24px] border border-border/80 p-8 shadow-sm">
          <Text className="font-sans text-xs uppercase tracking-widest text-muted font-medium mb-3">
            Target duration
          </Text>

          <View className="items-center">
            <TextMorph
              className="font-sans font-semibold text-[38px] text-text tracking-tight text-center"
              duration={240}
            >
              {displayLabel}
            </TextMorph>
            <TextMorph
              className="font-sans text-[14px] text-muted text-center mt-2 px-4"
              duration={240}
            >
              {categoryDescriptor}
            </TextMorph>
          </View>

          {/* Minus & Plus Stepper Controls */}
          <View className="flex-row items-center gap-6 mt-6">
            <Pressable
              onPress={handleDecrement}
              disabled={isFlexible || selectedDays <= 1}
              accessibilityLabel="Decrease days"
              accessibilityRole="button"
              className={`w-12 h-12 rounded-full items-center justify-center border ${
                isFlexible || selectedDays <= 1
                  ? 'border-border/40 bg-canvas opacity-40'
                  : 'border-border bg-surface active:bg-border/30'
              }`}
            >
              <Ionicons name="remove" size={20} color="#202822" />
            </Pressable>

            <View className="px-3 py-1 bg-soft rounded-full">
              <Text className="font-sans text-xs font-semibold text-primary">
                {isFlexible ? 'Anytime' : `${selectedDays} ${selectedDays === 1 ? 'Day' : 'Days'}`}
              </Text>
            </View>

            <Pressable
              onPress={handleIncrement}
              disabled={isFlexible || selectedDays >= 22}
              accessibilityLabel="Increase days"
              accessibilityRole="button"
              className={`w-12 h-12 rounded-full items-center justify-center border ${
                isFlexible || selectedDays >= 22
                  ? 'border-border/40 bg-canvas opacity-40'
                  : 'border-border bg-surface active:bg-border/30'
              }`}
            >
              <Ionicons name="add" size={20} color="#202822" />
            </Pressable>
          </View>
        </View>

        {/* Horizontal Days Selector Carousel */}
        <View className="mt-2 mb-4">
          <Text className="font-sans text-xs uppercase tracking-wider text-muted font-medium mb-3 px-1">
            Tap a duration
          </Text>
          <ScrollView
            ref={scrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 2, gap: 8 }}
          >
            {DAY_OPTIONS.map((days) => {
              const isSelected = !isFlexible && selectedDays === days
              return (
                <Pressable
                  key={days}
                  onPress={() => handleSelectDays(days)}
                  accessibilityRole="button"
                  accessibilityLabel={`${days} ${days === 1 ? 'day' : 'days'}`}
                  accessibilityState={{ selected: isSelected }}
                  className={`w-12 h-14 rounded-2xl items-center justify-center border ${
                    isSelected
                      ? 'bg-primary border-primary'
                      : 'bg-surface border-border active:bg-border/30'
                  }`}
                >
                  <Text
                    className={`font-sans font-semibold text-base ${
                      isSelected ? 'text-white' : 'text-text'
                    }`}
                  >
                    {days}
                  </Text>
                  <Text
                    className={`font-sans text-[10px] mt-0.5 ${
                      isSelected ? 'text-accent' : 'text-muted'
                    }`}
                  >
                    {days === 7 ? '1w' : days === 14 ? '2w' : days === 21 ? '3w' : 'd'}
                  </Text>
                </Pressable>
              )
            })}

            {/* Flexible option chip */}
            <Pressable
              onPress={handleSelectFlexible}
              accessibilityRole="button"
              accessibilityLabel="Flexible dates"
              accessibilityState={{ selected: isFlexible }}
              className={`px-4 h-14 rounded-2xl items-center justify-center border ${
                isFlexible
                  ? 'bg-primary border-primary'
                  : 'bg-surface border-border active:bg-border/30'
              }`}
            >
              <Text
                className={`font-sans font-medium text-sm ${
                  isFlexible ? 'text-white' : 'text-text'
                }`}
              >
                Flexible
              </Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </OnboardingLayout>
  )
}
