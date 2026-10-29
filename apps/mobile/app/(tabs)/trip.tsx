'use client'

import { View, Text, StyleSheet, ScrollView, FlatList, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import styled from 'styled-components/native'
import { Ionicons } from '@expo/vector-icons'
import { Button, EmptyState, DestinationCard } from '@/components/ui'
import { useTripStore } from '@/store/tripStore'
import { formatCurrency } from '@travel-planner/shared'
import type { Destination } from '@travel-planner/shared'

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000'

const Container = styled(View)`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.canvas};
`

const Header = styled(View)`
  padding: 20px 20px 12px;
`

const TitleText = styled(Text)`
  font-family: Geist_Medium;
  font-size: 28px;
  color: ${({ theme }) => theme.colors.text};
`

const SummaryCard = styled(View)`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: 20px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  padding: 20px;
  margin: 0 20px 16px;
  gap: 12px;
`

const SummaryRow = styled(View)`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`

const SummaryLabel = styled(Text)`
  font-family: Geist_Regular;
  font-size: 15px;
  color: ${({ theme }) => theme.colors.muted};
`

const SummaryValue = styled(Text)`
  font-family: Geist_Medium;
  font-size: 17px;
  color: ${({ theme }) => theme.colors.text};
`

const BudgetTotal = styled(View)`
  flex-direction: row;
  align-items: baseline;
  justify-content: space-between;
  padding-top: 8px;
  border-top-width: 1px;
  border-top-color: ${({ theme }) => theme.colors.border};
`

const BudgetLabel = styled(Text)`
  font-family: Geist_Regular;
  font-size: 15px;
  color: ${({ theme }) => theme.colors.muted};
`

const BudgetValue = styled(Text)`
  font-family: Geist_Medium;
  font-size: 28px;
  color: ${({ theme }) => theme.colors.primary};
`

const BudgetBasis = styled(Text)`
  font-family: Geist_Regular;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.muted};
  margin-left: 8px;
`

const SectionHeader = styled(View)`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px 12px;
`

const SectionTitle = styled(Text)`
  font-family: Geist_Medium;
  font-size: 20px;
  color: ${({ theme }) => theme.colors.text};
`

const DestinationsList = styled(FlatList).attrs({
  showsVerticalScrollIndicator: false,
  contentContainerStyle: { paddingHorizontal: 20, gap: 12, paddingBottom: 100 },
})``

const Footer = styled(View)`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px 20px;
  background-color: ${({ theme }) => theme.colors.canvas};
  border-top-width: 1px;
  border-top-color: ${({ theme }) => theme.colors.border};
  gap: 12px;
`

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
  // In a real app, get from auth store
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
    body: JSON.stringify({ tripId: '', items }), // tripId would come from trip data
  })
  if (!response.ok) throw new Error('Failed to reorder trip')
}

export default function TripScreen() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { destinations: localDestinations, removeDestination, reorderDestinations, isInTrip } = useTripStore()
  
  const { data: trip, isLoading, isError, refetch } = useQuery({
    queryKey: ['trip'],
    queryFn: fetchTrip,
    staleTime: 30 * 1000,
  })
  
  // For now, use local destinations until API is connected
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
  
  const handleReorder = (fromIndex: number, toIndex: number) => {
    reorderDestinations(fromIndex, toIndex)
    // Sync to server
    const items = localDestinations.map((d, i) => ({
      destinationId: d.destinationId,
      position: i,
    }))
    reorderMutation.mutate(items)
  }
  
  const totalCost = 0 // Would calculate from destination data
  const destinationCount = tripDestinations.length

  if (isLoading && tripDestinations.length === 0) {
    return (
      <Container>
        <Header>
          <TitleText>Your trip, taking shape.</TitleText>
        </Header>
        <View style={styles.skeletonContainer}>
          <View style={styles.skeletonCard} />
          <View style={styles.skeletonCard} />
        </View>
      </Container>
    )
  }
  
  if (isError) {
    return (
      <Container>
        <Header>
          <TitleText>Your trip, taking shape.</TitleText>
        </Header>
        <EmptyState
          icon="alert-circle-outline"
          title="Unable to load trip"
          description="Please check your connection and try again."
          actionLabel="Try again"
          onAction={refetch}
        />
      </Container>
    )
  }

  if (tripDestinations.length === 0) {
    return (
      <Container>
        <Header>
          <TitleText>Your trip, taking shape.</TitleText>
        </Header>
        <EmptyState
          icon="compass-outline"
          title="Every great trip starts somewhere."
          description="Explore destinations and add the places you'd love to visit."
          actionLabel="Explore destinations"
          onAction={() => router.push('/(tabs)/explore')}
          style={styles.emptyState}
        />
      </Container>
    )
  }

  return (
    <Container>
      <Header>
        <TitleText>Your trip, taking shape.</TitleText>
      </Header>
      
      <SummaryCard>
        <SummaryRow>
          <SummaryLabel>Destinations</SummaryLabel>
          <SummaryValue>{destinationCount}</SummaryValue>
        </SummaryRow>
        <BudgetTotal>
          <View>
            <BudgetLabel>Estimated budget</BudgetLabel>
            <BudgetBasis>Estimates shown in USD</BudgetBasis>
          </View>
          <BudgetValue>${(totalCost / 100).toLocaleString()}</BudgetValue>
        </BudgetTotal>
      </SummaryCard>
      
      <SectionHeader>
        <SectionTitle>Destinations</SectionTitle>
      </SectionHeader>
      
      <DestinationsList
        data={tripDestinations}
        renderItem={({ item, index }) => (
          <DestinationCard
            destination={item as any} // Would need proper destination data
            onPress={() => router.push(`/destination/${item.destinationId}`)}
            onAddToTrip={() => {}}
            addedToTrip={true}
            currency="USD"
            style={styles.destinationCard}
          />
        )}
        keyExtractor={item => item.id}
      />
      
      <Footer>
        <Button variant="outline" size="lg" fullWidth onPress={() => router.push('/(tabs)/explore')}>
          Add another place
        </Button>
      </Footer>
    </Container>
  )
}

const styles = StyleSheet.create({
  skeletonContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  skeletonCard: {
    height: 120,
    borderRadius: 16,
    backgroundColor: '#E5E7DF',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
  },
  destinationCard: {
    // Override for trip view
  },
})