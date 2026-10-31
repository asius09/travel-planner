'use client'

import React, { useState } from 'react'
import {
  View,
  Text,
  FlatList,
  Alert,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Button, EmptyTripState, ItineraryRow, ScreenFade } from '@/components/ui'
import { useTripStore } from '@/store/tripStore'
import { useThemeStore } from '@/store/themeStore'
import { FALLBACK_DESTINATIONS } from '@/constants/destinations'
import { formatCurrency } from '@travel-planner/shared'
import { api } from '@/services/api'
import * as Haptics from 'expo-haptics'

export default function TripScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { tokens } = useThemeStore()
  const { destinations: tripDestinations, removeDestination, reorderDestinations } = useTripStore()
  const [isNearBottom, setIsNearBottom] = useState(false)

  // Enriched destinations
  const enrichedDestinations = tripDestinations.map((item) => {
    let dest = item.destination
    if (!dest || !dest.name) {
      dest = FALLBACK_DESTINATIONS.find((d) => d.id === item.destinationId)
    }
    return {
      ...item,
      resolvedDestination: dest || {},
    }
  })

  // Derived budget calculation
  const totalCostMinor = enrichedDestinations.reduce((total, item) => {
    return total + (item.resolvedDestination?.estimatedCostMinor ?? 0)
  }, 0)

  const destinationCount = tripDestinations.length

  const handleRemove = (destinationId: string, name?: string) => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
    } catch {
      // Ignore
    }

    Alert.alert(
      'Remove destination?',
      name ? `Remove "${name}" from your trip?` : 'Remove this destination from your trip?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            removeDestination(destinationId)
            try {
              await api.removeTripItem(destinationId)
            } catch {
              // Local state updated
            }
          },
        },
      ]
    )
  }

  const handleMoveUp = (index: number) => {
    if (index > 0) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      } catch {
        // Ignore
      }
      reorderDestinations(index, index - 1)
      syncReorder(index, index - 1)
    }
  }

  const handleMoveDown = (index: number) => {
    if (index < tripDestinations.length - 1) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      } catch {
        // Ignore
      }
      reorderDestinations(index, index + 1)
      syncReorder(index, index + 1)
    }
  }

  const syncReorder = async (from: number, to: number) => {
    try {
      const reordered = [...tripDestinations]
      const [moved] = reordered.splice(from, 1)
      reordered.splice(to, 0, moved)
      await api.reorderTrip(
        reordered.map((item, idx) => ({
          destinationId: item.destinationId,
          position: idx,
        }))
      )
    } catch {
      // Local state is already updated
    }
  }

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent
    const paddingToBottom = 40
    const nearBottom =
      layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom
    setIsNearBottom(nearBottom)
  }

  if (destinationCount === 0) {
    return (
      <View key="trip-empty" style={{ paddingTop: insets.top }} className="flex-1 bg-canvas">
        <View className="px-5 pt-4 pb-2">
          <Text className="font-sans font-medium text-[28px] text-text tracking-tight">
            Your trip, taking shape.
          </Text>
        </View>
        <EmptyTripState onExplore={() => router.push('/(tabs)/explore')} />
      </View>
    )
  }

  return (
    <View key="trip-populated" style={{ paddingTop: insets.top }} className="flex-1 bg-canvas">
      {/* Page Title */}
      <View className="px-5 pt-4 pb-2">
        <Text className="font-sans font-medium text-[28px] text-text tracking-tight">
          Your trip, taking shape.
        </Text>
      </View>

      <FlatList
        data={enrichedDestinations}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 8,
          gap: 12,
          paddingBottom: 120, // Clear breathing space for floating dock
        }}
        ListHeaderComponent={
          <View className="gap-4 mb-2">
            {/* Bento-style Budget & Trip Summary Card */}
            <View className="bg-surface rounded-[24px] border border-border p-5 gap-4">
              <View className="flex-row items-center justify-between">
                <Text className="font-sans text-[14px] text-muted">Destinations saved</Text>
                <View className="bg-canvas px-3 py-1 rounded-full border border-border">
                  <Text className="font-sans font-medium text-[13px] text-text">
                    {destinationCount} {destinationCount === 1 ? 'place' : 'places'}
                  </Text>
                </View>
              </View>

              <View className="pt-3 border-t border-border flex-row items-baseline justify-between">
                <View>
                  <Text className="font-sans text-[13px] text-muted">Total estimated budget</Text>
                  <Text className="font-sans text-[11px] text-muted mt-0.5">
                    Derived estimate • USD
                  </Text>
                </View>
                <Text
                  style={{ color: tokens.primary }}
                  className="font-sans font-medium text-[28px] tracking-tight"
                >
                  {formatCurrency(totalCostMinor, 'USD')}
                </Text>
              </View>
            </View>

            {/* List Heading */}
            <View className="flex-row items-baseline justify-between px-1 pt-1">
              <Text className="font-sans font-medium text-[18px] text-text">Itinerary stops</Text>
              <Text className="font-sans text-xs text-muted">Use arrows to reorder</Text>
            </View>
          </View>
        }
        renderItem={({ item, index }) => (
          <ItineraryRow
            position={index}
            destination={item.resolvedDestination}
            onPress={() => router.push(`/destination/${item.destinationId}`)}
            onRemove={() => handleRemove(item.destinationId, item.resolvedDestination?.name)}
            onMoveUp={() => handleMoveUp(index)}
            onMoveDown={() => handleMoveDown(index)}
            canMoveUp={index > 0}
            canMoveDown={index < destinationCount - 1}
          />
        )}
        ListFooterComponent={
          <View className="pt-3 pb-4">
            <Button
              variant="outline"
              size="lg"
              fullWidth
              onPress={() => router.push('/(tabs)/explore')}
            >
              Add another place
            </Button>
          </View>
        }
      />

      <ScreenFade height={85} visible={!isNearBottom} variant="canvas" />
    </View>
  )
}
