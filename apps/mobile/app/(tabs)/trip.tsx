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
import { useTripSync } from '@/hooks/useTripSync'
import { useThemeStore } from '@/store/themeStore'
import { formatCurrency } from '@travel-planner/shared'
import { api } from '@/services/api'
import * as Haptics from 'expo-haptics'

export default function TripScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { tokens } = useThemeStore()
  const { destinations: tripDestinations, removeDestination, reorderDestinations } = useTripStore()
  const trip = useTripSync()
  const [isNearBottom, setIsNearBottom] = useState(false)

  // The store mirrors the server trip (reconciled by useTripSync) and carries
  // optimistic updates; server destinations always include the full payload.
  const enrichedDestinations = tripDestinations.map((item) => ({
    ...item,
    resolvedDestination: item.destination ?? {},
  }))

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
            // Optimistic removal with rollback if the server rejects it.
            const previous = useTripStore.getState().destinations
            removeDestination(destinationId)
            try {
              await api.removeTripItem(destinationId)
              trip.invalidate()
            } catch {
              useTripStore.getState().setDestinations(previous)
              Alert.alert('Could not remove', 'Please check your connection and try again.')
            }
          },
        },
      ]
    )
  }

  const handleMove = (from: number, to: number) => {
    if (to < 0 || to > tripDestinations.length - 1) return
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    } catch {
      // Ignore
    }
    const previous = useTripStore.getState().destinations
    reorderDestinations(from, to)
    void (async () => {
      try {
        const reordered = useTripStore.getState().destinations
        await api.reorderTrip(
          reordered.map((item, idx) => ({
            destinationId: item.destinationId,
            position: idx,
          }))
        )
        trip.invalidate()
      } catch {
        // Roll back to the last server-confirmed order.
        useTripStore.getState().setDestinations(previous)
      }
    })()
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
      <View key="trip-empty" style={{ paddingTop: insets.top }} className="flex-1 bg-background">
        <View className="px-5 pt-4 pb-2">
          <Text className="font-sans font-medium text-[28px] text-foreground tracking-tight">
            Your trip, taking shape.
          </Text>
        </View>
        <EmptyTripState onExplore={() => router.push('/(tabs)/explore')} />
      </View>
    )
  }

  return (
    <View key="trip-populated" style={{ paddingTop: insets.top }} className="flex-1 bg-background">
      {/* Page Title */}
      <View className="px-5 pt-4 pb-2">
        <Text className="font-sans font-medium text-[28px] text-foreground tracking-tight">
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
            <View className="bg-card rounded-[24px] border border-border p-5 gap-4">
              <View className="flex-row items-center justify-between">
                <Text className="font-sans text-[14px] text-muted-foreground">Destinations saved</Text>
                <View className="bg-surface-muted px-3 py-1 rounded-full border border-border">
                  <Text className="font-sans font-medium text-[13px] text-foreground">
                    {destinationCount} {destinationCount === 1 ? 'place' : 'places'}
                  </Text>
                </View>
              </View>

              <View className="pt-3 border-t border-border flex-row items-baseline justify-between">
                <View>
                  <Text className="font-sans text-[13px] text-muted-foreground">Total estimated budget</Text>
                  <Text className="font-sans text-[11px] text-muted-foreground mt-0.5">
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
              <Text className="font-sans font-medium text-[18px] text-foreground">Itinerary stops</Text>
              <Text className="font-sans text-xs text-muted-foreground">Use arrows to reorder</Text>
            </View>
          </View>
        }
        renderItem={({ item, index }) => (
          <ItineraryRow
            position={index}
            destination={item.resolvedDestination}
            onPress={() => router.push(`/destination/${item.destinationId}`)}
            onRemove={() => handleRemove(item.destinationId, item.resolvedDestination?.name)}
            onMoveUp={() => handleMove(index, index - 1)}
            onMoveDown={() => handleMove(index, index + 1)}
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