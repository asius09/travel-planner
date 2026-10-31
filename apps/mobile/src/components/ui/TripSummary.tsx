'use client'

import React from 'react'
import { View, Text, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useTripStore } from '@/store/tripStore'
import { useThemeStore } from '@/store/themeStore'
import { formatCurrency } from '@travel-planner/shared'
import * as Haptics from 'expo-haptics'

interface TripSummaryProps {
  onPressAction?: () => void
  className?: string
  showContinueCta?: boolean
}

export function TripSummary({
  onPressAction,
  className = '',
  showContinueCta = true,
}: TripSummaryProps) {
  const router = useRouter()
  const { destinations, getTotalBudget } = useTripStore()
  const { tokens } = useThemeStore()

  const destinationCount = destinations.length
  if (destinationCount === 0) return null

  const totalBudget = getTotalBudget()

  const handlePress = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    } catch {
      // Ignore
    }
    if (onPressAction) {
      onPressAction()
    } else {
      router.push('/(tabs)/trip')
    }
  }

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`Trip summary: ${destinationCount} ${
        destinationCount === 1 ? 'destination' : 'destinations'
      } saved, estimated budget ${formatCurrency(totalBudget, 'USD')}`}
      className={`bg-surface rounded-[22px] border border-border p-4 active:opacity-95 ${className}`}
    >
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-2">
          <View
            style={{ backgroundColor: tokens.soft }}
            className="w-7 h-7 rounded-full items-center justify-center"
          >
            <Ionicons name="bookmark" size={14} color={tokens.primary} />
          </View>
          <Text className="font-sans font-medium text-[14px] text-text">Active itinerary</Text>
        </View>

        <View className="flex-row items-center gap-1">
          <Text className="font-sans text-xs text-muted">View trip</Text>
          <Ionicons name="chevron-forward" size={14} color="#777F78" />
        </View>
      </View>

      <View className="flex-row items-baseline justify-between bg-canvas/60 rounded-[14px] p-3 border border-border/60">
        <View>
          <Text className="font-sans text-[12px] text-muted">Destinations</Text>
          <Text className="font-sans font-medium text-[17px] text-text mt-0.5">
            {destinationCount} {destinationCount === 1 ? 'place' : 'places'}
          </Text>
        </View>

        <View className="items-end">
          <Text className="font-sans text-[12px] text-muted">Estimated total</Text>
          <Text
            style={{ color: tokens.primary }}
            className="font-sans font-medium text-[19px] mt-0.5"
          >
            {formatCurrency(totalBudget, 'USD')}
          </Text>
        </View>
      </View>
    </Pressable>
  )
}
