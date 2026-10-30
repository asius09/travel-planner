'use client'

import React from 'react'
import { View, Text, Pressable } from 'react-native'
import { Image as ExpoImage } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
import { formatCurrency } from '@travel-planner/shared'
import type { Destination } from '@travel-planner/shared'

interface DestinationCardProps {
  destination: Destination
  onPress?: () => void
  onAddToTrip?: () => void
  addedToTrip?: boolean
  style?: any
  className?: string
  currency?: 'USD' | 'INR'
}

export function DestinationCard({ 
  destination, 
  onPress, 
  onAddToTrip, 
  addedToTrip = false, 
  style,
  className = '',
  currency = 'USD',
}: DestinationCardProps) {
  const costDisplay = formatCurrency(destination.estimatedCostMinor, destination.costCurrency as 'USD' | 'INR')
  
  return (
    <Pressable 
      onPress={onPress} 
      style={style} 
      className={`bg-surface rounded-[20px] border border-border overflow-hidden ${className}`}
      accessibilityRole="button" 
      accessibilityLabel={`${destination.name}, ${destination.country}`}
    >
      <View className="relative h-[180px] w-full">
        <ExpoImage
          source={destination.heroImage}
          contentFit="cover"
          transition={200}
          placeholder="blur"
          style={{ width: '100%', height: '100%' }}
        />
        {addedToTrip ? (
          <View className="absolute top-3 right-3 flex-row items-center gap-1.5 py-1.5 px-3 bg-soft rounded-full border border-accent">
            <Ionicons name="checkmark-circle" size={16} color="#263F35" />
            <Text className="font-medium text-xs text-primary">Added to trip</Text>
          </View>
        ) : null}
      </View>

      <View className="p-4 gap-2">
        <View className="flex-row items-start justify-between gap-2">
          <View className="flex-1 min-w-0">
            <Text className="font-medium text-[17px] text-text mb-0.5" numberOfLines={1}>{destination.name}</Text>
            <Text className="font-normal text-[13px] text-muted">{destination.region ? `${destination.region}, ${destination.country}` : destination.country}</Text>
          </View>
          <Text className="font-medium text-base text-text mt-0.5">{costDisplay}</Text>
        </View>

        <Text className="font-normal text-sm text-text leading-5" numberOfLines={2}>{destination.shortDescription}</Text>

        <View className="flex-row items-center gap-3 mt-1">
          <View className="flex-row items-center gap-1">
            <Ionicons name="time-outline" size={16} color="#777F78" />
            <Text className="font-normal text-xs text-muted">{destination.suggestedDaysMin}–{destination.suggestedDaysMax} days</Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Ionicons name="star-outline" size={16} color="#777F78" />
            <Text className="font-normal text-xs text-muted">{destination.highlights.slice(0, 2).join(', ')}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  )
}
