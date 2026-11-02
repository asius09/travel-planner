'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  AppState,
  type AppStateStatus,
  AccessibilityInfo,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native'
import { Image as ExpoImage } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import type { Destination } from '@travel-planner/shared'
import { formatCurrency } from '@travel-planner/shared'
import { useTripStore } from '@/store/tripStore'
import { semanticColors } from '@/theme/colors'
import { SmoothDot } from './SmoothDot'

interface FeaturedCarouselProps {
  destinations: Destination[]
  onPressDestination: (destination: Destination) => void
}

const AUTOPLAY_INTERVAL = 4500
const IDLE_START_DELAY = 500

export function FeaturedCarousel({
  destinations,
  onPressDestination,
}: FeaturedCarouselProps) {
  const { width: screenWidth } = useWindowDimensions()
  const { isInTrip, addDestination, removeDestination } = useTripStore()

  const [currentIndex, setCurrentIndex] = useState(0)
  const [isInteracting, setIsInteracting] = useState(false)
  const [isReducedMotion, setIsReducedMotion] = useState(false)

  const scrollRef = useRef<React.ElementRef<typeof ScrollView>>(null)
  const autoplayTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const cardWidth = Math.min(screenWidth - 40, 380)
  const cardHeight = 260

  // 1. Reduced motion detection
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => setIsReducedMotion(enabled))
      .catch(() => {})

    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      (enabled) => setIsReducedMotion(enabled)
    )
    return () => {
      subscription.remove()
    }
  }, [])

  // 2. Scroll to index helper
  const scrollToIndex = useCallback(
    (index: number) => {
      if (scrollRef.current && index >= 0 && index < destinations.length) {
        scrollRef.current.scrollTo({
          x: index * (cardWidth + 14),
          animated: true,
        })
        setCurrentIndex(index)
      }
    },
    [cardWidth, destinations.length]
  )

  // 3. Autoplay management: only starts after 500ms idle delay, pauses on interaction/reduced motion/background
  const clearTimers = useCallback(() => {
    if (autoplayTimerRef.current) clearInterval(autoplayTimerRef.current)
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
  }, [])

  const startAutoplay = useCallback(() => {
    clearTimers()
    if (isReducedMotion || isInteracting || destinations.length <= 1) return

    // Idle delay before starting autoplay
    idleTimerRef.current = setTimeout(() => {
      autoplayTimerRef.current = setInterval(() => {
        setCurrentIndex((prev) => {
          const next = (prev + 1) % destinations.length
          if (scrollRef.current) {
            scrollRef.current.scrollTo({
              x: next * (cardWidth + 14),
              animated: true,
            })
          }
          return next
        })
      }, AUTOPLAY_INTERVAL)
    }, IDLE_START_DELAY)
  }, [clearTimers, isReducedMotion, isInteracting, destinations.length, cardWidth])

  // AppState change listener: pause when backgrounded
  useEffect(() => {
    const handleAppStateChange = (state: AppStateStatus) => {
      if (state === 'active') {
        startAutoplay()
      } else {
        clearTimers()
      }
    }
    const appStateSub = AppState.addEventListener('change', handleAppStateChange)
    startAutoplay()

    return () => {
      clearTimers()
      appStateSub.remove()
    }
  }, [startAutoplay, clearTimers])

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = e.nativeEvent.contentOffset.x
    const index = Math.round(offsetX / (cardWidth + 14))
    if (index >= 0 && index < destinations.length && index !== currentIndex) {
      setCurrentIndex(index)
    }
  }

  const handleToggleBookmark = (dest: Destination) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    } catch {
      // Ignore
    }
    if (isInTrip(dest.id)) {
      removeDestination(dest.id)
    } else {
      addDestination(dest.id, dest)
    }
  }

  if (destinations.length === 0) return null

  return (
    <View className="mb-6">
      {/* Horizontal Carousel */}
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={cardWidth + 14}
        snapToAlignment="start"
        contentContainerStyle={{ paddingHorizontal: 20, gap: 14 }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onScrollBeginDrag={() => {
          setIsInteracting(true)
          clearTimers()
        }}
        onScrollEndDrag={() => {
          setIsInteracting(false)
          startAutoplay()
        }}
        onTouchStart={() => {
          setIsInteracting(true)
          clearTimers()
        }}
        onTouchEnd={() => {
          setIsInteracting(false)
          startAutoplay()
        }}
      >
        {destinations.map((item, idx) => {
          const isSaved = isInTrip(item.id)
          const location = item.region ? `${item.region}, ${item.country}` : item.country

          return (
            <Pressable
              key={item.id}
              onPress={() => onPressDestination(item)}
              accessibilityRole="button"
              accessibilityLabel={`${item.name}, ${location}`}
              style={{ width: cardWidth, height: cardHeight }}
              className="relative rounded-[30px] overflow-hidden bg-surface-muted active:opacity-95"
            >
              {/* Destination Image */}
              <ExpoImage
                source={{ uri: item.heroImage }}
                style={StyleSheet.absoluteFill}
                contentFit="cover"
                transition={300}
              />

              {/* Bottom & Edge Ambient Mask */}
              <LinearGradient
                colors={[
                  'transparent',
                  'rgba(12, 18, 14, 0.45)',
                  'rgba(12, 18, 14, 0.92)',
                ]}
                locations={[0.25, 0.65, 1.0]}
                style={StyleSheet.absoluteFill}
              />

              {/* Floating Top Elements */}
              <View className="absolute top-4 left-4 right-4 flex-row items-center justify-between z-10">
                <View className="bg-black/40 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20">
                  <Text className="font-sans font-medium text-xs text-white">
                    Featured
                  </Text>
                </View>

                {/* Bookmark Action */}
                <Pressable
                  onPress={(e) => {
                    e.stopPropagation()
                    handleToggleBookmark(item)
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={isSaved ? 'Remove from trip' : 'Save to trip'}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  className={`w-10 h-10 rounded-full items-center justify-center border border-white/30 ${
                    isSaved ? 'bg-accent' : 'bg-black/40 backdrop-blur-md'
                  }`}
                >
                  <Ionicons
                    name={isSaved ? 'bookmark' : 'bookmark-outline'}
                    size={18}
                    color={isSaved ? semanticColors.accentForeground : semanticColors.white}
                  />
                </Pressable>
              </View>

              {/* Bottom Card Content */}
              <View className="flex-1 justify-end p-5">
                <Text className="font-sans text-[13px] text-white/80 leading-tight">
                  {location}
                </Text>
                <Text
                  className="font-sans font-medium text-[24px] text-white tracking-tight leading-tight mt-1"
                  numberOfLines={1}
                >
                  {item.name}
                </Text>

                {/* Subtitle / Highlights row */}
                <View className="flex-row items-center justify-between mt-3 pt-2.5 border-t border-white/15">
                  <View>
                    <Text className="font-sans text-[11px] text-white/70">
                      Estimated budget
                    </Text>
                    <Text className="font-sans font-semibold text-[17px] text-white">
                      {formatCurrency(item.estimatedCostMinor, (item.costCurrency as 'USD' | 'INR') || 'USD')}
                    </Text>
                  </View>

                  {/* Explore Pill */}
                  <View className="flex-row items-center gap-1.5 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30">
                    <Text className="font-sans font-medium text-[12.5px] text-white">
                      Explore
                    </Text>
                    <Ionicons name="arrow-forward" size={13} color={semanticColors.white} />
                  </View>
                </View>
              </View>
            </Pressable>
          )
        })}
      </ScrollView>

      {/* Pagination Indicators with smooth animated spring morphing */}
      {destinations.length > 1 && (
        <View className="flex-row items-center justify-center gap-1.5 mt-3.5">
          {destinations.map((dest, idx) => (
            <SmoothDot
              key={dest.id}
              isActive={idx === currentIndex}
              onPress={() => scrollToIndex(idx)}
              label={`Go to slide ${idx + 1}`}
              activeColor={semanticColors.foreground}
              inactiveColor={semanticColors.muted}
              height={5}
              activeWidth={22}
              inactiveWidth={6}
            />
          ))}
        </View>
      )}
    </View>
  )
}