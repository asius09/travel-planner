'use client'

import React, { useState } from 'react'
import {
  View,
  Text,
  Pressable,
} from 'react-native'
import * as Haptics from 'expo-haptics'
import { Ionicons } from '@expo/vector-icons'
import { WheelPicker, type WheelItem } from './WheelPicker'
import { TextMorph } from './TextMorph'
import { formatDurationLabel, daysToDurationCategory } from '@/utils/duration'
import { semanticColors } from '@/theme/colors'
import type { Duration } from '@travel-planner/shared'

const TOTAL_DAYS = 30

const DURATION_ITEMS: WheelItem<number>[] = Array.from({ length: TOTAL_DAYS }, (_, i) => {
  const days = i + 1
  return {
    value: days,
    label: formatDurationLabel(days),
  }
})

export interface DayRulerPickerProps {
  initialDays?: number
  isFlexible?: boolean
  onChange: (days: number, category: Duration, isFlexible: boolean) => void
}

export function DayRulerPicker({
  initialDays = 5,
  isFlexible: initialFlexible = false,
  onChange,
}: DayRulerPickerProps) {
  const [selectedDays, setSelectedDays] = useState(initialDays)
  const [isFlexible, setIsFlexible] = useState(initialFlexible)

  const handleWheelChange = (days: number) => {
    setSelectedDays(days)
    if (isFlexible) {
      setIsFlexible(false)
    }
    onChange(days, daysToDurationCategory(days), false)
  }

  const handleDecrement = () => {
    const next = Math.max(1, selectedDays - 1)
    setSelectedDays(next)
    if (isFlexible) {
      setIsFlexible(false)
    }
    Haptics.selectionAsync().catch(() => {})
    onChange(next, daysToDurationCategory(next), false)
  }

  const handleIncrement = () => {
    const next = Math.min(TOTAL_DAYS, selectedDays + 1)
    setSelectedDays(next)
    if (isFlexible) {
      setIsFlexible(false)
    }
    Haptics.selectionAsync().catch(() => {})
    onChange(next, daysToDurationCategory(next), false)
  }

  const handleToggleFlexible = () => {
    const next = !isFlexible
    setIsFlexible(next)
    Haptics.selectionAsync().catch(() => {})
    if (next) {
      onChange(selectedDays, 'flexible', true)
    } else {
      onChange(selectedDays, daysToDurationCategory(selectedDays), false)
    }
  }

  const displayLabel = isFlexible ? 'Flexible dates' : formatDurationLabel(selectedDays)
  const categoryDescriptor = isFlexible
    ? 'Open to spontaneous trips or multi-month explorations'
    : selectedDays <= 2
      ? 'Perfect for a weekend escape'
      : selectedDays <= 6
        ? 'Great for a short discovery getaway'
        : selectedDays <= 13
          ? 'Ideal for a full week journey'
          : selectedDays <= 27
            ? 'Multi-week adventure across regions'
            : 'Month-long immersive travel experience'

  return (
    <View className="items-center justify-between w-full h-full py-2">
      {/* Top Section: Target Duration Header */}
      <View className="items-center justify-center pt-2">
        <Text className="font-sans text-[13px] text-muted-foreground font-medium mb-1.5">
          Target duration
        </Text>

        {/* Morphing Big Duration Header */}
        <View className="items-center justify-center h-[52px]">
          <TextMorph
            className="font-sans font-medium text-[36px] text-foreground tracking-tight text-center leading-10"
            duration={75}
          >
            {displayLabel}
          </TextMorph>
        </View>

        {/* Morphing Contextual Descriptor */}
        <View className="items-center justify-center h-[26px] mt-1 px-4">
          <TextMorph
            className="font-sans text-[15px] text-muted-foreground text-center"
            duration={100}
          >
            {categoryDescriptor}
          </TextMorph>
        </View>
      </View>

      {/* Center Section: Symmetrical Duration Wheel with Accessible Steppers */}
      <View className="flex-row items-center justify-between w-full px-4 my-auto">
        {/* Accessible Decrement Stepper (-) */}
        <Pressable
          onPress={handleDecrement}
          disabled={selectedDays <= 1}
          accessibilityRole="button"
          accessibilityLabel="Decrease duration by one day"
          className={`w-12 h-12 rounded-full items-center justify-center border ${
            selectedDays <= 1
              ? 'border-border/40 bg-background opacity-30'
              : 'border-border bg-surface active:bg-border/30 shadow-xs'
          }`}
        >
          <Ionicons name="remove" size={22} color={semanticColors.foreground} />
        </Pressable>

        {/* Vertical Duration Wheel Picker */}
        <View className="flex-1 mx-3">
          <WheelPicker<number>
            items={DURATION_ITEMS}
            selectedValue={selectedDays}
            onValueChange={handleWheelChange}
            orientation="vertical"
            variant="labels-only"
            itemHeight={52}
            fadeColor={semanticColors.background}
          />
        </View>

        {/* Accessible Increment Stepper (+) */}
        <Pressable
          onPress={handleIncrement}
          disabled={selectedDays >= TOTAL_DAYS}
          accessibilityRole="button"
          accessibilityLabel="Increase duration by one day"
          className={`w-12 h-12 rounded-full items-center justify-center border ${
            selectedDays >= TOTAL_DAYS
              ? 'border-border/40 bg-background opacity-30'
              : 'border-border bg-surface active:bg-border/30 shadow-xs'
          }`}
        >
          <Ionicons name="add" size={22} color={semanticColors.foreground} />
        </Pressable>
      </View>

      {/* Bottom Section: Flexible Dates Pill Button */}
      <View className="pb-3 items-center">
        <Pressable
          onPress={handleToggleFlexible}
          accessibilityRole="button"
          accessibilityLabel="Flexible dates"
          accessibilityState={{ selected: isFlexible }}
          className={`px-5 py-2.5 rounded-full flex-row items-center gap-2 border ${
            isFlexible
              ? 'bg-primary border-primary'
              : 'bg-surface border-border active:bg-border/30 shadow-xs'
          }`}
        >
          <Ionicons
            name="calendar-outline"
            size={16}
            color={isFlexible ? semanticColors.primaryForeground : semanticColors.mutedForeground}
          />
          <Text
            className={`font-sans text-[13.5px] font-medium ${
              isFlexible ? 'text-primary-foreground' : 'text-foreground'
            }`}
          >
            I'm flexible with dates
          </Text>
        </Pressable>
      </View>
    </View>
  )
}
