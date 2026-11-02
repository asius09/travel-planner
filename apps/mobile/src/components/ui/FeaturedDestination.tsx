'use client'

import React from 'react'
import { View, Text, Pressable, StyleSheet, type GestureResponderEvent } from 'react-native'
import { Image as ExpoImage } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { formatCurrency } from '@travel-planner/shared'
import { useTripStore } from '@/store/tripStore'
import * as Haptics from 'expo-haptics'
import type { Destination } from '@travel-planner/shared'
import { semanticColors } from '@/theme/colors'

interface FeaturedDestinationProps {
  destination: Destination
  onPress: () => void
  className?: string
}

export function FeaturedDestination({
  destination,
  onPress,
  className = '',
}: FeaturedDestinationProps) {
  const { isInTrip, addDestination, removeDestination } = useTripStore()
  const isSaved = isInTrip(destination.id)

  const handleToggleSave = (e: GestureResponderEvent) => {
    e?.stopPropagation?.()
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    } catch {
      // Ignore
    }
    if (isSaved) {
      removeDestination(destination.id)
    } else {
      addDestination(destination.id, destination)
    }
  }

  const costDisplay = formatCurrency(
    destination.estimatedCostMinor,
    (destination.costCurrency as 'USD' | 'INR') || 'USD'
  )

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Featured destination: ${destination.name}, ${destination.country}`}
      className={`rounded-[28px] overflow-hidden bg-card border border-border shadow-sm active:opacity-95 ${className}`}
    >
      <View className="relative h-[280px] w-full">
        <ExpoImage
          source={{ uri: destination.heroImage }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={300}
        />

        {/* Ambient bottom gradient mask */}
        <LinearGradient
          colors={['transparent', semanticColors.imageOverlay, semanticColors.imageOverlay]}
          locations={[0.3, 0.65, 1.0]}
          style={StyleSheet.absoluteFill}
        />

        {/* Top Badges */}
        <View className="absolute top-4 left-4 right-4 flex-row items-center justify-between z-10">
          <View className="bg-white/85 px-3 py-1.5 rounded-full border border-white/60">
            <Text className="font-sans font-medium text-[11px] text-foreground">
              Featured discovery
            </Text>
          </View>

          <Pressable
            onPress={handleToggleSave}
            accessibilityRole="button"
            accessibilityLabel={isSaved ? 'Remove from trip' : 'Save to trip'}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            className={`w-10 h-10 rounded-full items-center justify-center ${
              isSaved ? 'bg-primary border border-primary' : 'bg-white/90 border border-white/80'
            }`}
          >
            <Ionicons
              name={isSaved ? 'bookmark' : 'bookmark-outline'}
              size={18}
              color={isSaved ? semanticColors.primaryForeground : semanticColors.foreground}
            />
          </Pressable>
        </View>

        {/* Bottom Hero Overlay */}
        <View className="absolute bottom-4 left-4 right-4 z-10">
          <Text className="font-sans text-[13px] text-white/80" numberOfLines={1}>
            {destination.region ? `${destination.region}, ${destination.country}` : destination.country}
          </Text>
          <Text className="font-sans font-medium text-[24px] text-white leading-tight mt-0.5">
            {destination.name}
          </Text>

          <View className="flex-row items-center justify-between mt-3 pt-2.5 border-t border-white/20">
            <View className="flex-row items-center gap-1.5">
              <Ionicons name="time-outline" size={14} color={semanticColors.white} />
              <Text className="font-sans text-xs text-white/90">
                {destination.suggestedDaysMin}–{destination.suggestedDaysMax} days
              </Text>
            </View>

            <View className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/30">
              <Text className="font-sans font-medium text-xs text-white">
                {costDisplay}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  )
}