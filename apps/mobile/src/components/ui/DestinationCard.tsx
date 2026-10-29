'use client'

import { View, Text, Image, StyleSheet, Pressable } from 'react-native'
import { Image as ExpoImage } from 'expo-image'
import styled from 'styled-components/native'
import { Ionicons } from '@expo/vector-icons'
import { formatCurrency } from '@travel-planner/shared'
import type { Destination } from '@travel-planner/shared'

interface DestinationCardProps {
  destination: Destination
  onPress?: () => void
  onAddToTrip?: () => void
  addedToTrip?: boolean
  style?: any
  currency?: 'USD' | 'INR'
}

const CardContainer = styled(Pressable)`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: 20px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  overflow: hidden;
  ${({ style }) => style}
`

const ImageContainer = styled(View)`
  position: relative;
  height: 180px;
  width: 100%;
`

const HeroImage = styled(ExpoImage)`
  width: 100%;
  height: 100%;
`

const Content = styled(View)`
  padding: 14px 16px;
  gap: 8px;
`

const NameRow = styled(View)`
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
`

const LocationText = styled(Text)`
  font-family: Geist_Regular;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.muted};
`

const DescriptionText = styled(Text)`
  font-family: Geist_Regular;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text};
  line-height: 20px;
`

const MetaRow = styled(View)`
  flex-direction: row;
  align-items: center;
  gap: 12px;
  margin-top: 4px;
`

const MetaItem = styled(View)`
  flex-direction: row;
  align-items: center;
  gap: 4px;
`

const MetaText = styled(Text)`
  font-family: Geist_Regular;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.muted};
`

const AddedBadge = styled(View)`
  flex-direction: row;
  align-items: center;
  gap: 6px;
  padding-vertical: 6px;
  padding-horizontal: 12px;
  background-color: ${({ theme }) => theme.colors.soft};
  border-radius: 20px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.accent};
`

const AddedText = styled(Text)`
  font-family: Geist_Medium;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.primary};
`

export function DestinationCard({ 
  destination, 
  onPress, 
  onAddToTrip, 
  addedToTrip = false, 
  style,
  currency = 'USD',
}: DestinationCardProps) {
  const costDisplay = formatCurrency(destination.estimatedCostMinor, destination.costCurrency as 'USD' | 'INR')
  
  return (
    <CardContainer onPress={onPress} style={style} accessibilityRole="button" accessibilityLabel={`${destination.name}, ${destination.country}`}>
      <ImageContainer>
        <HeroImage
          source={destination.heroImage}
          contentFit="cover"
          transition={200}
          placeholder="blur"
        />
        {addedToTrip && (
          <AddedBadge style={styles.addedBadge}>
            <Ionicons name="checkmark-circle" size={16} color="#263F35" />
            <AddedText>Added to trip</AddedText>
          </AddedBadge>
        )}
      </ImageContainer>
      <Content>
        <NameRow>
          <View style={styles.nameContainer}>
            <Text style={styles.nameText} numberOfLines={1}>{destination.name}</Text>
            <LocationText>{destination.region ? `${destination.region}, ${destination.country}` : destination.country}</LocationText>
          </View>
          <Text style={styles.costText}>{costDisplay}</Text>
        </NameRow>
        <DescriptionText numberOfLines={2}>{destination.shortDescription}</DescriptionText>
        <MetaRow>
          <MetaItem>
            <Ionicons name="time-outline" size={16} color="#777F78" />
            <MetaText>{destination.suggestedDaysMin}–{destination.suggestedDaysMax} days</MetaText>
          </MetaItem>
          <MetaItem>
            <Ionicons name="star-outline" size={16} color="#777F78" />
            <MetaText>{destination.highlights.slice(0, 2).join(', ')}</MetaText>
          </MetaItem>
        </MetaRow>
      </Content>
    </CardContainer>
  )
}

const styles = StyleSheet.create({
  nameContainer: {
    flex: 1,
    minWidth: 0,
  },
  nameText: {
    fontFamily: 'Geist_Medium',
    fontSize: 17,
    color: '#202822',
    marginBottom: 2,
  },
  costText: {
    fontFamily: 'Geist_Medium',
    fontSize: 16,
    color: '#202822',
    marginTop: 2,
  },
  addedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
})