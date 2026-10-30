'use client'

import React, { useState } from 'react'
import { View, Text, FlatList, ScrollView, Pressable, StyleSheet } from 'react-native'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Ionicons } from '@expo/vector-icons'
import { SearchBar, FilterChip, DestinationCard, SkeletonCard, EmptyState, ErrorState, Button } from '@/components/ui'
import { useRefreshOnFocus } from '@/hooks/useRefreshOnFocus'
import { useThemeStore } from '@/store/themeStore'
import { useTripStore } from '@/store/tripStore'
import { api } from '@/services/api'
import { CATEGORY_FILTERS } from '@/constants/onboarding'
import type { Destination } from '@travel-planner/shared'

export default function ExploreScreen() {
  const router = useRouter()
  const { theme, tokens } = useThemeStore()
  const { isInTrip, addDestination } = useTripStore()
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
    queryFn: ({ pageParam = 1 }) =>
      api.getDestinations({
        query: searchQuery || undefined,
        mood: selectedFilter !== 'all' ? selectedFilter : undefined,
        page: pageParam,
        pageSize: 20,
      }),
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined),
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000,
  })

  useRefreshOnFocus(refetch)

  const destinations = data?.pages.flatMap((page) => page.data) ?? []
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

  const hasActiveFilters = searchQuery.trim().length > 0 || selectedFilter !== 'all'

  const handleDestinationPress = (destination: Destination) => {
    router.push(`/destination/${destination.id}`)
  }

  const handleAddToTrip = (destination: Destination) => {
    addDestination(destination.id, destination)
  }

  const moodDestinations = destinations.filter((d) => d.moodTags.includes(theme as any))
  const shortEscapeDestinations = destinations.filter((d) => d.suggestedDaysMax <= 3).slice(0, 6)
  const otherDestinations = destinations.filter((d) => !d.moodTags.includes(theme as any)).slice(0, 6)

  if (isLoading && destinations.length === 0) {
    return (
      <View className="flex-1 bg-canvas">
        <View className="relative h-[280px] -mb-10 z-10">
          <Image
            source={{ uri: heroImage }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
          />
          <View className="flex-1 bg-[#202822]/45 p-6 justify-end">
            <View className="max-w-[280px]">
              <Text className="font-sans font-medium text-[32px] text-white leading-9">
                Where would you like to go?
              </Text>
            </View>
          </View>
        </View>

        <View className="flex-1 z-20 px-5 pt-4">
          <View className="gap-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </View>
        </View>
      </View>
    )
  }

  if (isError && destinations.length === 0) {
    return (
      <View className="flex-1 bg-canvas">
        <View className="relative h-[240px]">
          <Image
            source={{ uri: heroImage }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
          />
          <View className="flex-1 bg-[#202822]/50 p-6 justify-end">
            <Text className="font-sans font-medium text-[28px] text-white">
              Where would you like to go?
            </Text>
          </View>
        </View>
        <ErrorState
          title="Could not load destinations"
          message="Check your connection and try again."
          retryLabel="Try again"
          onRetry={() => refetch()}
        />
      </View>
    )
  }

  return (
    <View className="flex-1 bg-canvas">
      {/* Hero Header */}
      <View className="relative h-[260px] -mb-6 z-10">
        <Image
          source={{ uri: heroImage }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={300}
        />
        <View className="flex-1 bg-[#202822]/50 p-5 justify-between">
          <View className="flex-row items-center justify-between pt-8">
            <View className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/30">
              <Text className="font-sans font-medium text-xs text-white capitalize tracking-wide">
                Mood: {theme}
              </Text>
            </View>
            <Pressable
              onPress={() => router.push('/(tabs)/settings')}
              accessibilityRole="button"
              accessibilityLabel="Personalize preferences"
              className="bg-white/90 px-3.5 py-1.5 rounded-full flex-row items-center gap-1.5 active:opacity-80"
            >
              <Ionicons name="options-outline" size={15} color="#263F35" />
              <Text className="font-sans font-medium text-xs text-[#263F35]">
                Personalize
              </Text>
            </Pressable>
          </View>

          <View className="max-w-[300px] mb-4">
            <Text className="font-sans font-medium text-[30px] leading-[36px] text-white">
              Where would you like to go?
            </Text>
          </View>
        </View>
      </View>

      {/* Main Content Area */}
      <View className="flex-1 z-20">
        {/* Search Bar */}
        <View className="px-5 mb-3">
          <SearchBar
            value={searchQuery}
            onChangeText={handleSearch}
            placeholder="Search places, regions, or experiences"
            onClear={handleClearSearch}
          />
        </View>

        {/* Filter Chips */}
        <View className="mb-4">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
          >
            {CATEGORY_FILTERS.map((filter) => (
              <FilterChip
                key={filter.value}
                label={filter.label}
                selected={selectedFilter === filter.value}
                onPress={() => handleFilterPress(filter.value)}
              />
            ))}
          </ScrollView>
        </View>

        {/* Filter / Search summary */}
        {hasActiveFilters && (
          <View className="flex-row items-center justify-between px-5 mb-3">
            <Text className="font-sans text-sm text-muted">
              {totalCount} {totalCount === 1 ? 'place' : 'places'} found
            </Text>
            <Pressable onPress={handleClearFilters} className="p-1">
              <Text className="font-sans font-medium text-xs text-primary underline">
                Clear filters
              </Text>
            </Pressable>
          </View>
        )}

        {/* Destination Lists */}
        {destinations.length === 0 ? (
          <View className="flex-1 justify-center px-5">
            <EmptyState
              icon="search-outline"
              title="No places match that search."
              description="Try another name or clear a filter."
              actionLabel="Clear filters"
              onAction={handleClearFilters}
            />
          </View>
        ) : hasActiveFilters ? (
          /* Filtered FlatList */
          <FlatList
            data={destinations}
            renderItem={({ item }) => (
              <DestinationCard
                destination={item}
                onPress={() => handleDestinationPress(item)}
                onAddToTrip={() => handleAddToTrip(item)}
                addedToTrip={isInTrip(item.id)}
                currency="USD"
              />
            )}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 14, paddingBottom: 60 }}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          /* Curated Discovery Sections */
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 24, paddingBottom: 60 }}
          >
            {/* Picked for your mood */}
            <View className="gap-3">
              <View className="flex-row items-center justify-between">
                <Text className="font-sans font-medium text-xl text-text">
                  Picked for your mood
                </Text>
                <Text className="font-sans text-sm text-muted capitalize">{theme}</Text>
              </View>
              <View className="gap-3">
                {(moodDestinations.length > 0 ? moodDestinations.slice(0, 5) : destinations.slice(0, 5)).map((item) => (
                  <DestinationCard
                    key={item.id}
                    destination={item}
                    onPress={() => handleDestinationPress(item)}
                    onAddToTrip={() => handleAddToTrip(item)}
                    addedToTrip={isInTrip(item.id)}
                    currency="USD"
                  />
                ))}
              </View>
            </View>

            {/* Good for a short escape */}
            {shortEscapeDestinations.length > 0 && (
              <View className="gap-3">
                <View className="flex-row items-center justify-between">
                  <Text className="font-sans font-medium text-xl text-text">
                    Good for a short escape
                  </Text>
                  <Text className="font-sans text-sm text-muted">3 days or fewer</Text>
                </View>
                <View className="gap-3">
                  {shortEscapeDestinations.map((item) => (
                    <DestinationCard
                      key={item.id}
                      destination={item}
                      onPress={() => handleDestinationPress(item)}
                      onAddToTrip={() => handleAddToTrip(item)}
                      addedToTrip={isInTrip(item.id)}
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
                  <Text className="font-sans font-medium text-xl text-text">
                    Explore somewhere different
                  </Text>
                </View>
                <View className="gap-3">
                  {otherDestinations.map((item) => (
                    <DestinationCard
                      key={item.id}
                      destination={item}
                      onPress={() => handleDestinationPress(item)}
                      onAddToTrip={() => handleAddToTrip(item)}
                      addedToTrip={isInTrip(item.id)}
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
                className="self-center mt-2 py-3 px-6 bg-surface rounded-[14px] border border-border"
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
