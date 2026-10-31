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
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 22,
        borderWidth: 1,
        borderColor: '#E7E3DB',
        padding: 16,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View
            style={{
              backgroundColor: tokens.soft,
              width: 28,
              height: 28,
              borderRadius: 14,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="bookmark" size={14} color={tokens.primary} />
          </View>
          <Text style={{ fontFamily: 'Geist', fontSize: 14, fontWeight: '500', color: '#252B2D' }}>Active itinerary</Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Text style={{ fontFamily: 'Geist', fontSize: 12, color: '#454B4D' }}>View trip</Text>
          <Ionicons name="chevron-forward" size={14} color="#454B4D" />
        </View>
      </View>

      <View style={{
        flexDirection: 'row',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        backgroundColor: '#DCE5E7',
        borderRadius: 14,
        padding: 12,
        borderWidth: 1,
        borderColor: '#E7E3DB',
      }}>
        <View>
          <Text style={{ fontFamily: 'Geist', fontSize: 12, color: '#454B4D' }}>Destinations</Text>
          <Text style={{ fontFamily: 'Geist', fontSize: 17, fontWeight: '500', color: '#252B2D', marginTop: 2 }}>
            {destinationCount} {destinationCount === 1 ? 'place' : 'places'}
          </Text>
        </View>

        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ fontFamily: 'Geist', fontSize: 12, color: '#454B4D' }}>Estimated total</Text>
          <Text
            style={{ fontFamily: 'Geist', fontSize: 19, fontWeight: '500', color: tokens.primary, marginTop: 2 }}
          >
            {formatCurrency(totalBudget, 'USD')}
          </Text>
        </View>
      </View>
    </Pressable>
  )
}