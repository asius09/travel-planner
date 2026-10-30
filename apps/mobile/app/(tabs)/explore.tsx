'use client'

import React, { useState } from 'react'
import { View, Text, FlatList, ScrollView, Pressable, StyleSheet } from 'react-native'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Ionicons } from '@expo/vector-icons'
import { SearchBar, FilterChip, DestinationCard, SkeletonCard, EmptyState, ErrorState } from '@/components/ui'
import { useRefreshOnFocus } from '@/hooks/useRefreshOnFocus'
import { useThemeStore } from '@/store/themeStore'
import { CATEGORY_FILTERS } from '@/constants/onboarding'
import type { Destination } from '@travel-planner/shared'

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000'

async function fetchDestinations(params: { query?: string; mood?: string; page: number; pageSize: number }) {
  const searchParams = new URLSearchParams()
  if (params.query) searchParams.set('query', params.query)
  if (params.mood && params.mood !== 'all') searchParams.set('mood', params.mood)
  searchParams.set('page', params.page.toString())
  searchParams.set('pageSize', params.pageSize.toString())
  
  const response = await fetch(`${API_URL}/destinations?${searchParams.toString()}`)
  if (!response.ok) throw new Error('Failed to fetch destinations')
  return response.json()
}

export default function ExploreScreen() {
  const router = useRouter()
  const { theme } = useThemeStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<string>('all')
  
  const heroImages: Record<string, string> = {
    nature: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&h=1600&fit=crop',
    city: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1200&h=1600&fit=crop',
    beach: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=1600&fit=crop',
    adventure: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=1200&h=1600&fit=crop',
  }
  
  const heroImage = heroImages[theme] || heroImages.nature
  
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, refetch } = useInfiniteQuery({
    queryKey: ['destinations', searchQuery, selectedFilter],
    queryFn: ({ pageParam = 1 }) => fetchDestinations({
      query: searchQuery || undefined,
      mood: selectedFilter !== 'all' ? selectedFilter : undefined,
      page: pageParam,
      pageSize: 20,
    }),
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000,
  })

  useRefreshOnFocus(refetch)
  
  const destinations = data?.pages.flatMap(page => page.data) ?? []
  const totalCount = data?.pages[0]?.total ?? 0
  
  const handleSearch = (text: string) => {
    setSearchQuery(text)
  }
  
  const handleClearSearch = () => {
    setSearchQuery('')
  }
  
  const handleFilterPress = (filter: string) => {
    setSelectedFilter(filter)
  }
  
  const handleClearFilters = () => {
    setSearchQuery('')
    setSelectedFilter('all')
  }
  
  const hasActiveFilters = searchQuery || selectedFilter !== 'all'
  
  const handleRefresh = () => {
    refetch()
  }
  
  const handleDestinationPress = (destination: Destination) => {
    router.push(`/destination/${destination.id}`)
  }
  
  const handleAddToTrip = (destinationId: string) => {
    console.log('Add to trip:', destinationId)
  }

  const recommendedDestinations = destinations.slice(0, 6)
  const shortEscapeDestinations = destinations.filter(d => d.suggestedDaysMax <= 3).slice(0, 6)
  const otherDestinations = destinations.filter(d => d.suggestedDaysMin >= 4).slice(0, 6)

  if (isLoading && destinations.length === 0) {
    return (
      <View className="flex-1 bg-canvas">
        <View className="relative h-[280px] -mb-10 z-10">
          <View className="flex-1 rounded-b-[32px] overflow-hidden relative">
            <Image source={{ uri: heroImage }} style={StyleSheet.absoluteFill} contentFit="cover" />
            <View className="flex-1 bg-[#202822]/50 p-6 justify-end">
              <Text className="font-sans font-medium text-[30px] leading-9 tracking-tight text-white max-w-[280px]">
                Where would you like to go?
              </Text>
              <Pressable
                onPress={() => router.push('/settings')}
                className="flex-row items-center gap-1.5 mt-4 py-2 px-3.5 bg-white/20 rounded-full self-start"
              >
                <Ionicons name="settings-outline" size={16} color="#FFFFFF" />
                <Text className="font-sans font-medium text-sm text-white">Personalize</Text>
              </Pressable>
            </View>
          </View>
        </View>
        <View className="px-5 pb-8 z-20">
          <SearchBar
            value={searchQuery}
            onChangeText={handleSearch}
            onClear={handleClearSearch}
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mt-2 mb-2">
            <View className="flex-row px-5 gap-2.5">
              {CATEGORY_FILTERS.map((filter) => (
                <FilterChip
                  key={filter.value}
                  label={filter.label}
                  selected={selectedFilter === filter.value}
                  onPress={() => handleFilterPress(filter.value)}
                />
              ))}
            </View>
          </ScrollView>
          <View className="gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </View>
        </View>
      </View>
    )
  }
  
  if (isError) {
    return (
      <View className="flex-1 bg-canvas">
        <View className="relative h-[280px] -mb-10 z-10">
          <View className="flex-1 rounded-b-[32px] overflow-hidden relative">
            <Image source={{ uri: heroImage }} style={StyleSheet.absoluteFill} contentFit="cover" />
            <View className="flex-1 bg-[#202822]/50 p-6 justify-end">
              <Text className="font-sans font-medium text-[30px] leading-9 tracking-tight text-white max-w-[280px]">
                Where would you like to go?
              </Text>
              <Pressable
                onPress={() => router.push('/settings')}
                className="flex-row items-center gap-1.5 mt-4 py-2 px-3.5 bg-white/20 rounded-full self-start"
              >
                <Ionicons name="settings-outline" size={16} color="#FFFFFF" />
                <Text className="font-sans font-medium text-sm text-white">Personalize</Text>
              </Pressable>
            </View>
          </View>
        </View>
        <View className="px-5 pb-8 z-20">
          <SearchBar
            value={searchQuery}
            onChangeText={handleSearch}
            onClear={handleClearSearch}
          />
          <ErrorState
            message="Unable to load destinations. Please check your connection and try again."
            onRetry={handleRefresh}
          />
        </View>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-canvas">
      <View className="relative h-[280px] -mb-10 z-10">
        <View className="flex-1 rounded-b-[32px] overflow-hidden relative">
          <Image source={{ uri: heroImage }} style={StyleSheet.absoluteFill} contentFit="cover" />
          <View className="flex-1 bg-[#202822]/50 p-6 justify-end">
            <Text className="font-sans font-medium text-[30px] leading-9 tracking-tight text-white max-w-[280px]">
              Where would you like to go?
            </Text>
            <Pressable
              onPress={() => router.push('/settings')}
              className="flex-row items-center gap-1.5 mt-4 py-2 px-3.5 bg-white/20 rounded-full self-start"
            >
              <Ionicons name="settings-outline" size={16} color="#FFFFFF" />
              <Text className="font-sans font-medium text-sm text-white">Personalize</Text>
            </Pressable>
          </View>
        </View>
      </View>
      
      <View className="px-5 pb-8 z-20 flex-1">
        <SearchBar
          value={searchQuery}
          onChangeText={handleSearch}
          onClear={handleClearSearch}
        />
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-2 mb-2">
          <View className="flex-row gap-2.5">
            {CATEGORY_FILTERS.map((filter) => (
              <FilterChip
                key={filter.value}
                label={filter.label}
                selected={selectedFilter === filter.value}
                onPress={() => handleFilterPress(filter.value)}
              />
            ))}
          </View>
        </ScrollView>
        
        {hasActiveFilters ? (
          <View className="flex-row items-center justify-between mb-3">
            <Text className="font-sans text-sm text-muted">
              {totalCount} place{totalCount !== 1 ? 's' : ''} found
            </Text>
            <Pressable onPress={handleClearFilters}>
              <Text className="font-sans font-medium text-sm text-primary">Clear filters</Text>
            </Pressable>
          </View>
        ) : null}
        
        {destinations.length === 0 ? (
          <EmptyState
            icon="search-outline"
            title="No places match that search"
            description="Try another name or clear a filter."
            actionLabel="Clear filters"
            onAction={handleClearFilters}
          />
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 20, paddingBottom: 60 }}>
            {/* Picked for your mood */}
            {recommendedDestinations.length > 0 && (
              <View className="gap-3">
                <View className="flex-row items-center justify-between">
                  <Text className="font-sans font-medium text-xl text-text">Picked for your mood</Text>
                  <Text className="font-sans text-[15px] text-muted">Based on your preferences</Text>
                </View>
                <View className="gap-3">
                  {recommendedDestinations.map(item => (
                    <DestinationCard
                      key={item.id}
                      destination={item}
                      onPress={() => handleDestinationPress(item)}
                      onAddToTrip={() => handleAddToTrip(item.id)}
                      currency="USD"
                    />
                  ))}
                </View>
              </View>
            )}
            
            {/* Good for a short escape */}
            {shortEscapeDestinations.length > 0 && (
              <View className="gap-3">
                <View className="flex-row items-center justify-between">
                  <Text className="font-sans font-medium text-xl text-text">Good for a short escape</Text>
                  <Text className="font-sans text-[15px] text-muted">3 days or fewer</Text>
                </View>
                <View className="gap-3">
                  {shortEscapeDestinations.map(item => (
                    <DestinationCard
                      key={item.id}
                      destination={item}
                      onPress={() => handleDestinationPress(item)}
                      onAddToTrip={() => handleAddToTrip(item.id)}
                      currency="USD"
                    />
                  ))}
                </View>
              </View>
            )}
            
            {/* Explore somewhere different */}
            {otherDestinations.length > 0 && (
              <View className="gap-3">
                <View className="flex-row items-center justify-between">
                  <Text className="font-sans font-medium text-xl text-text">Explore somewhere different</Text>
                </View>
                <View className="gap-3">
                  {otherDestinations.map(item => (
                    <DestinationCard
                      key={item.id}
                      destination={item}
                      onPress={() => handleDestinationPress(item)}
                      onAddToTrip={() => handleAddToTrip(item.id)}
                      currency="USD"
                    />
                  ))}
                </View>
              </View>
            )}
            
            {hasNextPage && (
              <Pressable
                onPress={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="self-center mt-4 py-3 px-6 bg-surface rounded-[14px] border border-border"
              >
                <Text className="font-sans font-medium text-[15px] text-primary">
                  {isFetchingNextPage ? 'Loading...' : 'Load more'}
                </Text>
              </Pressable>
            )}
          </ScrollView>
        )}
      </View>
    </View>
  )
}
