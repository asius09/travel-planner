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
import { semanticColors } from '@/theme/colors'
import type { TravelParty } from '@travel-planner/shared'

interface TravelPartyOption {
  value: TravelParty
  label: string
  subtitle: string
  image: string
}

const PARTY_OPTIONS: TravelPartyOption[] = [
  {
    value: 'solo',
    label: 'Solo',
    subtitle: 'Going alone',
    image: 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=800&fit=crop&q=80',
  },
  {
    value: 'couple',
    label: 'Couple',
    subtitle: 'Two of us',
    image: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800&fit=crop&q=80',
  },
  {
    value: 'friends',
    label: 'Friends',
    subtitle: 'Group getaway',
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&fit=crop&q=80',
  },
  {
    value: 'family',
    label: 'Family',
    subtitle: 'With children',
    image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&fit=crop&q=80',
  },
]

function CompanionCard({
  item,
  selected,
  onSelect,
  index,
  isReduceMotion,
  cardAspectRatio,
}: {
  item: TravelPartyOption
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
          backgroundColor: semanticColors.secondary,
        }}
      >
        {/* Edge-to-edge Photography */}
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
            borderColor: semanticColors.primary,
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
            <Ionicons name="checkmark" size={15} color={semanticColors.primaryForeground} />
          </View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  )
}

export default function TravelPartyOnboardingScreen() {
  const router = useRouter()
  const { height: screenHeight } = useWindowDimensions()
  const { data, setTravelParty } = useOnboardingStore()
  const [isReduceMotion, setIsReduceMotion] = useState(false)

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled()
      .then(setIsReduceMotion)
      .catch(() => {})
  }, [])

  // Adapt card proportions gracefully based on screen height
  const cardAspectRatio = screenHeight < 720 ? 0.84 : 0.76

  const handleSelect = (party: TravelParty) => {
    setTravelParty(party)
  }

  const handleContinue = () => {
    if (!data.travelParty) {
      setTravelParty('couple')
    }
    router.push('/onboarding/location')
  }

  return (
    <OnboardingLayout
      title="Who's coming along?"
      currentStep={4}
      totalSteps={4}
      scrollable={false}
      primaryButtonText="Continue"
      onPrimaryPress={handleContinue}
      onBack={() => {
        if (router.canGoBack()) {
          router.back()
        } else {
          router.replace('/onboarding/budget')
        }
      }}
    >
      <View className="px-6 flex-1 justify-center pb-2 pt-0.5">
        <View className="flex-row flex-wrap justify-between gap-y-3.5">
          {PARTY_OPTIONS.map((item, index) => (
            <CompanionCard
              key={item.value}
              item={item}
              selected={data.travelParty === item.value}
              onSelect={() => handleSelect(item.value)}
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