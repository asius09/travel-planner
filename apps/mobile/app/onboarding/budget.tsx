'use client'

import React, { useRef, useEffect } from 'react'
import {
  View,
  Text,
  Pressable,
  Animated,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { OnboardingLayout } from '@/components/ui'
import { useOnboardingStore } from '@/store/onboardingStore'
import type { Budget } from '@travel-planner/shared'

interface BudgetTier {
  value: Budget
  tierIndex: number
  symbol: string
  label: string
  range: string
  description: string
  accentColor: string
}

const BUDGET_TIERS: BudgetTier[] = [
  {
    value: 'budget-friendly',
    tierIndex: 1,
    symbol: '$',
    label: 'Budget-friendly',
    range: 'Under $1,000',
    description: 'Keep costs low and travel smart',
    accentColor: '#263F35',
  },
  {
    value: 'balanced',
    tierIndex: 2,
    symbol: '$$',
    label: 'Balanced',
    range: '$1,000 – $3,000',
    description: 'Great value with comfortable stays',
    accentColor: '#D8A66A',
  },
  {
    value: 'premium',
    tierIndex: 3,
    symbol: '$$$',
    label: 'Premium',
    range: '$3,000+',
    description: 'Boutique experiences and fine dining',
    accentColor: '#6B8E7D',
  },
  {
    value: 'not-sure',
    tierIndex: 4,
    symbol: '~',
    label: 'Not sure yet',
    range: 'Flexible',
    description: 'Open to recommendations across budgets',
    accentColor: '#8E9489',
  },
]

// Gauge segment angular configuration (180 deg upper arc)
const GAUGE_SEGMENTS = [
  { angleDeg: 156, rotDeg: -24, color: '#263F35' },
  { angleDeg: 112, rotDeg: -68, color: '#D8A66A' },
  { angleDeg: 68, rotDeg: -112, color: '#6B8E7D' },
  { angleDeg: 24, rotDeg: -156, color: '#A3A89D' },
]

function SemicircularGauge({
  selectedTierIndex,
  currentTier,
}: {
  selectedTierIndex: number
  currentTier: BudgetTier
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current
  const fadeAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    fadeAnim.setValue(0.4)
    scaleAnim.setValue(0.96)
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start()
  }, [selectedTierIndex, fadeAnim, scaleAnim])

  // Center coordinate of arc
  const cx = 130
  const cy = 110
  const radius = 78

  return (
    <View className="items-center justify-center py-4 bg-surface rounded-[24px] border border-border/80 p-6 mb-6">
      {/* Semicircular Arc Display */}
      <View style={{ width: 260, height: 140, position: 'relative' }}>
        {GAUGE_SEGMENTS.map((seg, idx) => {
          const isFilled =
            selectedTierIndex === 4
              ? true
              : idx + 1 <= selectedTierIndex
          const segmentColor = isFilled ? seg.color : '#E5E7DF'
          const rad = (seg.angleDeg * Math.PI) / 180
          const x = cx + radius * Math.cos(rad) - 24
          const y = cy - radius * Math.sin(rad) - 7

          return (
            <View
              key={idx}
              style={{
                position: 'absolute',
                left: x,
                top: y,
                width: 48,
                height: 14,
                borderRadius: 7,
                backgroundColor: segmentColor,
                transform: [{ rotate: `${seg.rotDeg}deg` }],
              }}
            />
          )
        })}

        {/* Center Target Info */}
        <Animated.View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 6,
            alignItems: 'center',
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }}
        >
          <Text className="font-sans text-[11px] uppercase tracking-widest text-muted font-medium mb-1">
            Target budget
          </Text>
          <Text
            className="font-sans font-bold text-[34px] tracking-tight text-text"
            style={{ color: currentTier.accentColor }}
          >
            {currentTier.symbol}
          </Text>
          <Text className="font-sans font-medium text-[15px] text-text mt-0.5">
            {currentTier.label}
          </Text>
          <Text className="font-sans text-xs text-muted mt-0.5">
            {currentTier.range}
          </Text>
        </Animated.View>
      </View>
    </View>
  )
}

export default function BudgetOnboardingScreen() {
  const router = useRouter()
  const { data, setBudget } = useOnboardingStore()

  const currentTier =
    BUDGET_TIERS.find((t) => t.value === data.budget) ?? BUDGET_TIERS[1]

  const handleSelectTier = (tier: BudgetTier) => {
    setBudget(tier.value)
  }

  const handleContinue = () => {
    if (!data.budget) {
      setBudget('balanced')
    }
    router.push('/onboarding/travel-party')
  }

  const handleSkip = () => {
    router.push('/onboarding/travel-party')
  }

  return (
    <OnboardingLayout
      title="What feels right for your budget?"
      subtitle="We calculate trip totals using realistic destination estimates."
      currentStep={3}
      totalSteps={4}
      primaryButtonText="Continue"
      onPrimaryPress={handleContinue}
      secondaryButtonText="Skip for now"
      onSecondaryPress={handleSkip}
    >
      <View className="px-6 pb-2">
        {/* Semicircular Arc Visual Gauge */}
        <SemicircularGauge
          selectedTierIndex={currentTier.tierIndex}
          currentTier={currentTier}
        />

        {/* Budget Tiers List */}
        <View className="gap-3">
          {BUDGET_TIERS.map((tier) => {
            const isSelected = data.budget === tier.value
            return (
              <Pressable
                key={tier.value}
                onPress={() => handleSelectTier(tier)}
                accessibilityRole="button"
                accessibilityLabel={`${tier.label}, ${tier.range}`}
                accessibilityState={{ selected: isSelected }}
                className={`p-4 rounded-[18px] border flex-row items-center justify-between ${
                  isSelected
                    ? 'bg-surface border-primary shadow-sm'
                    : 'bg-surface border-border/80 active:bg-border/20'
                }`}
              >
                <View className="flex-row items-center gap-3.5 flex-1">
                  <View
                    className={`w-11 h-11 rounded-[14px] items-center justify-center ${
                      isSelected ? 'bg-primary' : 'bg-canvas border border-border'
                    }`}
                  >
                    <Text
                      className={`font-sans font-bold text-base ${
                        isSelected ? 'text-accent' : 'text-text'
                      }`}
                    >
                      {tier.symbol}
                    </Text>
                  </View>

                  <View className="flex-1">
                    <View className="flex-row items-center gap-2">
                      <Text className="font-sans font-medium text-[16px] text-text">
                        {tier.label}
                      </Text>
                      <Text className="font-sans text-xs text-muted font-normal">
                        ({tier.range})
                      </Text>
                    </View>
                    <Text className="font-sans text-[13px] text-muted mt-0.5" numberOfLines={1}>
                      {tier.description}
                    </Text>
                  </View>
                </View>

                {isSelected && (
                  <View className="w-6 h-6 rounded-full bg-primary items-center justify-center ml-2">
                    <Ionicons name="checkmark" size={14} color="#D7E58A" />
                  </View>
                )}
              </Pressable>
            )
          })}
        </View>
      </View>
    </OnboardingLayout>
  )
}
