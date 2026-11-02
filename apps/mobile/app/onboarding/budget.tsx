'use client'

import React, { useRef, useState, useEffect } from 'react'
import { View, Text, Animated } from 'react-native'
import { useRouter } from 'expo-router'
import Svg, { Path } from 'react-native-svg'
import { OnboardingLayout, WheelPicker, TextMorph, type WheelItem } from '@/components/ui'
import { useOnboardingStore } from '@/store/onboardingStore'
import { semanticColors } from '@/theme/colors'
import type { Budget } from '@travel-planner/shared'

interface BudgetTier {
  value: Budget
  tierIndex: number
  symbol: string
  label: string
  range: string
  accentColor: string
}

const BUDGET_TIERS: BudgetTier[] = [
  {
    value: 'budget-friendly',
    tierIndex: 0,
    symbol: '$',
    label: 'Budget-friendly',
    range: '< $1,000',
    accentColor: semanticColors.primary,
  },
  {
    value: 'balanced',
    tierIndex: 1,
    symbol: '$$',
    label: 'Balanced',
    range: '$1,000 – $3,000',
    accentColor: semanticColors.accent,
  },
  {
    value: 'premium',
    tierIndex: 2,
    symbol: '$$$',
    label: 'Premium',
    range: '$3,000+',
    accentColor: semanticColors.accent,
  },
  {
    value: 'not-sure',
    tierIndex: 3,
    symbol: '~',
    label: 'Not sure yet',
    range: 'Flexible',
    accentColor: semanticColors.mutedForeground,
  },
]

const WHEEL_ITEMS: WheelItem<Budget>[] = BUDGET_TIERS.map((tier) => ({
  value: tier.value,
  label: tier.label,
  symbol: tier.symbol,
  accentColor: tier.accentColor,
}))

// Generous Semicircle Geometry with Plenty of Breathing Room
const SVG_WIDTH = 330
const SVG_HEIGHT = 175
const ARC_CX = 165
const ARC_CY = 158
const ARC_RADIUS = 125
const ARC_STROKE = 14

// Arc sweep of each 37.5 degree section in points
const ARC_SECTION_SWEEP_DEG = 37.5
const ARC_SECTION_LENGTH = ARC_RADIUS * (ARC_SECTION_SWEEP_DEG * Math.PI / 180) // ~81.81

interface ArcSection {
  startDeg: number
  endDeg: number
  color: string
}

// 4 discrete curved sections along 180 deg upper semicircle with 10 deg gaps
const ARC_SECTIONS: ArcSection[] = [
  { startDeg: 180, endDeg: 142.5, color: semanticColors.primary },     // Budget-friendly
  { startDeg: 132.5, endDeg: 95, color: semanticColors.accent },       // Balanced
  { startDeg: 85, endDeg: 47.5, color: semanticColors.accent },        // Premium
  { startDeg: 37.5, endDeg: 0, color: semanticColors.mutedForeground }, // Flexible
]

function getArcSegmentPath(
  cx: number,
  cy: number,
  r: number,
  startDeg: number,
  endDeg: number
) {
  const rad1 = (startDeg * Math.PI) / 180
  const rad2 = (endDeg * Math.PI) / 180
  const x1 = cx + r * Math.cos(rad1)
  const y1 = cy - r * Math.sin(rad1)
  const x2 = cx + r * Math.cos(rad2)
  const y2 = cy - r * Math.sin(rad2)
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 0 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`
}

// Precomputed SVG paths for the 4 sections
const SECTION_PATHS = ARC_SECTIONS.map((s) =>
  getArcSegmentPath(ARC_CX, ARC_CY, ARC_RADIUS, s.startDeg, s.endDeg)
)

/**
 * Large Divided Semicircle Gauge:
 * - 4 discrete curved sections with smooth fluid motion-path fill
 * - Fits directly on the canvas background (no card container)
 * - Radio-like knob removed
 * - Bottom badge removed for pure, minimal editorial clarity
 * - Range aliases (< $1k, $1k – $3k, $3k+, Flexible) cleanly centered in semibold
 */
function BrandSemicircleGauge({
  currentTier,
  tierIndex,
}: {
  currentTier: BudgetTier
  tierIndex: number
}) {
  const targetProgress = (tierIndex + 1) * 0.25
  const [animValue] = useState(() => new Animated.Value(targetProgress))
  const [animatedProgress, setAnimatedProgress] = useState(targetProgress)

  useEffect(() => {
    const id = animValue.addListener(({ value }) => {
      setAnimatedProgress(value)
    })
    Animated.spring(animValue, {
      toValue: targetProgress,
      damping: 20,
      stiffness: 140,
      mass: 0.8,
      useNativeDriver: false,
    }).start()

    return () => {
      animValue.removeListener(id)
    }
  }, [targetProgress, animValue])

  return (
    <View className="items-center justify-center pt-2 pb-1">
      {/* Semicircle SVG Arc Display */}
      <View style={{ width: SVG_WIDTH, height: SVG_HEIGHT, position: 'relative' }}>
        <Svg width={SVG_WIDTH} height={SVG_HEIGHT} viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}>
          {/* 1. Track Underlay for All 4 Sections */}
          {SECTION_PATHS.map((path, idx) => (
            <Path
              key={`track-${idx}`}
              d={path}
              fill="none"
              stroke={semanticColors.border}
              strokeWidth={ARC_STROKE}
              strokeLinecap="round"
              opacity={0.7}
            />
          ))}

          {/* 2. Smooth Motion-Path Fill for Each Section */}
          {ARC_SECTIONS.map((section, idx) => {
            const sectionMin = idx * 0.25
            const localProgress = Math.max(
              0,
              Math.min(1, (animatedProgress - sectionMin) / 0.25)
            )
            const dashOffset = ARC_SECTION_LENGTH * (1 - localProgress)

            if (localProgress <= 0.001) return null

            return (
              <Path
                key={`fill-${idx}`}
                d={SECTION_PATHS[idx]}
                fill="none"
                stroke={section.color}
                strokeWidth={ARC_STROKE}
                strokeLinecap="round"
                strokeDasharray={`${ARC_SECTION_LENGTH} ${ARC_SECTION_LENGTH}`}
                strokeDashoffset={dashOffset}
              />
            )
          })}
        </Svg>

        {/* Interior Center: Target Budget Range (Generous Breathing Room, Zero Overlap) */}
        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 22,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          pointerEvents="none"
        >
          <Text className="font-sans text-[13px] text-muted-foreground font-medium mb-1">
            Target budget
          </Text>

          {/* Main Range Display with Smooth Morph */}
          <TextMorph
            className="font-sans font-medium text-[32px] text-foreground text-center tracking-tight leading-9"
            duration={75}
          >
            {currentTier.range}
          </TextMorph>
        </View>
      </View>
    </View>
  )
}

export default function BudgetOnboardingScreen() {
  const router = useRouter()
  const { data, setBudget } = useOnboardingStore()

  const selectedTier =
    BUDGET_TIERS.find((t) => t.value === data.budget) ?? BUDGET_TIERS[1]

  const handleWheelChange = (val: Budget) => {
    setBudget(val)
  }

  const handleContinue = () => {
    if (!data.budget) {
      setBudget('balanced')
    }
    router.push('/onboarding/travel-party')
  }

  return (
    <OnboardingLayout
      title="What feels right for your budget?"
      currentStep={3}
      totalSteps={4}
      scrollable={false}
      primaryButtonText="Continue"
      onPrimaryPress={handleContinue}
      onBack={() => {
        if (router.canGoBack()) {
          router.back()
        } else {
          router.replace('/onboarding/duration')
        }
      }}
    >
      <View className="px-6 flex-1 justify-between pb-3 pt-1">
        {/* Large Divided Semicircle Gauge with Smooth Motion-Path Fill */}
        <BrandSemicircleGauge
          currentTier={selectedTier}
          tierIndex={selectedTier.tierIndex}
        />

        {/* Full-Width 3D Cylindrical WheelPicker with Labels Only */}
        <View className="w-full my-auto">
          <WheelPicker<Budget>
            items={WHEEL_ITEMS}
            selectedValue={selectedTier.value}
            onValueChange={handleWheelChange}
            orientation="vertical"
            variant="labels-only"
            itemHeight={52}
            fadeColor={semanticColors.background}
          />
        </View>
      </View>
    </OnboardingLayout>
  )
}