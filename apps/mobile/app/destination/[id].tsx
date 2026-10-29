'use client'

import { View, Text, StyleSheet, ScrollView, ImageBackground, Alert } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import styled from 'styled-components/native'
import { Ionicons } from '@expo/vector-icons'
import { Button, EmptyState, ErrorState } from '@/components/ui'
import { useTripStore } from '@/store/tripStore'
import { formatCurrency } from '@travel-planner/shared'
import type { Destination } from '@travel-planner/shared'

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000'

const Container = styled(View)`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.canvas};
`

const HeroSection = styled(View)`
  position: relative;
  height: 360px;
`

const HeroImage = styled(ImageBackground)`
  flex: 1;
`

const HeroOverlay = styled(View)`
  flex: 1;
  background-color: rgba(32, 40, 34, 0.4);
  padding: 16px;
  justify-content: space-between;
`

const BackButton = styled(Pressable)`
  width: 44px;
  height: 44px;
  border-radius: 22px;
  background-color: rgba(255, 255, 255, 0.9);
  align-items: center;
  justify-content: center;
  align-self: flex-start;
`

const SaveButton = styled(Pressable)`
  width: 44px;
  height: 44px;
  border-radius: 22px;
  background-color: rgba(255, 255, 255, 0.9);
  align-items: center;
  justify-content: center;
  align-self: flex-end;
`

const Content = styled(View)`
  padding: 24px 20px;
  gap: 20px;
`

const LocationText = styled(Text)`
  font-family: Geist_Regular;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.muted};
`

const TitleText = styled(Text)`
  font-family: Geist_Medium;
  font-size: 28px;
  line-height: 34px;
  letter-spacing: -0.5px;
  color: ${({ theme }) => theme.colors.text};
`

const DescriptionText = styled(Text)`
  font-family: Geist_Regular;
  font-size: 16px;
  line-height: 24px;
  color: ${({ theme }) => theme.colors.text};
`

const HighlightsContainer = styled(View)`
  gap: 12px;
`

const HighlightRow = styled(View)`
  flex-direction: row;
  align-items: flex-start;
  gap: 12px;
`

const HighlightIcon = styled(View)`
  width: 28px;
  height: 28px;
  border-radius: 14px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.soft};
  margin-top: 2px;
`

const HighlightText = styled(Text)`
  font-family: Geist_Regular;
  font-size: 15px;
  color: ${({ theme }) => theme.colors.text};
  line-height: 22px;
  flex: 1;
`

const MetaGrid = styled(View)`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 16px;
  padding-vertical: 8px;
  border-top-width: 1px;
  border-bottom-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
`

const MetaItem = styled(View)`
  flex-direction: row;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 140px;
`

const MetaLabel = styled(Text)`
  font-family: Geist_Regular;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.muted};
`

const MetaValue = styled(Text)`
  font-family: Geist_Medium;
  font-size: 15px;
  color: ${({ theme }) => theme.colors.text};
`

const CostSection = styled(View)`
  gap: 8px;
  padding-top: 8px;
`

const CostLabel = styled(Text)`
  font-family: Geist_Regular;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.muted};
`

const CostValue = styled(Text)`
  font-family: Geist_Medium;
  font-size: 24px;
  color: ${({ theme }) => theme.colors.text};
`

const CostBasis = styled(Text)`
  font-family: Geist_Regular;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.muted};
`

const ActionButton = styled(Button).attrs({ fullWidth: true, size: 'lg' })`
  margin-top: 8px;
`

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
  const { isInTrip, addDestination, removeDestination } = useTripStore()
  
  const { data: destination, isLoading, isError, error } = useQuery({
    queryKey: ['destination', id],
    queryFn: () => fetchDestination(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
  
  const addedToTrip = id ? isInTrip(id) : false
  
  const handleAddToTrip = async () => {
    if (!id || !destination) return
    
    try {
      const wasAdded = addDestination(id)
      if (wasAdded) {
        // Also sync to server if authenticated
        try {
          await addToTripApi(id)
        } catch (apiError) {
          console.warn('Failed to sync to server:', apiError)
        }
        router.push('/(tabs)/trip')
      } else {
        // Already in trip - navigate to trip
        router.push('/(tabs)/trip')
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add to trip. Please try again.')
    }
  }
  
  const handleBack = () => {
    router.back()
  }

  if (isLoading) {
    return (
      <Container>
        <HeroSection>
          <HeroImage source={{ uri: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&h=1600&fit=crop' }} style={styles.heroImage} resizeMode="cover">
            <HeroOverlay>
              <BackButton onPress={handleBack} accessibilityLabel="Back">
                <Ionicons name="chevron-back" size={24} color="#202822" />
              </BackButton>
            </HeroOverlay>
          </HeroImage>
        </HeroSection>
        <Content>
          <View style={styles.skeletonContainer}>
            {[1,2,3,4].map((_, i) => (
              <View key={i} style={styles.skeletonLine} />
            ))}
          </View>
        </Content>
      </Container>
    )
  }
  
  if (isError || !destination) {
    const isNotFound = error instanceof Error && error.message === 'NOT_FOUND'
    return (
      <Container>
        <HeroSection>
          <HeroImage source={{ uri: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&h=1600&fit=crop' }} style={styles.heroImage} resizeMode="cover">
            <HeroOverlay>
              <BackButton onPress={handleBack} accessibilityLabel="Back">
                <Ionicons name="chevron-back" size={24} color="#202822" />
              </BackButton>
            </HeroOverlay>
          </HeroImage>
        </HeroSection>
        <Content>
          <ErrorState
            title={isNotFound ? 'Destination not found' : 'Something went wrong'}
            message={isNotFound ? 'This destination does not exist or has been removed.' : 'Unable to load destination details. Please try again.'}
            onRetry={() => router.replace('/(tabs)/explore')}
          />
        </Content>
      </Container>
    )
  }

  const costDisplay = formatCurrency(destination.estimatedCostMinor, destination.costCurrency as 'USD' | 'INR')
  const costBasis = destination.costCurrency === 'USD' ? 'Estimated per person for trip (USD)' : `Estimated per person for trip (${destination.costCurrency})`

  return (
    <Container>
      <HeroSection>
        <HeroImage source={{ uri: destination.heroImage }} style={styles.heroImage} resizeMode="cover">
          <HeroOverlay>
            <BackButton onPress={handleBack} accessibilityLabel="Back">
              <Ionicons name="chevron-back" size={24} color="#202822" />
            </BackButton>
            <SaveButton onPress={handleAddToTrip} accessibilityLabel={addedToTrip ? 'View trip' : 'Add to trip'}>
              <Ionicons 
                name={addedToTrip ? 'bookmark' : 'bookmark-outline'} 
                size={24} 
                color={addedToTrip ? '#263F35' : '#202822'} 
              />
            </SaveButton>
          </HeroOverlay>
        </HeroImage>
      </HeroSection>
      
      <Content>
        <View>
          <LocationText>{destination.region ? `${destination.region}, ${destination.country}` : destination.country}</LocationText>
          <TitleText>{destination.name}</TitleText>
        </View>
        
        <DescriptionText>{destination.description}</DescriptionText>
        
        <View style={styles.divider} />
        
        <HighlightsContainer>
          {destination.highlights.map((highlight, index) => (
            <HighlightRow key={index}>
              <HighlightIcon>
                <Ionicons name="checkmark" size={16} color="#263F35" />
              </HighlightIcon>
              <HighlightText>{highlight}</HighlightText>
            </HighlightRow>
          ))}
        </HighlightsContainer>
        
        <MetaGrid>
          <MetaItem>
            <Ionicons name="time-outline" size={20} color="#777F78" />
            <View>
              <MetaLabel>Suggested duration</MetaLabel>
              <MetaValue>{destination.suggestedDaysMin}–{destination.suggestedDaysMax} days</MetaValue>
            </View>
          </MetaItem>
          <MetaItem>
            <Ionicons name="star-outline" size={20} color="#777F78" />
            <View>
              <MetaLabel>Category</MetaLabel>
              <MetaValue>{destination.categoryTags.slice(0, 2).join(', ')}</MetaValue>
            </View>
          </MetaItem>
        </MetaGrid>
        
        <CostSection>
          <CostLabel>Estimated cost</CostLabel>
          <CostValue>{costDisplay}</CostValue>
          <CostBasis>{costBasis}</CostBasis>
        </CostSection>
        
        <ActionButton
          variant={addedToTrip ? 'secondary' : 'primary'}
          onPress={handleAddToTrip}
        >
          {addedToTrip ? 'Added to trip — View trip' : 'Add to trip'}
        </ActionButton>
      </Content>
    </Container>
  )
}

const styles = StyleSheet.create({
  heroImage: {
    width: '100%',
    height: '100%',
  },
  skeletonContainer: {
    gap: 16,
    paddingHorizontal: 20,
  },
  skeletonLine: {
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E5E7DF',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7DF',
  },
})