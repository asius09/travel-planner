'use client'

import React from 'react'
import { View, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Button } from './Button'
import { useThemeStore } from '@/store/themeStore'

interface EmptyTripStateProps {
  onExplore: () => void
  className?: string
}

export function EmptyTripState({ onExplore, className = '' }: EmptyTripStateProps) {
  const { tokens } = useThemeStore()

  return (
    <View className={`flex-1 items-center justify-center px-6 py-12 ${className}`}>
      {/* Restrained travel visual with soft theme wash */}
      <View
        style={{ backgroundColor: tokens.soft }}
        className="w-20 h-20 rounded-full items-center justify-center mb-6 shadow-sm"
      >
        <Ionicons name="compass-outline" size={40} color={tokens.primary} />
      </View>

      <Text className="font-sans font-medium text-[24px] text-text text-center tracking-tight leading-8 mb-2">
        Every great trip starts somewhere.
      </Text>

      <Text className="font-sans text-[15px] text-muted text-center leading-6 max-w-[280px] mb-8">
        Explore curated destinations and save the places you'd love to visit to assemble your itinerary.
      </Text>

      <View className="w-full max-w-[260px]">
        <Button variant="primary" size="lg" fullWidth onPress={onExplore}>
          Explore destinations
        </Button>
      </View>
    </View>
  )
}
