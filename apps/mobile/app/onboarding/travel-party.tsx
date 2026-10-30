'use client'

import React, { useRef } from 'react'
import { View, Text, Pressable, Animated } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { OnboardingLayout } from '@/components/ui'
import { useOnboardingStore } from '@/store/onboardingStore'
import type { TravelParty } from '@travel-planner/shared'

interface TravelPartyOption {
  value: TravelParty
  label: string
  subtitle: string
  icon: keyof typeof Ionicons.glyphMap
  badgeCount: string
}

const PARTY_OPTIONS: TravelPartyOption[] = [
  {
    value: 'solo',
    label: 'Solo',
    subtitle: 'Going alone',
    icon: 'person-outline',
    badgeCount: '1 person',
  },
  {
    value: 'couple',
    label: 'Couple',
    subtitle: 'Two of us',
    icon: 'heart-outline',
    badgeCount: '2 people',
  },
  {
    value: 'friends',
    label: 'Friends',
    subtitle: 'Group getaway',
    icon: 'people-outline',
    badgeCount: '3+ people',
  },
  {
    value: 'family',
    label: 'Family',
    subtitle: 'With children',
    icon: 'home-outline',
    badgeCount: 'All ages',
  },
]

function PartyCard({
  item,
  selected,
  onSelect,
}: {
  item: TravelPartyOption
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
        aspectRatio: 0.95,
      }}
    >
      <Pressable
        onPress={onSelect}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: selected }}
        accessibilityLabel={`${item.label}, ${item.subtitle}`}
        className={`w-full h-full p-4 rounded-[22px] justify-between border ${
          selected
            ? 'bg-surface border-[2px] border-primary shadow-sm'
            : 'bg-surface border-border/80 active:bg-border/20'
        }`}
      >
        <View className="flex-row items-center justify-between">
          <View
            className={`w-11 h-11 rounded-full items-center justify-center ${
              selected ? 'bg-primary' : 'bg-canvas border border-border'
            }`}
          >
            <Ionicons
              name={item.icon}
              size={22}
              color={selected ? '#D7E58A' : '#263F35'}
            />
          </View>

          {selected ? (
            <View className="w-6 h-6 rounded-full bg-primary items-center justify-center">
              <Ionicons name="checkmark" size={14} color="#D7E58A" />
            </View>
          ) : (
            <View className="px-2 py-0.5 rounded-full bg-canvas border border-border/60">
              <Text className="font-sans text-[10px] text-muted font-medium">
                {item.badgeCount}
              </Text>
            </View>
          )}
        </View>

        <View className="mt-2">
          <Text className="font-sans font-semibold text-[17px] text-text">
            {item.label}
          </Text>
          <Text className="font-sans text-[13px] text-muted mt-0.5">
            {item.subtitle}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  )
}

export default function TravelPartyOnboardingScreen() {
  const router = useRouter()
  const { data, setTravelParty } = useOnboardingStore()

  const handleSelect = (party: TravelParty) => {
    setTravelParty(party)
  }

  const handleContinue = () => {
    if (data.travelParty) {
      router.push('/onboarding/location')
    }
  }

  const handleSkip = () => {
    router.push('/onboarding/location')
  }

  return (
    <OnboardingLayout
      title="Who's going with you?"
      subtitle="Solo journeys, family escapes, and group trips need different things."
      currentStep={4}
      totalSteps={4}
      primaryButtonText="Continue"
      primaryButtonDisabled={!data.travelParty}
      onPrimaryPress={handleContinue}
      secondaryButtonText="Skip for now"
      onSecondaryPress={handleSkip}
    >
      <View className="px-6 flex-1 justify-center py-4">
        <View className="flex-row flex-wrap justify-between gap-y-4">
          {PARTY_OPTIONS.map((item) => (
            <PartyCard
              key={item.value}
              item={item}
              selected={data.travelParty === item.value}
              onSelect={() => handleSelect(item.value)}
            />
          ))}
        </View>
      </View>
    </OnboardingLayout>
  )
}
