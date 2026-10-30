'use client'

import React from 'react'
import { View, Text, Alert, Pressable, StyleSheet } from 'react-native'
import { Image } from 'expo-image'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { Ionicons } from '@expo/vector-icons'
import { Button, ErrorState } from '@/components/ui'
import { useRefreshOnFocus } from '@/hooks/useRefreshOnFocus'
import { useTripStore } from '@/store/tripStore'
import { formatCurrency } from '@travel-planner/shared'
import type { Destination } from '@travel-planner/shared'

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000'

async function fetchDestination(id: string): Promise<Destination> {
  const response = await fetch(`${API_URL}/destinations/${id}`)
  if (!response.ok) {
    if (response.status === 404) throw new Error('NOT_FOUND')
    throw new Error('Failed to fetch destination')
  }
  return response.json()
}

async function addToTripApi(destinationId: string) {
  const response = await fetch(`${API_URL}/trips/items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ destinationId }),
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error ?? 'Failed to add to trip')
  }
  
  return response.json()
}

export default function DestinationDetailScreen() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const { isInTrip, addDestination } = useTripStore()
  
  const { data: destination, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['destination', id],
    queryFn: () => fetchDestination(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })

  useRefreshOnFocus(refetch)
  
  const addedToTrip = id ? isInTrip(id) : false
  
  const handleAddToTrip = async () => {
    if (!id || !destination) return
    
    try {
      const wasAdded = addDestination(id)
      if (wasAdded) {
        try {
          await addToTripApi(id)
        } catch (apiError) {
          console.warn('Failed to sync to server:', apiError)
        }
        router.push('/(tabs)/trip')
      } else {
        router.push('/(tabs)/trip')
      }
    } catch {
      Alert.alert('Error', 'Failed to add to trip. Please try again.')
    }
  }
  
  const handleBack = () => {
    router.back()
  }

  if (isLoading) {
    return (
      <View className="flex-1 bg-canvas">
        <View className="relative h-[360px]">
          <View className="flex-1 relative">
            <Image source={{ uri: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&h=1600&fit=crop' }} style={StyleSheet.absoluteFill} contentFit="cover" />
            <View className="flex-1 bg-[#202822]/40 p-4 justify-between">
              <Pressable onPress={handleBack} accessibilityLabel="Back" className="w-11 h-11 rounded-full bg-white/90 items-center justify-center self-start">
                <Ionicons name="chevron-back" size={24} color="#202822" />
              </Pressable>
            </View>
          </View>
        </View>
        <View className="p-6 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <View key={i} className="h-5 rounded-full bg-border" />
          ))}
        </View>
      </View>
    )
  }
  
  if (isError || !destination) {
    const isNotFound = error instanceof Error && error.message === 'NOT_FOUND'
    return (
      <View className="flex-1 bg-canvas">
        <View className="relative h-[360px]">
          <View className="flex-1 relative">
            <Image source={{ uri: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&h=1600&fit=crop' }} style={StyleSheet.absoluteFill} contentFit="cover" />
            <View className="flex-1 bg-[#202822]/40 p-4 justify-between">
              <Pressable onPress={handleBack} accessibilityLabel="Back" className="w-11 h-11 rounded-full bg-white/90 items-center justify-center self-start">
                <Ionicons name="chevron-back" size={24} color="#202822" />
              </Pressable>
            </View>
          </View>
        </View>
        <View className="p-6">
          <ErrorState
            title={isNotFound ? 'Destination not found' : 'Something went wrong'}
            message={isNotFound ? 'This destination does not exist or has been removed.' : 'Unable to load destination details. Please try again.'}
            onRetry={() => router.replace('/(tabs)/explore')}
          />
        </View>
      </View>
    )
  }

  const costDisplay = formatCurrency(destination.estimatedCostMinor, destination.costCurrency as 'USD' | 'INR')
  const costBasis = destination.costCurrency === 'USD' ? 'Estimated per person for trip (USD)' : `Estimated per person for trip (${destination.costCurrency})`

  return (
    <View className="flex-1 bg-canvas">
      <View className="relative h-[360px]">
        <View className="flex-1 relative">
          <Image source={{ uri: destination.heroImage }} style={StyleSheet.absoluteFill} contentFit="cover" />
          <View className="flex-1 bg-[#202822]/40 p-4 justify-between">
            <Pressable onPress={handleBack} accessibilityLabel="Back" className="w-11 h-11 rounded-full bg-white/90 items-center justify-center self-start">
              <Ionicons name="chevron-back" size={24} color="#202822" />
            </Pressable>
            <Pressable onPress={handleAddToTrip} accessibilityLabel={addedToTrip ? 'View trip' : 'Add to trip'} className="w-11 h-11 rounded-full bg-white/90 items-center justify-center self-end">
              <Ionicons 
                name={addedToTrip ? 'bookmark' : 'bookmark-outline'} 
                size={24} 
                color={addedToTrip ? '#263F35' : '#202822'} 
              />
            </Pressable>
          </View>
        </View>
      </View>
      
      <View className="p-6 gap-5">
        <View>
          <Text className="font-sans text-sm text-muted">{destination.region ? `${destination.region}, ${destination.country}` : destination.country}</Text>
          <Text className="font-sans font-medium text-[28px] leading-[34px] tracking-tight text-text">{destination.name}</Text>
        </View>
        
        <Text className="font-sans text-base leading-6 text-text">{destination.description}</Text>
        
        <View className="h-[1px] bg-border" />
        
        <View className="gap-3">
          {destination.highlights.map((highlight, index) => (
            <View key={index} className="flex-row items-start gap-3">
              <View className="w-7 h-7 rounded-full items-center justify-center bg-soft mt-0.5">
                <Ionicons name="checkmark" size={16} color="#263F35" />
              </View>
              <Text className="font-sans text-[15px] leading-[22px] text-text flex-1">{highlight}</Text>
            </View>
          ))}
        </View>
        
        <View className="flex-row flex-wrap gap-4 py-2 border-y border-border">
          <View className="flex-row items-center gap-2 flex-1 min-w-[140px]">
            <Ionicons name="time-outline" size={20} color="#777F78" />
            <View>
              <Text className="font-sans text-[13px] text-muted">Suggested duration</Text>
              <Text className="font-sans font-medium text-[15px] text-text">{destination.suggestedDaysMin}–{destination.suggestedDaysMax} days</Text>
            </View>
          </View>
          <View className="flex-row items-center gap-2 flex-1 min-w-[140px]">
            <Ionicons name="star-outline" size={20} color="#777F78" />
            <View>
              <Text className="font-sans text-[13px] text-muted">Category</Text>
              <Text className="font-sans font-medium text-[15px] text-text">{destination.categoryTags.slice(0, 2).join(', ')}</Text>
            </View>
          </View>
        </View>
        
        <View className="gap-2 pt-2">
          <Text className="font-sans text-[13px] text-muted">Estimated cost</Text>
          <Text className="font-sans font-medium text-2xl text-text">{costDisplay}</Text>
          <Text className="font-sans text-[13px] text-muted">{costBasis}</Text>
        </View>
        
        <Button
          variant={addedToTrip ? 'secondary' : 'primary'}
          size="lg"
          fullWidth
          onPress={handleAddToTrip}
          className="mt-2"
        >
          {addedToTrip ? 'Added to trip — View trip' : 'Add to trip'}
        </Button>
      </View>
    </View>
  )
}
