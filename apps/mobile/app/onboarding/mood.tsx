'use client'

import React, { useRef, useEffect, useState } from 'react'
import {
  View,
  Text,
  Pressable,
  Animated,
  AccessibilityInfo,
  useWindowDimensions,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Image as ExpoImage } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
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
    image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&fit=crop&q=80',
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
  index,
  isReduceMotion,
  cardAspectRatio,
}: {
  item: MoodCardData
  selected: boolean
  onSelect: () => void
  index: number
  isReduceMotion: boolean
  cardAspectRatio: number
}) {
  const [scaleAnim] = useState(() => new Animated.Value(1))
  const [selectAnim] = useState(() => new Animated.Value(selected ? 1 : 0))

  // Coordinated entrance animation
  const [entranceFade] = useState(() => new Animated.Value(isReduceMotion ? 1 : 0))
  const [entranceTranslate] = useState(() => new Animated.Value(isReduceMotion ? 0 : 12))

  useEffect(() => {
    if (!isReduceMotion) {
      Animated.parallel([
        Animated.timing(entranceFade, {
          toValue: 1,
          duration: 280,
          delay: index * 40,
          useNativeDriver: true,
        }),
        Animated.timing(entranceTranslate, {
          toValue: 0,
          duration: 320,
          delay: index * 40,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [isReduceMotion, index])

  useEffect(() => {
    Animated.timing(selectAnim, {
      toValue: selected ? 1 : 0,
      duration: 180,
      useNativeDriver: true,
    }).start()
  }, [selected])

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
      speed: 35,
      bounciness: 0,
    }).start()
  }

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 0,
    }).start()
  }

  const handlePress = () => {
    Haptics.selectionAsync().catch(() => {})
    onSelect()
  }

  return (
    <Animated.View
      style={{
        opacity: entranceFade,
        transform: [{ translateY: entranceTranslate }, { scale: scaleAnim }],
        width: '48%',
        aspectRatio: cardAspectRatio,
      }}
    >
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: selected }}
        accessibilityLabel={`${item.label}, ${item.subtitle}`}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: 24,
          overflow: 'hidden',
          backgroundColor: '#E8EBDD',
        }}
      >
        {/* Edge-to-edge High Quality Photography */}
        <ExpoImage
          source={item.image}
          contentFit="cover"
          transition={200}
          cachePolicy="memory-disk"
          style={{ width: '100%', height: '100%' }}
        />

        {/* Balanced Bottom Gradient Overlay for Crystal-Clear Readability */}
        <LinearGradient
          colors={['transparent', 'rgba(12, 22, 16, 0.45)', 'rgba(8, 16, 12, 0.88)']}
          locations={[0, 0.48, 1]}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: '60%',
            justifyContent: 'flex-end',
            padding: 14,
          }}
          pointerEvents="none"
        >
          <Text
            numberOfLines={1}
            className="font-sans font-medium text-[22px] sm:text-[23px] text-white tracking-tight leading-tight"
          >
            {item.label}
          </Text>
          <Text
            numberOfLines={1}
            className="font-sans font-normal text-[15px] sm:text-[16px] text-white/85 mt-1 leading-snug"
          >
            {item.subtitle}
          </Text>
        </LinearGradient>

        {/* Selection Outline Overlay (Smooth Fade without Layout Jumps) */}
        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            borderRadius: 24,
            borderWidth: 2.5,
            borderColor: '#263F35',
            opacity: selectAnim,
          }}
          pointerEvents="none"
        />

        {/* Compact Check Indicator (Upper Corner, Only on Selected Card) */}
        <Animated.View
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            opacity: selectAnim,
            transform: [
              {
                scale: selectAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.6, 1],
                }),
              },
            ],
          }}
          pointerEvents="none"
        >
          <View className="w-7 h-7 rounded-full bg-primary items-center justify-center border border-white/20 shadow-xs">
            <Ionicons name="checkmark" size={15} color="#D7E58A" />
          </View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  )
}

export default function MoodOnboardingScreen() {
  const router = useRouter()
  const { height: screenHeight } = useWindowDimensions()
  const { data, setMood } = useOnboardingStore()
  const { setTheme } = useThemeStore()
  const [isReduceMotion, setIsReduceMotion] = useState(false)

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled()
      .then(setIsReduceMotion)
      .catch(() => {})
  }, [])

  // Adapt card proportions gracefully based on screen height
  const cardAspectRatio = screenHeight < 720 ? 0.84 : 0.76

  const handleSelectMood = (mood: TravelMood) => {
    setMood(mood)
    setTheme(mood)
  }

  const handleContinue = () => {
    if (!data.mood) {
      handleSelectMood('nature')
    }
    router.push('/onboarding/duration')
  }

  return (
    <OnboardingLayout
      title="What kind of places do you love?"
      currentStep={1}
      totalSteps={4}
      scrollable={false}
      primaryButtonText="Continue"
      onPrimaryPress={handleContinue}
      onBack={() => {
        if (router.canGoBack()) {
          router.back()
        } else {
          router.replace('/')
        }
      }}
    >
      <View className="px-6 flex-1 justify-center pb-2 pt-0.5">
        <View className="flex-row flex-wrap justify-between gap-y-3.5">
          {MOODS.map((item, index) => (
            <MoodCard
              key={item.value}
              item={item}
              selected={data.mood === item.value}
              onSelect={() => handleSelectMood(item.value)}
              index={index}
              isReduceMotion={isReduceMotion}
              cardAspectRatio={cardAspectRatio}
            />
          ))}
        </View>
      </View>
    </OnboardingLayout>
  )
}
