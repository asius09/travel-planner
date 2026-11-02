'use client'

import React from 'react'
import { View, Text, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useTripStore } from '@/store/tripStore'
import { semanticColors } from '@/theme/colors'
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
      className={`bg-card rounded-[22px] border border-border p-4 active:opacity-90 ${className}`}
    >
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-2">
          <View className="w-7 h-7 rounded-full bg-secondary items-center justify-center">
            <Ionicons name="bookmark" size={14} color={semanticColors.primary} />
          </View>
          <Text className="font-sans text-[14px] font-medium text-card-foreground">Active itinerary</Text>
        </View>

        <View className="flex-row items-center gap-1">
          <Text className="font-sans text-xs text-muted-foreground">View trip</Text>
          <Ionicons name="chevron-forward" size={14} color={semanticColors.mutedForeground} />
        </View>
      </View>

      <View className="flex-row items-baseline justify-between bg-background rounded-[14px] p-3 border border-border">
        <View>
          <Text className="font-sans text-xs text-muted-foreground">Destinations</Text>
          <Text className="font-sans text-[17px] font-medium text-foreground mt-0.5">
            {destinationCount} {destinationCount === 1 ? 'place' : 'places'}
          </Text>
        </View>

        <View className="items-end">
          <Text className="font-sans text-xs text-muted-foreground">Estimated total</Text>
          <Text className="font-sans text-[19px] font-medium text-primary mt-0.5">
            {formatCurrency(totalBudget, 'USD')}
          </Text>
        </View>
      </View>
    </Pressable>
  )
}