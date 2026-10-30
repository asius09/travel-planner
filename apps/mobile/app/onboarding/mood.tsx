'use client'

import React, { useRef } from 'react'
import { View, Text, Pressable, Animated } from 'react-native'
import { useRouter } from 'expo-router'
import { Image as ExpoImage } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
import { OnboardingLayout } from '@/components/ui'
import { useOnboardingStore } from '@/store/onboardingStore'
import { useThemeStore } from '@/store/themeStore'
import type { TravelMood } from '@travel-planner/shared'

interface MoodCardData {
  value: TravelMood
  label: string
  subtitle: string
  image: string
}

const MOODS: MoodCardData[] = [
  {
    value: 'nature',
    label: 'Nature',
    subtitle: 'Forests, peaks, lakes',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&fit=crop&q=80',
  },
  {
    value: 'city',
    label: 'City & culture',
    subtitle: 'Streets, architecture',
    image: 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?w=800&fit=crop&q=80',
  },
  {
    value: 'beach',
    label: 'Beach',
    subtitle: 'Coastlines & islands',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&fit=crop&q=80',
  },
  {
    value: 'adventure',
    label: 'Adventure',
    subtitle: 'Trails & wilderness',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&fit=crop&q=80',
  },
]

function MoodCard({
  item,
  selected,
  onSelect,
}: {
  item: MoodCardData
  selected: boolean
  onSelect: () => void
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 20,
    }).start()
  }

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 4,
    }).start()
  }

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }],
        width: '48%',
        aspectRatio: 0.85,
      }}
    >
      <Pressable
        onPress={onSelect}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: selected }}
        accessibilityLabel={`${item.label}, ${item.subtitle}`}
        className={`w-full h-full rounded-[22px] overflow-hidden bg-surface relative ${
          selected
            ? 'border-[2.5px] border-primary'
            : 'border border-border/80'
        }`}
      >
        <ExpoImage
          source={item.image}
          contentFit="cover"
          transition={200}
          style={{ width: '100%', height: '100%' }}
        />

        {/* Subtle Dark Gradient Overlay for Editorial Legibility */}
        <View
          className="absolute inset-0 justify-between p-3.5"
          style={{
            backgroundColor: selected ? 'rgba(20, 36, 28, 0.45)' : 'rgba(0, 0, 0, 0.35)',
          }}
        >
          {/* Top Checkmark Badge */}
          <View className="flex-row justify-end">
            <View
              className={`w-6 h-6 rounded-full items-center justify-center ${
                selected ? 'bg-primary' : 'bg-black/30 border border-white/40'
              }`}
            >
              {selected && (
                <Ionicons name="checkmark" size={14} color="#D7E58A" />
              )}
            </View>
          </View>

          {/* Bottom Editorial Text */}
          <View>
            <Text className="font-sans font-semibold text-[17px] text-white tracking-wide">
              {item.label}
            </Text>
            <Text className="font-sans text-[12px] text-white/80 mt-0.5" numberOfLines={1}>
              {item.subtitle}
            </Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  )
}

export default function MoodOnboardingScreen() {
  const router = useRouter()
  const { data, setMood } = useOnboardingStore()
  const { setTheme } = useThemeStore()

  const handleSelectMood = (mood: TravelMood) => {
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

  return (
    <OnboardingLayout
      title="What kind of places do you love?"
      subtitle="Choose a travel mood to personalize your recommendations."
      currentStep={1}
      totalSteps={4}
      primaryButtonText="Continue"
      primaryButtonDisabled={!data.mood}
      onPrimaryPress={handleContinue}
      secondaryButtonText="Skip for now"
      onSecondaryPress={handleSkip}
    >
      <View className="px-6">
        <View className="flex-row flex-wrap justify-between gap-y-4">
          {MOODS.map((item) => (
            <MoodCard
              key={item.value}
              item={item}
              selected={data.mood === item.value}
              onSelect={() => handleSelectMood(item.value)}
            />
          ))}
        </View>
      </View>
    </OnboardingLayout>
  )
}
