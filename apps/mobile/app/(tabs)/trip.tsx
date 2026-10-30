'use client'

import React from 'react'
import { View, Text, FlatList, Alert, Pressable, StyleSheet } from 'react-native'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Button, EmptyState } from '@/components/ui'
import { useTripStore } from '@/store/tripStore'
import { FALLBACK_DESTINATIONS } from '@/constants/destinations'
import { formatCurrency } from '@travel-planner/shared'
import { api } from '@/services/api'
import type { Destination } from '@travel-planner/shared'

export default function TripScreen() {
  const router = useRouter()
  const { destinations: tripDestinations, removeDestination, reorderDestinations } = useTripStore()

  // Ensure every destination item has full details
  const enrichedDestinations = tripDestinations.map((item) => {
    let dest = item.destination
    if (!dest || !dest.name) {
      dest = FALLBACK_DESTINATIONS.find((d) => d.id === item.destinationId)
    }
    return {
      ...item,
      resolvedDestination: dest,
    }
  })

  // Derived budget calculation
  const totalCostMinor = enrichedDestinations.reduce((total, item) => {
    return total + (item.resolvedDestination?.estimatedCostMinor ?? 0)
  }, 0)

  const destinationCount = tripDestinations.length

  const handleRemove = (destinationId: string, name?: string) => {
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
      reorderDestinations(index, index - 1)
      syncReorder(index, index - 1)
    }
  }

  const handleMoveDown = (index: number) => {
    if (index < tripDestinations.length - 1) {
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

  if (destinationCount === 0) {
    return (
      <View className="flex-1 bg-canvas">
        <View className="px-5 pt-12 pb-3">
          <Text className="font-sans font-medium text-[28px] text-text">
            Your trip, taking shape.
          </Text>
        </View>
        <View className="flex-1 justify-center px-5">
          <EmptyState
            icon="compass-outline"
            title="Every great trip starts somewhere."
            description="Explore destinations and add the places you'd love to visit."
            actionLabel="Explore destinations"
            onAction={() => router.push('/(tabs)/explore')}
          />
        </View>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-canvas">
      {/* Header */}
      <View className="px-5 pt-12 pb-2">
        <Text className="font-sans font-medium text-[28px] text-text">
          Your trip, taking shape.
        </Text>
      </View>

      {/* Budget & Trip Summary Card */}
      <View className="bg-surface rounded-[20px] border border-border p-5 mx-5 mb-4 gap-3">
        <View className="flex-row items-center justify-between">
          <Text className="font-sans text-[15px] text-muted">Destinations saved</Text>
          <Text className="font-sans font-medium text-[17px] text-text">
            {destinationCount} {destinationCount === 1 ? 'place' : 'places'}
          </Text>
        </View>

        <View className="flex-row items-baseline justify-between pt-3 border-t border-border">
          <View>
            <Text className="font-sans text-[14px] text-muted">Total estimated budget</Text>
            <Text className="font-sans text-[12px] text-muted mt-0.5">
              Derived estimate • USD
            </Text>
          </View>
          <Text className="font-sans font-medium text-[28px] text-primary">
            {formatCurrency(totalCostMinor, 'USD')}
          </Text>
        </View>
      </View>

      {/* List Header */}
      <View className="px-5 pb-2 flex-row items-center justify-between">
        <Text className="font-sans font-medium text-lg text-text">Itinerary order</Text>
        <Text className="font-sans text-xs text-muted">Tap arrows to reorder</Text>
      </View>

      {/* Destinations List */}
      <FlatList
        data={enrichedDestinations}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 12, paddingBottom: 110 }}
        renderItem={({ item, index }) => {
          const dest = item.resolvedDestination
          const name = dest?.name ?? 'Destination'
          const country = dest?.country ?? ''
          const costMinor = dest?.estimatedCostMinor ?? 0
          const heroImage =
            dest?.heroImage ??
            'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&h=800&fit=crop'

          return (
            <View className="bg-surface rounded-2xl border border-border p-3.5 flex-row items-center gap-3">
              {/* Position Number */}
              <View className="w-6 h-6 rounded-full bg-soft items-center justify-center">
                <Text className="font-sans font-medium text-xs text-primary">
                  {index + 1}
                </Text>
              </View>

              {/* Destination Thumbnail */}
              <Pressable
                onPress={() => router.push(`/destination/${item.destinationId}`)}
                className="w-16 h-16 rounded-xl overflow-hidden relative"
              >
                <Image
                  source={{ uri: heroImage }}
                  style={StyleSheet.absoluteFill}
                  contentFit="cover"
                />
              </Pressable>

              {/* Destination Info */}
              <Pressable
                onPress={() => router.push(`/destination/${item.destinationId}`)}
                className="flex-1 justify-center"
              >
                <Text
                  className="font-sans font-medium text-[16px] text-text"
                  numberOfLines={1}
                >
                  {name}
                </Text>
                {country ? (
                  <Text className="font-sans text-xs text-muted" numberOfLines={1}>
                    {country}
                  </Text>
                ) : null}
                <Text className="font-sans font-medium text-sm text-primary mt-1">
                  {formatCurrency(costMinor, 'USD')}
                </Text>
              </Pressable>

              {/* Reorder and Delete Controls */}
              <View className="flex-row items-center gap-1">
                <View className="flex-col">
                  <Pressable
                    onPress={() => handleMoveUp(index)}
                    disabled={index === 0}
                    accessibilityLabel="Move up"
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    className={`p-1 ${index === 0 ? 'opacity-20' : 'active:opacity-60'}`}
                  >
                    <Ionicons name="chevron-up" size={18} color="#202822" />
                  </Pressable>
                  <Pressable
                    onPress={() => handleMoveDown(index)}
                    disabled={index === destinationCount - 1}
                    accessibilityLabel="Move down"
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    className={`p-1 ${
                      index === destinationCount - 1 ? 'opacity-20' : 'active:opacity-60'
                    }`}
                  >
                    <Ionicons name="chevron-down" size={18} color="#202822" />
                  </Pressable>
                </View>

                <Pressable
                  onPress={() => handleRemove(item.destinationId, name)}
                  accessibilityLabel="Remove from trip"
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  className="p-2 ml-1 active:opacity-60"
                >
                  <Ionicons name="trash-outline" size={20} color="#E57373" />
                </Pressable>
              </View>
            </View>
          )
        }}
      />

      {/* Floating Bottom Action */}
      <View className="absolute bottom-0 left-0 right-0 p-5 bg-canvas border-t border-border">
        <Button
          variant="outline"
          size="lg"
          fullWidth
          onPress={() => router.push('/(tabs)/explore')}
        >
          Add another place
        </Button>
      </View>
    </View>
  )
}
