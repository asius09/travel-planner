'use client'

import React, { useState, useMemo, useCallback, useRef } from 'react'
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Animated,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {
  ExploreHeader,
  SearchBar,
  FilterChip,
  DestinationCard,
  FeaturedCarousel,
  SectionHeader,
  TripSummary,
  SkeletonCard,
  EmptyState,
  ErrorState,
  ScreenFade,
  StickySectionHeader,
} from '@/components/ui'
import { useRefreshOnFocus } from '@/hooks/useRefreshOnFocus'
import { useTripSync } from '@/hooks/useTripSync'
import { useOnboardingStore } from '@/store/onboardingStore'
import { useTripStore } from '@/store/tripStore'
import { api } from '@/services/api'
import { semanticColors } from '@/theme/colors'
import { CATEGORY_FILTERS } from '@/constants/onboarding'
import type { Destination } from '@travel-planner/shared'

export default function ExploreScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const userMood = useOnboardingStore((s) => s.data.mood) || 'nature'
  const { destinations: savedDestinations, isInTrip, addDestination } = useTripStore()
  const trip = useTripSync()

  const [searchQuery, setSearchQuery] = useState('')
  type CategoryFilterValue = (typeof CATEGORY_FILTERS)[number]['value']
  const [selectedFilter, setSelectedFilter] = useState<CategoryFilterValue>('all')
  const [isNearBottom, setIsNearBottom] = useState(false)
  const [mustSeeSectionY, setMustSeeSectionY] = useState(280)
  const [popularSectionY, setPopularSectionY] = useState(620)

  const [scrollY] = useState(() => new Animated.Value(0))
  const scrollRef = useRef<React.ElementRef<typeof ScrollView>>(null)

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['destinations', searchQuery, selectedFilter],
    queryFn: ({ pageParam = 1 }) =>
      api.getDestinations({
        query: searchQuery || undefined,
        mood: selectedFilter !== 'all' ? selectedFilter : undefined,
        page: pageParam,
        pageSize: 15,
      }),
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined),
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000,
  })

  useRefreshOnFocus(refetch)

  // Deduplicated destination list
  const destinations = useMemo(() => {
    const raw = data?.pages.flatMap((page) => page.data) ?? []
    const seen = new Set<string>()
    return raw.filter((item) => {
      if (seen.has(item.id)) return false
      seen.add(item.id)
      return true
    })
  }, [data])

  const totalCount = data?.pages[0]?.total ?? destinations.length

  const handleSearch = (text: string) => {
    setSearchQuery(text)
  }

  const handleClearSearch = () => {
    setSearchQuery('')
  }

  const handleFilterPress = (filter: (typeof CATEGORY_FILTERS)[number]['value']) => {
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
    const previous = useTripStore.getState().destinations
    addDestination(destination.id, destination)
    // Optimistic add with rollback when the server rejects the write.
    void api
      .addTripItem(destination.id)
      .then(() => trip.invalidate())
      .catch(() => {
        useTripStore.getState().setDestinations(previous)
      })
  }

  // Infinite Scroll Handler: automatically fetch next page near bottom
  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent
      scrollY.setValue(contentOffset.y)

      const threshold = 320
      const reachedEnd =
        layoutMeasurement.height + contentOffset.y >= contentSize.height - threshold

      setIsNearBottom(reachedEnd)

      if (reachedEnd && hasNextPage && !isFetchingNextPage) {
        fetchNextPage()
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage, scrollY]
  )

  // Featured items for carousel (top 4 curated matching theme/popularity)
  const featuredDestinations = useMemo(() => {
    if (destinations.length === 0) return []
    const moodMatches = destinations.filter((d) => d.moodTags.includes(userMood))
    const pool = moodMatches.length >= 2 ? moodMatches : destinations
    return pool.slice(0, 4)
  }, [destinations, userMood])

  // Popular and categorized destinations
  const popularDestinations = useMemo(() => {
    const featuredIds = new Set(featuredDestinations.map((d) => d.id))
    return destinations.filter((d) => !featuredIds.has(d.id))
  }, [destinations, featuredDestinations])

  // Loading skeleton
  if (isLoading && destinations.length === 0) {
    return (
      <View key="explore-loading" className="flex-1 bg-background relative">
        <ExploreHeader height={290} />
        <View style={{ paddingTop: insets.top + 104 }} className="flex-1 px-5 gap-4">
          <SearchBar
            value=""
            onChangeText={() => {}}
            placeholder="Find places, food, Trips.."
          />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </View>
      </View>
    )
  }

  // Error state
  if (isError && destinations.length === 0) {
    return (
      <View key="explore-error" className="flex-1 bg-background relative">
        <ExploreHeader height={290} />
        <View style={{ paddingTop: insets.top + 104 }} className="flex-1 justify-center px-5">
          <ErrorState
            title="Could not load destinations"
            message="Check your connection and try again."
            retryLabel="Try again"
            onRetry={() => refetch()}
          />
        </View>
      </View>
    )
  }

  return (
    <View key="explore-content" className="flex-1 bg-background relative">
      {/* 1. Full-Bleed Top Travel Hero Image (Extends fully to top side behind status bar) */}
      <ExploreHeader height={290} />

      {/* 2. Fixed Sticky Section Header with Blur, Translate & Top-only Fade */}
      {!hasActiveFilters && (
        <StickySectionHeader
          scrollY={scrollY}
          insetsTop={insets.top}
          mustSeeSectionY={mustSeeSectionY}
          popularSectionY={popularSectionY}
          onScrollToTop={() => {
            scrollRef.current?.scrollTo({ y: 0, animated: true })
          }}
          onSeeAll={() => setSelectedFilter('all')}
        />
      )}

      {/* 3. Elements Scroll Over Hero Background */}
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 96,
          paddingBottom: 110,
        }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Search Bar (Floating over the travel hero surface) */}
        <View className="px-5 mb-4">
          <SearchBar
            value={searchQuery}
            onChangeText={handleSearch}
            onClear={handleClearSearch}
            placeholder="Find places, food, Trips.."
          />
        </View>

        {/* Category Filter Pills */}
        <View className="mb-5">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
          >
            {CATEGORY_FILTERS.map((filter) => (
              <FilterChip
                key={filter.value}
                label={filter.value === 'all' ? 'Must-See' : filter.label}
                selected={selectedFilter === filter.value}
                onPress={() => handleFilterPress(filter.value)}
              />
            ))}
          </ScrollView>
        </View>

        {/* Active Filter Summary Bar */}
        {hasActiveFilters && (
          <View className="flex-row items-center justify-between px-5 mb-4">
            <Text className="font-sans text-sm text-muted-foreground">
              {totalCount} {totalCount === 1 ? 'place' : 'places'} found
            </Text>
            <Pressable
              onPress={handleClearFilters}
              accessibilityRole="button"
              accessibilityLabel="Clear active search and filters"
              className="py-1 px-2 active:opacity-60"
            >
              <Text className="font-sans font-medium text-xs text-primary underline">
                Clear filters
              </Text>
            </Pressable>
          </View>
        )}

        {/* Compact Active Itinerary Summary (When saved destinations exist) */}
        {!hasActiveFilters && savedDestinations.length > 0 && (
          <View className="px-5 mb-5">
            <TripSummary />
          </View>
        )}

        {/* Destination Content */}
        {destinations.length === 0 ? (
          <View className="py-12 px-5">
            <EmptyState
              icon="search-outline"
              title="No places match that search."
              description="Try another destination name or reset your category filter."
              actionLabel="Clear filters"
              onAction={handleClearFilters}
            />
          </View>
        ) : hasActiveFilters ? (
          /* Filtered Search / Category List */
          <View className="px-5 gap-4">
            {destinations.map((item) => (
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
        ) : (
          /* Curated Discovery Mode */
          <View className="gap-6">
            {/* Featured Destination Carousel */}
            {featuredDestinations.length > 0 && (
              <View>
                <View
                  onLayout={(e) => setMustSeeSectionY(e.nativeEvent.layout.y)}
                  className="px-5 mb-2.5 flex-row items-baseline justify-between"
                >
                  <View>
                    <Text className="font-sans font-semibold text-[21px] text-foreground tracking-tight">
                      Must-See Today
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => setSelectedFilter('all')}
                    accessibilityRole="button"
                    accessibilityLabel="See all destinations"
                    className="py-1 px-1 active:opacity-60"
                  >
                    <Text className="font-sans font-medium text-[13px] text-primary">
                      See All
                    </Text>
                  </Pressable>
                </View>
                <FeaturedCarousel
                  destinations={featuredDestinations}
                  onPressDestination={handleDestinationPress}
                />
              </View>
            )}

            {/* Popular Destinations */}
            {popularDestinations.length > 0 && (
              <View
                className="px-5"
                onLayout={(e) => setPopularSectionY(e.nativeEvent.layout.y)}
              >
                <SectionHeader
                  title="Popular destinations"
                />
                <View className="gap-4">
                  {popularDestinations.map((item) => (
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
          </View>
        )}

        {/* End-of-List Automatic Loading Indicator */}
        {isFetchingNextPage && (
          <View className="py-6 items-center justify-center flex-row gap-2">
            <ActivityIndicator size="small" color={semanticColors.primary} />
            <Text className="font-sans text-xs text-muted-foreground">
              Discovering more places...
            </Text>
          </View>
        )}

        {/* End of list confirmation when all places loaded */}
        {!hasNextPage && destinations.length > 4 && (
          <View className="py-6 items-center justify-center">
            <Text className="font-sans text-xs text-muted-foreground">
              You've explored all destinations for now.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Smooth Gradual Bottom Fade for Floating Navigation */}
      <ScreenFade height={95} variant="canvas" />
    </View>
  )
}