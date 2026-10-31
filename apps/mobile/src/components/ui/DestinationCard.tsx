'use client'

import React from 'react'
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
  type GestureResponderEvent,
} from 'react-native'
import { Image as ExpoImage } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { formatCurrency } from '@travel-planner/shared'
import { useTripStore } from '@/store/tripStore'
import * as Haptics from 'expo-haptics'
import type { Destination } from '@travel-planner/shared'
import { semanticColors } from '@/theme/colors'

interface DestinationCardProps {
  destination: Destination
  onPress?: () => void
  onAddToTrip?: () => void
  addedToTrip?: boolean
  style?: StyleProp<ViewStyle>
  className?: string
  currency?: 'USD' | 'INR'
  layout?: 'standard' | 'compact'
}

export function DestinationCard({
  destination,
  onPress,
  onAddToTrip,
  addedToTrip: addedProp,
  style,
  className = '',
  currency = 'USD',
  layout = 'standard',
}: DestinationCardProps) {
  const { isInTrip, addDestination, removeDestination } = useTripStore()

  const isSaved = addedProp !== undefined ? addedProp : isInTrip(destination.id)

  const handleToggleSave = (e: GestureResponderEvent) => {
    e?.stopPropagation?.()
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    } catch {
      // Ignore
    }

    if (onAddToTrip) {
      onAddToTrip()
    } else {
      if (isSaved) {
        removeDestination(destination.id)
      } else {
        addDestination(destination.id, destination)
      }
    }
  }

  const costDisplay = formatCurrency(
    destination.estimatedCostMinor,
    (destination.costCurrency as 'USD' | 'INR') || currency
  )

  const location = destination.region
    ? `${destination.region}, ${destination.country}`
    : destination.country

  const rating = (4.6 + ((destination.popularity || 85) % 4) * 0.1).toFixed(1)

  if (layout === 'compact') {
    return (
      <Pressable
        onPress={onPress}
        style={style}
        accessibilityRole="button"
        accessibilityLabel={`${destination.name}, ${destination.country}`}
        className={`bg-card rounded-[22px] border border-border p-3.5 flex-row items-center gap-3.5 active:opacity-90 ${className}`}
      >
        <View className="w-20 h-20 rounded-[16px] overflow-hidden relative bg-surface-muted">
          <ExpoImage
            source={{ uri: destination.heroImage }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={200}
            cachePolicy="memory-disk"
          />
        </View>

        <View className="flex-1 min-w-0 justify-center">
          <Text className="font-sans text-[12px] text-muted-foreground leading-tight" numberOfLines={1}>
            {location}
          </Text>
          <Text className="font-sans font-medium text-[16px] text-card-foreground mt-0.5 leading-snug" numberOfLines={1}>
            {destination.name}
          </Text>
          <View className="flex-row items-center gap-2 mt-1">
            <Text className="font-sans font-semibold text-[14px] text-primary">
              {costDisplay}
            </Text>
            <Text className="text-muted-foreground text-xs">•</Text>
            <Text className="font-sans text-xs text-muted-foreground">
              {destination.suggestedDaysMin}–{destination.suggestedDaysMax}d
            </Text>
          </View>
        </View>

        <Pressable
          onPress={handleToggleSave}
          accessibilityRole="button"
          accessibilityLabel={isSaved ? 'Remove from trip' : 'Save to trip'}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          className={`w-9 h-9 rounded-full items-center justify-center ${
            isSaved ? 'bg-accent' : 'bg-surface border border-border'
          }`}
        >
          <Ionicons
            name={isSaved ? 'bookmark' : 'bookmark-outline'}
            size={16}
            color={isSaved ? semanticColors.accentForeground : semanticColors.foreground}
          />
        </Pressable>
      </Pressable>
    )
  }

  // Standard full-bleed photographic card (matching premium travel reference design)
  return (
    <Pressable
      onPress={onPress}
      style={style}
      className={`relative h-[250px] rounded-[28px] overflow-hidden bg-surface-muted border border-border/80 active:opacity-95 ${className}`}
      accessibilityRole="button"
      accessibilityLabel={`${destination.name}, ${location}`}
    >
      {/* Background Image */}
      <ExpoImage
        source={{ uri: destination.heroImage }}
        contentFit="cover"
        transition={250}
        cachePolicy="memory-disk"
        style={StyleSheet.absoluteFill}
      />

      {/* Atmospheric Bottom Gradient Mask - Starts at 45% so top half of photograph is clear */}
      <LinearGradient
        colors={[
          'transparent',
          'rgba(0, 0, 0, 0.15)',
          'rgba(0, 0, 0, 0.55)',
          'rgba(0, 0, 0, 0.88)',
        ]}
        locations={[0.4, 0.6, 0.8, 1.0]}
        style={StyleSheet.absoluteFill}
      />

      {/* Top Floating Controls */}
      <View className="absolute top-3.5 left-3.5 right-3.5 flex-row items-center justify-between z-10">
        <View className="flex-row items-center gap-1.5">
          <View className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full border border-white/40">
            <Text className="font-sans text-[11px] text-primary font-semibold capitalize">
              {destination.categoryTags[0] || 'Explore'}
            </Text>
          </View>
          <View className="bg-black/35 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 flex-row items-center gap-1">
            <Ionicons name="star" size={11} color="#FFD233" />
            <Text className="font-sans text-[11px] text-white font-medium">
              {rating}
            </Text>
          </View>
        </View>

        <Pressable
          onPress={handleToggleSave}
          accessibilityRole="button"
          accessibilityLabel={isSaved ? 'Remove from trip' : 'Save to trip'}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          className={`w-9 h-9 rounded-full items-center justify-center border border-white/30 ${
            isSaved ? 'bg-accent' : 'bg-white/90 backdrop-blur-md'
          }`}
        >
          <Ionicons
            name={isSaved ? 'bookmark' : 'bookmark-outline'}
            size={16}
            color={isSaved ? semanticColors.accentForeground : semanticColors.ink900}
          />
        </Pressable>
      </View>

      {/* Bottom Overlaid Information */}
      <View className="flex-1 justify-end p-5">
        <View className="flex-row items-center gap-1 mb-0.5">
          <Ionicons name="location-outline" size={13} color={semanticColors.accent} />
          <Text className="font-sans text-[12.5px] text-white/90 leading-tight" numberOfLines={1}>
            {location}
          </Text>
        </View>

        <Text
          className="font-sans font-bold text-[22px] text-white tracking-tight leading-tight"
          numberOfLines={1}
        >
          {destination.name}
        </Text>

        {/* Bottom Actions & Cost Row */}
        <View className="flex-row items-center justify-between mt-2.5 pt-2 border-t border-white/20">
          <View className="flex-row items-baseline gap-1">
            <Text className="font-sans font-bold text-[16.5px] text-accent leading-tight">
              {costDisplay}
            </Text>
            <Text className="font-sans text-[11px] text-white/70">
              • {destination.suggestedDaysMin}–{destination.suggestedDaysMax}d
            </Text>
          </View>

          {/* Quick Add Pill */}
          <Pressable
            onPress={handleToggleSave}
            accessibilityRole="button"
            accessibilityLabel={isSaved ? 'Saved in trip' : 'Add to trip'}
            className={`flex-row items-center gap-1.5 px-3.5 py-1.5 rounded-full ${
              isSaved
                ? 'bg-white/20 border border-white/30'
                : 'bg-accent'
            }`}
          >
            <Ionicons
              name={isSaved ? 'checkmark' : 'add'}
              size={14}
              color={isSaved ? semanticColors.white : semanticColors.accentForeground}
            />
            <Text
              style={{ color: isSaved ? semanticColors.white : semanticColors.accentForeground }}
              className="font-sans font-semibold text-[12px]"
            >
              {isSaved ? 'Saved' : 'Add to trip'}
            </Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  )
}