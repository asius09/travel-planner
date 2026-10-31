'use client'

import React, { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Share,
} from 'react-native'
import Animated, { FadeIn, FadeInDown, useReducedMotion } from 'react-native-reanimated'
import { Image as ExpoImage } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { BlurView } from 'expo-blur'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ErrorState, ScreenFade } from '@/components/ui'
import { useRefreshOnFocus } from '@/hooks/useRefreshOnFocus'
import { useTripStore } from '@/store/tripStore'
import { useThemeStore } from '@/store/themeStore'
import { api } from '@/services/api'
import { getDestinationGallery } from '@/services/destinationImages'
import { formatCurrency } from '@travel-planner/shared'
import * as Haptics from 'expo-haptics'

export default function DestinationDetailScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { id } = useLocalSearchParams<{ id: string }>()
  const { isInTrip, addDestination, removeDestination } = useTripStore()
  const { tokens } = useThemeStore()
  const shouldReduceMotion = useReducedMotion()

  const [activeImageIndex, setActiveImageIndex] = useState(0)

  const {
    data: destination,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['destination', id],
    queryFn: () => api.getDestination(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })

  useRefreshOnFocus(refetch)

  const addedToTrip = id ? isInTrip(id) : false

  // Multi-image gallery list with at least 5 distinct images
  const gallery = destination ? getDestinationGallery(destination) : []
  const activeImage = gallery[activeImageIndex] || destination?.heroImage || ''

  const handleSelectThumbnail = (index: number) => {
    try {
      Haptics.selectionAsync()
    } catch {
      // Ignore
    }
    setActiveImageIndex(index)
  }

  const handleToggleTrip = async () => {
    if (!id || !destination) return

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    } catch {
      // Ignore
    }

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
  }

  const handleToggleFavorite = async () => {
    if (!id || !destination) return

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    } catch {
      // Ignore
    }

    if (addedToTrip) {
      removeDestination(id)
      try {
        await api.removeTripItem(id)
      } catch {
        // Ignore
      }
    } else {
      addDestination(id, destination)
      try {
        await api.addTripItem(id)
      } catch {
        // Ignore
      }
    }
  }

  const handleShare = async () => {
    if (!destination) return
    try {
      Haptics.selectionAsync()
    } catch {
      // Ignore
    }
    try {
      await Share.share({
        title: destination.name,
        message: `Check out ${destination.name} on Outta: ${destination.shortDescription}`,
      })
    } catch {
      // Ignore share cancellation
    }
  }

  const handleBack = () => {
    try {
      Haptics.selectionAsync()
    } catch {
      // Ignore
    }
    router.back()
  }

  if (isLoading) {
    return (
      <View key="dest-loading" className="flex-1 bg-canvas">
        <View className="relative h-[380px] rounded-b-[36px] bg-border overflow-hidden" style={{ opacity: 0.5 }} />
        <View className="p-6 gap-4">
          <View className="h-5 w-28 rounded-full bg-border" />
          <View className="h-8 w-60 rounded-full bg-border" />
          <View className="h-20 rounded-2xl bg-border mt-2" />
          <View className="h-16 rounded-xl bg-border mt-2" />
        </View>
      </View>
    )
  }

  if (isError || !destination) {
    const isNotFound = error instanceof Error && error.message === 'NOT_FOUND'
    return (
      <View key="dest-error" style={{ paddingTop: insets.top }} className="flex-1 bg-canvas">
        <View className="px-5 pt-3">
          <Pressable
            onPress={handleBack}
            accessibilityRole="button"
            accessibilityLabel="Back"
            className="w-11 h-11 rounded-full bg-surface border border-border items-center justify-center active:opacity-70"
          >
            <Ionicons name="chevron-back" size={22} color="#202822" />
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
    (destination.costCurrency as 'USD' | 'INR') || 'USD'
  )
  const location = destination.region
    ? `${destination.region}, ${destination.country}`
    : destination.country

  return (
    <View key="dest-content" className="flex-1 bg-canvas">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 130 }}
      >
        {/* 1. Large Immersive Hero with Rounded Bottom Corners (Matching Reference Design) */}
        <Animated.View
          entering={shouldReduceMotion ? undefined : FadeIn.duration(280)}
          className="relative h-[410px] w-full rounded-b-[36px] overflow-hidden bg-[#EAECE4]"
        >
          <ExpoImage
            key={activeImage}
            source={{ uri: activeImage }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={300}
            cachePolicy="memory-disk"
          />

          {/* Targeted top and bottom gradient masks for high contrast */}
          <LinearGradient
            colors={[
              'rgba(0, 0, 0, 0.35)',
              'transparent',
              'rgba(0, 0, 0, 0.25)',
              'rgba(14, 20, 16, 0.88)',
            ]}
            locations={[0, 0.25, 0.6, 1.0]}
            style={StyleSheet.absoluteFill}
          />

          {/* Floating Circular Controls in Top Safe Area */}
          <View
            style={{ paddingTop: Math.max(insets.top, 16) }}
            className="px-5 flex-row items-center justify-between z-20"
          >
            <Pressable
              onPress={handleBack}
              accessibilityRole="button"
              accessibilityLabel="Back to previous screen"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-md border border-white/25 items-center justify-center active:opacity-75"
            >
              <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
            </Pressable>

            <Pressable
              onPress={handleToggleFavorite}
              accessibilityRole="button"
              accessibilityLabel={addedToTrip ? 'Remove from saved trip' : 'Save to trip'}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              className={`w-11 h-11 rounded-full items-center justify-center border border-white/30 active:opacity-75 ${
                addedToTrip ? 'bg-primary' : 'bg-black/40 backdrop-blur-md'
              }`}
            >
              <Ionicons
                name={addedToTrip ? 'bookmark' : 'bookmark-outline'}
                size={20}
                color="#FFFFFF"
              />
            </Pressable>
          </View>

          {/* Overlaid Bottom Title, Location, and Cost */}
          <View className="flex-1 justify-end p-5">
            <Text className="font-sans text-[13px] text-white/80 leading-tight">
              {location}
            </Text>
            <View className="flex-row items-baseline justify-between mt-1">
              <Text
                className="font-sans font-medium text-[28px] text-white tracking-tight leading-tight flex-1 pr-3"
                numberOfLines={1}
              >
                {destination.name}
              </Text>
              <Text
                style={{ color: tokens.accent }}
                className="font-sans font-medium text-[26px] tracking-tight"
              >
                {costDisplay}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* 2. Multi-Image Gallery Thumbnail Strip (Below Hero) */}
        {gallery.length > 1 && (
          <Animated.View
            entering={shouldReduceMotion ? undefined : FadeInDown.duration(280).delay(60)}
            className="mt-4 px-5"
          >
            <View className="bg-surface rounded-[24px] p-3 border border-border">
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 10 }}
              >
                {gallery.map((imgUrl, index) => {
                  const isSelected = index === activeImageIndex
                  return (
                    <Pressable
                      key={`${destination.id}-thumb-${index}`}
                      onPress={() => handleSelectThumbnail(index)}
                      accessibilityRole="button"
                      accessibilityLabel={`View photo ${index + 1} of ${destination.name}`}
                      style={{
                        width: 104,
                        height: 70,
                        borderRadius: 18,
                        borderWidth: isSelected ? 2.5 : 1,
                        borderColor: isSelected ? tokens.primary : 'rgba(0, 0, 0, 0.08)',
                        overflow: 'hidden',
                        transform: [{ scale: isSelected ? 1.02 : 1 }],
                      }}
                      className="bg-canvas active:opacity-85"
                    >
                      <ExpoImage
                        source={{ uri: imgUrl }}
                        style={StyleSheet.absoluteFill}
                        contentFit="cover"
                        transition={200}
                        cachePolicy="memory-disk"
                      />
                    </Pressable>
                  )
                })}
              </ScrollView>
            </View>
          </Animated.View>
        )}

        {/* 3. Content Hierarchy Below Gallery */}
        <Animated.View
          entering={shouldReduceMotion ? undefined : FadeInDown.duration(320).delay(100)}
          className="px-5 pt-4 gap-4"
        >
          {/* Quick Travel Badges (using semantic tokens) */}
          <View className="flex-row gap-2.5">
            <View className="flex-1 bg-surface rounded-[18px] border border-border p-2.5 flex-row items-center gap-2">
              <View className="w-7 h-7 rounded-full bg-soft items-center justify-center">
                <Ionicons name="time-outline" size={15} color={tokens.primary} />
              </View>
              <View className="flex-1 min-w-0">
                <Text className="font-sans font-medium text-[12.5px] text-text" numberOfLines={1}>
                  {destination.suggestedDaysMin}–{destination.suggestedDaysMax}d
                </Text>
                <Text className="font-sans text-[10.5px] text-muted">Duration</Text>
              </View>
            </View>

            <View className="flex-1 bg-surface rounded-[18px] border border-border p-2.5 flex-row items-center gap-2">
              <View className="w-7 h-7 rounded-full bg-soft items-center justify-center">
                <Ionicons name="compass-outline" size={15} color={tokens.primary} />
              </View>
              <View className="flex-1 min-w-0">
                <Text
                  className="font-sans font-medium text-[12.5px] text-text capitalize"
                  numberOfLines={1}
                >
                  {destination.categoryTags[0] || 'Explore'}
                </Text>
                <Text className="font-sans text-[10.5px] text-muted">Category</Text>
              </View>
            </View>

            <View className="flex-1 bg-surface rounded-[18px] border border-border p-2.5 flex-row items-center gap-2">
              <View className="w-7 h-7 rounded-full bg-soft items-center justify-center">
                <Ionicons name="star-outline" size={14} color={tokens.primary} />
              </View>
              <View className="flex-1 min-w-0">
                <Text className="font-sans font-medium text-[12.5px] text-text" numberOfLines={1}>
                  {destination.popularity ? `${destination.popularity}%` : '4.9★'}
                </Text>
                <Text className="font-sans text-[10.5px] text-muted">Rating</Text>
              </View>
            </View>
          </View>

          {/* About Travel Section */}
          <View className="bg-surface rounded-[24px] border border-border p-5 gap-2">
            <Text className="font-sans font-medium text-[19px] text-text tracking-tight">
              About travel
            </Text>
            <Text
              className="font-sans text-[14.5px] leading-[23px] text-text"
              style={{ opacity: 0.88 }}
            >
              {destination.description}
            </Text>
          </View>

          {/* Highlights & Attractions */}
          <View className="bg-surface rounded-[24px] border border-border p-5 gap-3.5">
            <Text className="font-sans font-medium text-[18px] text-text">
              Highlights & attractions
            </Text>
            <View className="gap-2.5">
              {destination.highlights.map((highlight, index) => (
                <View key={index} className="flex-row items-start gap-3">
                  <View
                    className="w-5 h-5 rounded-full bg-soft items-center justify-center mt-0.5"
                  >
                    <Ionicons name="checkmark" size={13} color={tokens.primary} />
                  </View>
                  <Text className="font-sans text-[14px] leading-[21px] text-text flex-1">
                    {highlight}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Estimated Budget Card with Clear Disclaimer */}
          <View className="bg-surface rounded-[24px] border border-border p-5 gap-2">
            <Text className="font-sans text-[12px] text-muted">Estimated budget basis</Text>
            <Text
              style={{ color: tokens.primary }}
              className="font-sans font-medium text-[28px] tracking-tight leading-none mt-1"
            >
              {costDisplay}
            </Text>
            <Text className="font-sans text-xs text-muted mt-1 leading-relaxed">
              Derived estimate per person based on mid-tier accommodations, meals, and local transport. Outta is designed for thoughtful discovery and trip planning; estimates reflect realistic travel costs and not direct booking fees.
            </Text>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Atmospheric Bottom Frosted Fade */}
      <ScreenFade variant="canvas" height={85} />

      {/* 4. Bottom Floating Action Bar with Share & Primary CTA */}
      <Animated.View
        entering={shouldReduceMotion ? undefined : FadeInDown.duration(280).delay(160)}
        style={{
          paddingBottom: Math.max(insets.bottom, 16),
          overflow: 'hidden',
          backgroundColor: 'rgba(247, 246, 240, 0.94)',
        }}
        className="absolute bottom-0 left-0 right-0 px-5 pt-3 border-t border-border flex-row items-center gap-3.5 z-30"
      >
        <BlurView intensity={85} tint="light" style={StyleSheet.absoluteFill} />

        {/* Share Action */}
        <Pressable
          onPress={handleShare}
          accessibilityRole="button"
          accessibilityLabel="Share destination"
          className="w-12 h-12 rounded-full bg-surface border border-border items-center justify-center active:opacity-75"
        >
          <Ionicons name="share-outline" size={20} color={tokens.primary} />
        </Pressable>

        {/* Primary CTA "Add to trip" / "Saved" Pill Button */}
        <Pressable
          onPress={handleToggleTrip}
          accessibilityRole="button"
          accessibilityLabel={addedToTrip ? 'Saved in trip • View itinerary' : 'Add to trip'}
          className={`flex-1 h-12 rounded-full items-center justify-center active:opacity-90 ${
            addedToTrip ? 'bg-soft border border-border' : 'bg-primary'
          }`}
        >
          <Text
            style={{ color: addedToTrip ? tokens.primary : '#FFFFFF' }}
            className="font-sans font-medium text-[16px] tracking-tight"
          >
            {addedToTrip ? 'Saved in trip • View itinerary' : 'Add to trip'}
          </Text>
        </Pressable>
      </Animated.View>
    </View>
  )
}
