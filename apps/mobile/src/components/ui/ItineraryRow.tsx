'use client'

import React from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { Image as ExpoImage } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
import { formatCurrency } from '@travel-planner/shared'
import { useThemeStore } from '@/store/themeStore'
import type { Destination } from '@travel-planner/shared'
import { semanticColors } from '@/theme/colors'

interface ItineraryRowProps {
  position: number
  destination: Partial<Destination>
  onPress: () => void
  onRemove: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  canMoveUp: boolean
  canMoveDown: boolean
  className?: string
}

export function ItineraryRow({
  position,
  destination,
  onPress,
  onRemove,
  onMoveUp,
  canMoveUp,
  canMoveDown,
  onMoveDown,
  className = '',
}: ItineraryRowProps) {
  const { tokens } = useThemeStore()
  const name = destination.name ?? 'Destination'
  const location = destination.region
    ? `${destination.region}, ${destination.country}`
    : destination.country ?? ''
  const costMinor = destination.estimatedCostMinor ?? 0
  const heroImage =
    destination.heroImage ??
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&h=800&fit=crop'

  return (
    <View
      className={`bg-card rounded-[20px] border border-border p-3.5 flex-row items-center gap-3.5 ${className}`}
    >
      {/* Position Badge */}
      <View
        style={{ backgroundColor: tokens.soft }}
        className="w-7 h-7 rounded-full items-center justify-center"
      >
        <Text
          style={{ color: tokens.primary }}
          className="font-sans font-medium text-xs"
        >
          {position + 1}
        </Text>
      </View>

      {/* Thumbnail */}
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`View details for ${name}`}
        className="w-16 h-16 rounded-[14px] overflow-hidden relative bg-surface-muted active:opacity-90"
      >
        <ExpoImage
          source={{ uri: heroImage }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={200}
        />
      </Pressable>

      {/* Info */}
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${name}, ${location}`}
        className="flex-1 justify-center active:opacity-80 min-w-0"
      >
        <Text className="font-sans font-medium text-[16px] text-card-foreground" numberOfLines={1}>
          {name}
        </Text>
        {location ? (
          <Text className="font-sans text-xs text-muted-foreground mt-0.5" numberOfLines={1}>
            {location}
          </Text>
        ) : null}
        <Text
          style={{ color: tokens.primary }}
          className="font-sans font-medium text-sm mt-1"
        >
          {formatCurrency(costMinor, 'USD')}
        </Text>
      </Pressable>

      {/* Reorder and Delete Controls */}
      <View className="flex-row items-center gap-1">
        <View className="flex-col">
          <Pressable
            onPress={onMoveUp}
            disabled={!canMoveUp}
            accessibilityRole="button"
            accessibilityLabel={`Move ${name} up in itinerary`}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            className={`p-1 ${!canMoveUp ? 'opacity-20' : 'active:opacity-60'}`}
          >
            <Ionicons name="chevron-up" size={19} color={semanticColors.foreground} />
          </Pressable>
          <Pressable
            onPress={onMoveDown}
            disabled={!canMoveDown}
            accessibilityRole="button"
            accessibilityLabel={`Move ${name} down in itinerary`}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            className={`p-1 ${!canMoveDown ? 'opacity-20' : 'active:opacity-60'}`}
          >
            <Ionicons name="chevron-down" size={19} color={semanticColors.foreground} />
          </Pressable>
        </View>

        <Pressable
          onPress={onRemove}
          accessibilityRole="button"
          accessibilityLabel={`Remove ${name} from itinerary`}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          className="p-2 ml-0.5 active:opacity-60"
        >
          <Ionicons name="trash-outline" size={19} color={semanticColors.destructive} />
        </Pressable>
      </View>
    </View>
  )
}