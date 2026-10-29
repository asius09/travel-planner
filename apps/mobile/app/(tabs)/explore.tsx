'use client'

import { View, Text, StyleSheet, FlatList, RefreshControl, ScrollView, ImageBackground, Pressable, FlatListProps } from 'react-native'
import { useRouter } from 'expo-router'
import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import styled from 'styled-components/native'
import { Ionicons } from '@expo/vector-icons'
import { SearchBar, FilterChip, DestinationCard, SkeletonCard, EmptyState, ErrorState } from '@/components/ui'
import { useThemeStore } from '@/store/themeStore'
import { useOnboardingStore } from '@/store/onboardingStore'
import { CATEGORY_FILTERS, MOOD_OPTIONS } from '@/constants/onboarding'
import { formatCurrency, getRecommendations } from '@travel-planner/shared'
import type { Destination } from '@travel-planner/shared'

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000'

const Container = styled(View)`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.canvas};
`

const HeroSection = styled(View)`
  position: relative;
  height: 280px;
  margin-bottom: -40px;
  z-index: 1;
`

const HeroImage = styled(ImageBackground)`
  flex: 1;
  justify-content: flex-end;
  padding: 24px;
`

const HeroOverlay = styled(View)`
  flex: 1;
  background-color: rgba(32, 40, 34, 0.5);
  border-bottom-left-radius: 32px;
  border-bottom-right-radius: 32px;
  padding: 24px;
  justify-content: flex-end;
`

const HeroHeadline = styled(Text)`
  font-family: Geist_Medium;
  font-size: 30px;
  line-height: 36px;
  letter-spacing: -0.5px;
  color: #FFFFFF;
  max-width: 280px;
`

const PersonalizeButton = styled(Pressable)`
  flex-direction: row;
  align-items: center;
  gap: 6px;
  margin-top: 16px;
  padding-vertical: 8px;
  padding-horizontal: 14px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  align-self: flex-start;
`

const PersonalizeText = styled(Text)`
  font-family: Geist_Medium;
  font-size: 14px;
  color: #FFFFFF;
`

const Content = styled(View)`
  padding: 0 20px 32px;
  z-index: 2;
`

const SectionHeader = styled(View)`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`

const SectionTitle = styled(Text)`
  font-family: Geist_Medium;
  font-size: 20px;
  color: ${({ theme }) => theme.colors.text};
`

const ClearFiltersText = styled(Text)`
  font-family: Geist_Medium;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.primary};
`

const FilterScroll = styled(ScrollView)`
  margin-bottom: 16px;
`

const FilterContainer = styled(View)`
  padding-horizontal: 20px;
  gap: 10px;
`

const SectionContainer = styled(View)`
  gap: 16px;
`

const SectionTitleRow = styled(View)`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`

const SectionSubtitle = styled(Text)`
  font-family: Geist_Regular;
  font-size: 15px;
  color: ${({ theme }) => theme.colors.muted};
`

const DestinationsList = ({ data, renderItem, keyExtractor, ...props }: FlatListProps<Destination>) => (
  <FlatList
    data={data}
    renderItem={renderItem}
    keyExtractor={keyExtractor}
    showsVerticalScrollIndicator={false}
    contentContainerStyle={{ gap: 12 }}
    {...props}
  />
)

const LoadMoreButton = styled(Pressable)`
  align-self: center;
  margin-top: 16px;
  padding-vertical: 12px;
  padding-horizontal: 24px;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: 14px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
`

const LoadMoreText = styled(Text)`
  font-family: Geist_Medium;
  font-size: 15px;
  color: ${({ theme }) => theme.colors.primary};
`

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
  const { tokens, theme } = useThemeStore()
  const { data: onboardingData } = useOnboardingStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<string>('all')
  
  // Hero image based on mood
  const heroImages: Record<string, string> = {
    nature: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&h=1600&fit=crop',
    city: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1200&h=1600&fit=crop',
    beach: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=1600&fit=crop',
    adventure: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=1200&h=1600&fit=crop',
  }
  
  const heroImage = heroImages[theme] || heroImages.nature
  
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, error, refetch } = useInfiniteQuery({
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
    // This would call the trip API
    console.log('Add to trip:', destinationId)
  }

  // Determine which destinations to show in each section
  const recommendedDestinations = destinations.slice(0, 6)
  const shortEscapeDestinations = destinations.filter(d => d.suggestedDaysMax <= 3).slice(0, 6)
  const otherDestinations = destinations.filter(d => d.suggestedDaysMin >= 4).slice(0, 6)

  if (isLoading && destinations.length === 0) {
    return (
      <Container>
        <HeroSection>
          <HeroImage source={{ uri: heroImage }} style={styles.heroImage} resizeMode="cover">
            <HeroOverlay>
              <HeroHeadline>Where would you like to go?</HeroHeadline>
              <PersonalizeButton onPress={() => router.push('/settings')}>
                <Ionicons name="settings-outline" size={16} color="#FFFFFF" />
                <PersonalizeText>Personalize</PersonalizeText>
              </PersonalizeButton>
            </HeroOverlay>
          </HeroImage>
        </HeroSection>
        <Content>
          <SearchBar
            value={searchQuery}
            onChangeText={handleSearch}
            onClear={handleClearSearch}
          />
          <FilterScroll horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            <FilterContainer>
              {CATEGORY_FILTERS.map((filter) => (
                <FilterChip
                  key={filter.value}
                  label={filter.label}
                  selected={selectedFilter === filter.value}
                  onPress={() => handleFilterPress(filter.value)}
                />
              ))}
            </FilterContainer>
          </FilterScroll>
          <View style={styles.skeletonContainer}>
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} style={styles.skeletonCard} />
            ))}
          </View>
        </Content>
      </Container>
    )
  }
  
  if (isError) {
    return (
      <Container>
        <HeroSection>
          <HeroImage source={{ uri: heroImage }} style={styles.heroImage} resizeMode="cover">
            <HeroOverlay>
              <HeroHeadline>Where would you like to go?</HeroHeadline>
              <PersonalizeButton onPress={() => router.push('/settings')}>
                <Ionicons name="settings-outline" size={16} color="#FFFFFF" />
                <PersonalizeText>Personalize</PersonalizeText>
              </PersonalizeButton>
            </HeroOverlay>
          </HeroImage>
        </HeroSection>
        <Content>
          <SearchBar
            value={searchQuery}
            onChangeText={handleSearch}
            onClear={handleClearSearch}
          />
          <ErrorState
            message="Unable to load destinations. Please check your connection and try again."
            onRetry={handleRefresh}
          />
        </Content>
      </Container>
    )
  }

  return (
    <Container>
      <HeroSection>
        <HeroImage source={{ uri: heroImage }} style={styles.heroImage} resizeMode="cover">
          <HeroOverlay>
            <HeroHeadline>Where would you like to go?</HeroHeadline>
            <PersonalizeButton onPress={() => router.push('/settings')}>
              <Ionicons name="settings-outline" size={16} color="#FFFFFF" />
              <PersonalizeText>Personalize</PersonalizeText>
            </PersonalizeButton>
          </HeroOverlay>
        </HeroImage>
      </HeroSection>
      
      <Content>
        <SearchBar
          value={searchQuery}
          onChangeText={handleSearch}
          onClear={handleClearSearch}
        />
        
        <FilterScroll horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          <FilterContainer>
            {CATEGORY_FILTERS.map((filter) => (
              <FilterChip
                key={filter.value}
                label={filter.label}
                selected={selectedFilter === filter.value}
                onPress={() => handleFilterPress(filter.value)}
              />
            ))}
          </FilterContainer>
        </FilterScroll>
        
        {hasActiveFilters && (
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsText}>
              {totalCount} place{totalCount !== 1 ? 's' : ''} found
            </Text>
            <Pressable onPress={handleClearFilters}>
              <ClearFiltersText>Clear filters</ClearFiltersText>
            </Pressable>
          </View>
        )}
        
        {destinations.length === 0 ? (
          <EmptyState
            icon="search-outline"
            title="No places match that search"
            description="Try another name or clear a filter."
            actionLabel="Clear filters"
            onAction={handleClearFilters}
          />
        ) : (
          <>
            {/* Picked for your mood */}
            {recommendedDestinations.length > 0 && (
              <SectionContainer>
                <SectionTitleRow>
                  <SectionTitle>Picked for your mood</SectionTitle>
                  <SectionSubtitle>Based on your preferences</SectionSubtitle>
                </SectionTitleRow>
                <DestinationsList
                  data={recommendedDestinations}
                  renderItem={({ item }: { item: Destination }) => (
                    <DestinationCard
                      destination={item}
                      onPress={() => handleDestinationPress(item)}
                      onAddToTrip={() => handleAddToTrip(item.id)}
                      currency="USD"
                    />
                  )}
                  keyExtractor={item => item.id}
                />
              </SectionContainer>
            )}
            
            {/* Good for a short escape */}
            {shortEscapeDestinations.length > 0 && (
              <SectionContainer>
                <SectionTitleRow>
                  <SectionTitle>Good for a short escape</SectionTitle>
                  <SectionSubtitle>3 days or fewer</SectionSubtitle>
                </SectionTitleRow>
                <DestinationsList
                  data={shortEscapeDestinations}
                  renderItem={({ item }: { item: Destination }) => (
                    <DestinationCard
                      destination={item}
                      onPress={() => handleDestinationPress(item)}
                      onAddToTrip={() => handleAddToTrip(item.id)}
                      currency="USD"
                    />
                  )}
                  keyExtractor={item => item.id}
                />
              </SectionContainer>
            )}
            
            {/* Explore somewhere different */}
            {otherDestinations.length > 0 && (
              <SectionContainer>
                <SectionTitleRow>
                  <SectionTitle>Explore somewhere different</SectionTitle>
                </SectionTitleRow>
                <DestinationsList
                  data={otherDestinations}
                  renderItem={({ item }: { item: Destination }) => (
                    <DestinationCard
                      destination={item}
                      onPress={() => handleDestinationPress(item)}
                      onAddToTrip={() => handleAddToTrip(item.id)}
                      currency="USD"
                    />
                  )}
                  keyExtractor={item => item.id}
                />
              </SectionContainer>
            )}
            
            {hasNextPage && (
              <LoadMoreButton onPress={() => fetchNextPage()} disabled={isFetchingNextPage}>
                <LoadMoreText>{isFetchingNextPage ? 'Loading...' : 'Load more'}</LoadMoreText>
              </LoadMoreButton>
            )}
          </>
        )}
      </Content>
    </Container>
  )
}

// Need to import useState
import { useState } from 'react'

const styles = StyleSheet.create({
  heroImage: {
    width: '100%',
    height: '100%',
  },
  filterScroll: {
    marginTop: -8,
    marginBottom: 8,
  },
  skeletonContainer: {
    gap: 12,
  },
  skeletonCard: {
    marginHorizontal: 0,
  },
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  resultsText: {
    fontFamily: 'Geist_Regular',
    fontSize: 14,
    color: '#777F78',
  },
})