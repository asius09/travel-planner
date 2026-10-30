'use client'

import React from 'react'
import { View, Text, FlatList, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button, EmptyState, DestinationCard } from '@/components/ui'
import { useRefreshOnFocus } from '@/hooks/useRefreshOnFocus'
import { useTripStore } from '@/store/tripStore'
import type { Destination } from '@travel-planner/shared'

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000'

async function fetchTrip() {
  const response = await fetch(`${API_URL}/trips`, {
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`,
    },
  })
  if (!response.ok) {
    if (response.status === 401) throw new Error('UNAUTHORIZED')
    throw new Error('Failed to fetch trip')
  }
  return response.json()
}

function getAuthToken() {
  return ''
}

async function removeFromTripApi(destinationId: string) {
  const response = await fetch(`${API_URL}/trips/items/${destinationId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`,
    },
  })
  if (!response.ok) throw new Error('Failed to remove from trip')
}

async function reorderTripApi(items: { destinationId: string; position: number }[]) {
  const response = await fetch(`${API_URL}/trips/reorder`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify({ tripId: '', items }),
  })
  if (!response.ok) throw new Error('Failed to reorder trip')
}

export default function TripScreen() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { destinations: localDestinations, removeDestination, reorderDestinations } = useTripStore()
  
  const { data: trip, isLoading, isError, refetch } = useQuery({
    queryKey: ['trip'],
    queryFn: fetchTrip,
    staleTime: 30 * 1000,
  })

  useRefreshOnFocus(refetch)
  
  const tripDestinations = localDestinations
  
  const removeMutation = useMutation({
    mutationFn: removeFromTripApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip'] })
    },
    onError: () => {
      Alert.alert('Error', 'Failed to remove from trip. Please try again.')
    },
  })
  
  const reorderMutation = useMutation({
    mutationFn: reorderTripApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip'] })
    },
    onError: () => {
      Alert.alert('Error', 'Failed to reorder. Please try again.')
    },
  })
  
  const handleRemove = (destinationId: string) => {
    Alert.alert(
      'Remove from trip?',
      'This will remove the destination from your trip.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => {
            removeDestination(destinationId)
            removeMutation.mutate(destinationId)
          }
        },
      ]
    )
  }
  
  const totalCost = 0
  const destinationCount = tripDestinations.length

  if (isLoading && tripDestinations.length === 0) {
    return (
      <View className="flex-1 bg-canvas">
        <View className="px-5 pt-5 pb-3">
          <Text className="font-sans font-medium text-[28px] text-text">Your trip, taking shape.</Text>
        </View>
        <View className="px-5 gap-3">
          <View className="h-[120px] rounded-2xl bg-border" />
          <View className="h-[120px] rounded-2xl bg-border" />
        </View>
      </View>
    )
  }
  
  if (isError) {
    return (
      <View className="flex-1 bg-canvas">
        <View className="px-5 pt-5 pb-3">
          <Text className="font-sans font-medium text-[28px] text-text">Your trip, taking shape.</Text>
        </View>
        <EmptyState
          icon="alert-circle-outline"
          title="Unable to load trip"
          description="Please check your connection and try again."
          actionLabel="Try again"
          onAction={refetch}
        />
      </View>
    )
  }

  if (tripDestinations.length === 0) {
    return (
      <View className="flex-1 bg-canvas">
        <View className="px-5 pt-5 pb-3">
          <Text className="font-sans font-medium text-[28px] text-text">Your trip, taking shape.</Text>
        </View>
        <EmptyState
          icon="compass-outline"
          title="Every great trip starts somewhere."
          description="Explore destinations and add the places you'd love to visit."
          actionLabel="Explore destinations"
          onAction={() => router.push('/(tabs)/explore')}
        />
      </View>
    )
  }

  return (
    <View className="flex-1 bg-canvas">
      <View className="px-5 pt-5 pb-3">
        <Text className="font-sans font-medium text-[28px] text-text">Your trip, taking shape.</Text>
      </View>
      
      <View className="bg-surface rounded-[20px] border border-border p-5 mx-5 mb-4 gap-3">
        <View className="flex-row items-center justify-between">
          <Text className="font-sans text-[15px] text-muted">Destinations</Text>
          <Text className="font-sans font-medium text-[17px] text-text">{destinationCount}</Text>
        </View>
        <View className="flex-row items-baseline justify-between pt-2 border-t border-border">
          <View>
            <Text className="font-sans text-[15px] text-muted">Estimated budget</Text>
            <Text className="font-sans text-[13px] text-muted ml-0 mt-0.5">Estimates shown in USD</Text>
          </View>
          <Text className="font-sans font-medium text-[28px] text-primary">${(totalCost / 100).toLocaleString()}</Text>
        </View>
      </View>
      
      <View className="px-5 pb-3">
        <Text className="font-sans font-medium text-xl text-text">Destinations</Text>
      </View>
      
      <FlatList
        data={tripDestinations}
        renderItem={({ item }: any) => (
          <DestinationCard
            destination={{ id: item.destinationId, slug: item.destinationId, name: '', country: '', shortDescription: '', description: '', moodTags: [], categoryTags: [], estimatedCostMinor: 0, costCurrency: 'USD', suggestedDaysMin: 1, suggestedDaysMax: 1, highlights: [], heroImage: '', isPublished: true, popularity: 0 } as Destination}
            onPress={() => router.push(`/destination/${item.destinationId}`)}
            onAddToTrip={() => {}}
            addedToTrip={true}
            currency="USD"
          />
        )}
        keyExtractor={(item: any) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 12, paddingBottom: 100 }}
      />
      
      <View className="absolute bottom-0 left-0 right-0 p-5 bg-canvas border-t border-border">
        <Button variant="outline" size="lg" fullWidth onPress={() => router.push('/(tabs)/explore')}>
          Add another place
        </Button>
      </View>
    </View>
  )
}
