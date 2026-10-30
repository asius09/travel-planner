'use client'

import React from 'react'
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native'
import { Image } from 'expo-image'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { Ionicons } from '@expo/vector-icons'
import { Button, ErrorState } from '@/components/ui'
import { useRefreshOnFocus } from '@/hooks/useRefreshOnFocus'
import { useTripStore } from '@/store/tripStore'
import { api } from '@/services/api'
import { formatCurrency } from '@travel-planner/shared'

export default function DestinationDetailScreen() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const { isInTrip, addDestination } = useTripStore()

  const { data: destination, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['destination', id],
    queryFn: () => api.getDestination(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })

  useRefreshOnFocus(refetch)

  const addedToTrip = id ? isInTrip(id) : false

  const handleAddToTrip = async () => {
    if (!id || !destination) return
    if (addedToTrip) {
      router.push('/(tabs)/trip')
      return
    }

    addDestination(id, destination)
    try {
      await api.addTripItem(id)
    } catch {
      // Local state already updated
    }
    router.push('/(tabs)/trip')
  }

  const handleBack = () => {
    router.back()
  }

  if (isLoading) {
    return (
      <View className="flex-1 bg-canvas">
        <View className="relative h-[340px]">
          <View className="flex-1 bg-border" />
          <View className="absolute top-12 left-5 z-20">
            <Pressable
              onPress={handleBack}
              accessibilityLabel="Back"
              className="w-11 h-11 rounded-full bg-white/90 items-center justify-center"
            >
              <Ionicons name="chevron-back" size={24} color="#202822" />
            </Pressable>
          </View>
        </View>
        <View className="p-6 gap-4">
          <View className="h-6 w-32 rounded-full bg-border" />
          <View className="h-8 w-64 rounded-full bg-border" />
          <View className="h-20 rounded-2xl bg-border mt-2" />
          <View className="h-12 rounded-xl bg-border mt-4" />
        </View>
      </View>
    )
  }

  if (isError || !destination) {
    const isNotFound = error instanceof Error && error.message === 'NOT_FOUND'
    return (
      <View className="flex-1 bg-canvas">
        <View className="pt-12 px-5">
          <Pressable
            onPress={handleBack}
            accessibilityLabel="Back"
            className="w-11 h-11 rounded-full bg-surface border border-border items-center justify-center mb-6"
          >
            <Ionicons name="chevron-back" size={24} color="#202822" />
          </Pressable>
        </View>
        <View className="p-6 flex-1 justify-center">
          <ErrorState
            title={isNotFound ? 'Destination not found' : 'Something went wrong'}
            message={
              isNotFound
                ? 'This destination does not exist or has been removed.'
                : 'Unable to load destination details. Please try again.'
            }
            retryLabel="Back to Explore"
            onRetry={() => router.replace('/(tabs)/explore')}
          />
        </View>
      </View>
    )
  }

  const costDisplay = formatCurrency(
    destination.estimatedCostMinor,
    destination.costCurrency as 'USD' | 'INR'
  )
  const costBasis =
    destination.costCurrency === 'USD'
      ? 'Estimated per person for trip (USD)'
      : `Estimated per person for trip (${destination.costCurrency})`

  return (
    <View className="flex-1 bg-canvas">
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View className="relative h-[340px]">
          <Image
            source={{ uri: destination.heroImage }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={300}
          />
          <View className="flex-1 bg-[#202822]/35 p-5 justify-between">
            <View className="flex-row items-center justify-between pt-8">
              <Pressable
                onPress={handleBack}
                accessibilityLabel="Back"
                className="w-11 h-11 rounded-full bg-white/90 items-center justify-center active:opacity-80"
              >
                <Ionicons name="chevron-back" size={24} color="#202822" />
              </Pressable>
              <Pressable
                onPress={handleAddToTrip}
                accessibilityLabel={addedToTrip ? 'View trip' : 'Add to trip'}
                className="w-11 h-11 rounded-full bg-white/90 items-center justify-center active:opacity-80"
              >
                <Ionicons
                  name={addedToTrip ? 'bookmark' : 'bookmark-outline'}
                  size={22}
                  color={addedToTrip ? '#263F35' : '#202822'}
                />
              </Pressable>
            </View>
          </View>
        </View>

        {/* Details Container */}
        <View className="p-6 gap-5">
          <View>
            <Text className="font-sans text-sm text-muted">
              {destination.region ? `${destination.region}, ${destination.country}` : destination.country}
            </Text>
            <Text className="font-sans font-medium text-[28px] leading-[34px] tracking-tight text-text mt-0.5">
              {destination.name}
            </Text>
          </View>

          <Text className="font-sans text-base leading-6 text-text">{destination.description}</Text>

          <View className="h-[1px] bg-border" />

          {/* Highlights */}
          <View className="gap-3">
            <Text className="font-sans font-medium text-lg text-text">Highlights</Text>
            {destination.highlights.map((highlight, index) => (
              <View key={index} className="flex-row items-start gap-3">
                <View className="w-6 h-6 rounded-full items-center justify-center bg-soft mt-0.5">
                  <Ionicons name="checkmark" size={14} color="#263F35" />
                </View>
                <Text className="font-sans text-[15px] leading-[22px] text-text flex-1">
                  {highlight}
                </Text>
              </View>
            ))}
          </View>

          {/* Metadata Grid */}
          <View className="flex-row flex-wrap gap-4 py-3 border-y border-border">
            <View className="flex-row items-center gap-2.5 flex-1 min-w-[140px]">
              <Ionicons name="time-outline" size={20} color="#777F78" />
              <View>
                <Text className="font-sans text-[12px] text-muted">Suggested duration</Text>
                <Text className="font-sans font-medium text-[15px] text-text">
                  {destination.suggestedDaysMin}–{destination.suggestedDaysMax} days
                </Text>
              </View>
            </View>
            <View className="flex-row items-center gap-2.5 flex-1 min-w-[140px]">
              <Ionicons name="compass-outline" size={20} color="#777F78" />
              <View>
                <Text className="font-sans text-[12px] text-muted">Category</Text>
                <Text className="font-sans font-medium text-[15px] text-text capitalize">
                  {destination.categoryTags.slice(0, 2).join(', ')}
                </Text>
              </View>
            </View>
          </View>

          {/* Cost Basis */}
          <View className="gap-1.5 pt-1">
            <Text className="font-sans text-[13px] text-muted">Estimated budget</Text>
            <Text className="font-sans font-medium text-3xl text-primary">{costDisplay}</Text>
            <Text className="font-sans text-[13px] text-muted">{costBasis}</Text>
          </View>

          {/* CTA */}
          <View className="mt-2">
            <Button
              variant={addedToTrip ? 'secondary' : 'primary'}
              size="lg"
              fullWidth
              onPress={handleAddToTrip}
            >
              {addedToTrip ? 'Added to trip — View trip' : 'Add to trip'}
            </Button>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}
