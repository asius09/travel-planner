'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Button } from '@/components/ui/Button'
import { TextMorph } from '@/components/ui'

interface WelcomeSlide {
  id: string
  image: string
  title: string
  subtitle: string
}

const SLIDES: WelcomeSlide[] = [
  {
    id: '1',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=1600&fit=crop',
    title: 'Your Next Adventure Awaits',
    subtitle: 'Find places that fit your mood, time and budget. Discover secluded corners and vibrant cities.',
  },
  {
    id: '2',
    image: 'https://images.unsplash.com/photo-1514970746-d4a465d514d0?w=1200&h=1600&fit=crop',
    title: 'Travel Made Simple',
    subtitle: 'Curated itineraries and realistic budget estimates without the noise or booking hassle.',
  },
  {
    id: '3',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&h=1600&fit=crop',
    title: 'Explore the Wild',
    subtitle: 'Connect with nature, cultural landmarks, and unforgettable experiences tailored to you.',
  },
]

const AUTO_PLAY_INTERVAL = 4500

export default function WelcomeScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { width: screenWidth, height: screenHeight } = useWindowDimensions()

  const [currentIndex, setCurrentIndex] = useState(0)
  const scrollRef = useRef<React.ElementRef<typeof ScrollView>>(null)

  const scrollToIndex = useCallback(
    (index: number) => {
      if (scrollRef.current && screenWidth > 0) {
        scrollRef.current.scrollTo({
          x: index * screenWidth,
          animated: true,
        })
      }
      setCurrentIndex(index)
    },
    [screenWidth]
  )

  // Smooth Looping Auto-advance
  useEffect(() => {
    const timer = setInterval(() => {
      const nextIndex = (currentIndex + 1) % SLIDES.length
      scrollToIndex(nextIndex)
    }, AUTO_PLAY_INTERVAL)

    return () => clearInterval(timer)
  }, [currentIndex, scrollToIndex])

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = e.nativeEvent.contentOffset.x
    if (screenWidth > 0) {
      const newIndex = Math.round(offsetX / screenWidth)
      if (newIndex >= 0 && newIndex < SLIDES.length && newIndex !== currentIndex) {
        setCurrentIndex(newIndex)
      }
    }
  }

  const handlePlanTrip = () => {
    router.push('/auth/signup')
  }

  const handleSignIn = () => {
    router.push('/auth/signin')
  }

  const currentSlide = SLIDES[currentIndex]

  return (
    <View className="flex-1 bg-black">
      {/* Horizontal Swipable & Looping Photography Carousel */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
        style={StyleSheet.absoluteFill}
        bounces={false}
      >
        {SLIDES.map((slide) => (
          <View
            key={slide.id}
            style={{ width: screenWidth, height: screenHeight }}
            className="relative"
          >
            <Image
              source={{ uri: slide.image }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              transition={300}
              cachePolicy="memory-disk"
            />
          </View>
        ))}
      </ScrollView>

      {/* Bottom Gradient Mask ONLY - Upper 58%+ remains completely clear and unobstructed */}
      <LinearGradient
        colors={[
          'transparent',
          'rgba(10, 16, 12, 0.4)',
          'rgba(10, 16, 12, 0.85)',
          '#0a100c',
        ]}
        locations={[0, 0.35, 0.72, 1]}
        style={[
          styles.bottomMask,
          {
            paddingBottom: Math.max(insets.bottom, 20),
          },
        ]}
        pointerEvents="box-none"
      >
        {/* Fluid Morphing Title & Subtitle with Maintained Font Size & Clean Copy */}
        <View className="mb-4 px-1">
          <TextMorph
            className="font-sans text-[28px] leading-[34px] font-semibold text-white tracking-normal"
            duration={240}
          >
            {currentSlide.title}
          </TextMorph>
          <TextMorph
            className="font-sans text-[14px] leading-[20px] text-white/75 mt-1.5 max-w-[330px]"
            duration={240}
          >
            {currentSlide.subtitle}
          </TextMorph>
        </View>

        {/* Carousel Indicator Dots with Clean Hitspots */}
        <View
          className="flex-row items-center justify-center gap-2 mb-4"
          accessibilityRole="progressbar"
          accessibilityValue={{ min: 1, max: SLIDES.length, now: currentIndex + 1 }}
        >
          {SLIDES.map((slide, idx) => {
            const isActive = idx === currentIndex
            return (
              <Pressable
                key={slide.id}
                onPress={() => scrollToIndex(idx)}
                accessibilityLabel={`Go to slide ${idx + 1}`}
                accessibilityRole="button"
                hitSlop={{ top: 12, bottom: 12, left: 10, right: 10 }}
                className="py-1"
              >
                <View
                  className={`h-1.5 rounded-full ${
                    isActive ? 'w-6 bg-[#D7E58A]' : 'w-1.5 bg-white/40'
                  }`}
                />
              </Pressable>
            )
          })}
        </View>

        {/* Full-Width Centered Action Controls */}
        <View className="gap-2.5 w-full items-center">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onPress={handlePlanTrip}
            accessibilityLabel="Plan a trip"
            className="rounded-2xl shadow-md"
          >
            Plan a trip
          </Button>

          <Pressable
            onPress={handleSignIn}
            accessibilityRole="button"
            accessibilityLabel="I already have an account"
            hitSlop={{ top: 10, bottom: 10, left: 16, right: 16 }}
            className="min-h-[44px] justify-center items-center py-1.5 px-4"
          >
            <Text className="font-sans font-medium text-[14px] text-white/80 underline">
              I already have an account
            </Text>
          </Pressable>
        </View>
      </LinearGradient>
    </View>
  )
}

const styles = StyleSheet.create({
  bottomMask: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '42%',
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    zIndex: 10,
  },
})
