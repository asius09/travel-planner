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
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { primitiveColors } from '@/theme/colors'
import { TextMorph, SmoothDot } from '@/components/ui'

interface WelcomeSlide {
  id: string
  image: string
  tag: string
  title: string
  subtitle: string
}

const SLIDES: WelcomeSlide[] = [
  {
    id: '1',
    image:
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1400&h=2000&fit=crop&q=85',
    tag: 'Alpine serenity',
    title: 'Your Next Adventure',
    subtitle:
      'Find places that fit your mood, time, and budget. Discover secluded peaks and serene corners.',
  },
  {
    id: '2',
    image:
      'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=1400&h=2000&fit=crop&q=85',
    tag: 'Mountain trails',
    title: 'Travel Made Simple',
    subtitle:
      'Curated itineraries and realistic budget estimates without the noise or booking hassle.',
  },
  {
    id: '3',
    image:
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1400&h=2000&fit=crop&q=85',
    tag: 'Wild horizons',
    title: 'Explore the Wild',
    subtitle:
      'Connect with nature, cultural landmarks, and unforgettable experiences tailored to you.',
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

  const currentSlide = SLIDES[currentIndex] ?? SLIDES[0]

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

      {/* Top Ambient Vignette for Status Bar & Header clarity */}
      <LinearGradient
        colors={['rgba(0, 0, 0, 0.45)', 'rgba(0, 0, 0, 0.12)', 'transparent']}
        locations={[0, 0.45, 1]}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: Math.max(insets.top + 48, 88),
          zIndex: 5,
        }}
        pointerEvents="none"
      />

      {/* Bottom Gradient Mask ONLY - Upper 54%+ remains completely clear and unobstructed */}
      <LinearGradient
        colors={[
          'transparent',
          'rgba(26, 29, 30, 0.35)',
          'rgba(26, 29, 30, 0.85)',
          primitiveColors.ink900,
        ]}
        locations={[0, 0.3, 0.68, 1]}
        style={[
          styles.bottomMask,
          {
            paddingBottom: Math.max(insets.bottom, 24),
          },
        ]}
        pointerEvents="box-none"
      >
        {/* Confident, Readable Title & Subtitle with TextMorph */}
        <View className="mb-5 min-h-[116px] justify-end">
          {/* Frosted tag badge with TextMorph numeric slide counter */}
          <View className="mb-2.5 flex-row items-center self-start rounded-full border border-white/20 bg-black/40 px-3 py-1">
            <Text className="font-sans text-[12px] font-medium text-white/95">
              {currentSlide.tag}
            </Text>
            <Text className="mx-1.5 font-sans text-[12px] text-white/40">·</Text>
            <TextMorph
              variant="number"
              preset="smooth"
              textStyle={{
                fontFamily: 'Geist',
                fontSize: 12,
                fontWeight: '600',
                color: '#FFFFFF',
              }}
            >
              {`0${currentIndex + 1}`}
            </TextMorph>
            <Text className="font-sans text-[12px] font-medium text-white/60">
              {` / 0${SLIDES.length}`}
            </Text>
          </View>

          {/* Morphing headline */}
          <TextMorph
            variant="text"
            preset="smooth"
            textStyle={{
              fontFamily: 'Geist',
              fontSize: 32,
              lineHeight: 38,
              fontWeight: '600',
              color: '#FFFFFF',
              letterSpacing: -0.6,
            }}
          >
            {currentSlide.title}
          </TextMorph>

          {/* Subtitle */}
          <Text className="mt-2 max-w-[340px] font-sans text-[15px] leading-[22px] text-white/85">
            {currentSlide.subtitle}
          </Text>
        </View>

        {/* Carousel Indicator Dots with Smooth Circle-to-Cylinder Spring Animation */}
        <View
          className="mb-5 flex-row items-center justify-center gap-2"
          accessibilityRole="progressbar"
          accessibilityValue={{ min: 1, max: SLIDES.length, now: currentIndex + 1 }}
        >
          {SLIDES.map((slide, idx) => (
            <SmoothDot
              key={slide.id}
              isActive={idx === currentIndex}
              onPress={() => scrollToIndex(idx)}
              label={`Go to slide ${idx + 1}`}
              activeColor="#FFFFFF"
              inactiveColor="rgba(255, 255, 255, 0.38)"
              activeWidth={26}
              inactiveWidth={6}
              height={6}
            />
          ))}
        </View>

        {/* Full-Width Action Controls */}
        <View className="w-full items-center gap-3">
          <Pressable
            onPress={handlePlanTrip}
            accessibilityRole="button"
            accessibilityLabel="Plan a trip"
            className="h-[54px] w-full flex-row items-center justify-center gap-2 rounded-full bg-white shadow-lg active:opacity-90"
          >
            <Text
              style={{ color: primitiveColors.ink900 }}
              className="font-sans text-[16px] font-semibold tracking-tight"
            >
              Plan a trip
            </Text>
            <Ionicons name="arrow-forward" size={18} color={primitiveColors.ink900} />
          </Pressable>

          <Pressable
            onPress={handleSignIn}
            accessibilityRole="button"
            accessibilityLabel="I already have an account"
            hitSlop={{ top: 12, bottom: 12, left: 16, right: 16 }}
            className="min-h-[44px] items-center justify-center px-4 py-1.5 active:opacity-60"
          >
            <Text className="font-sans text-[14px] font-medium text-white/80">
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
    height: '46%',
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    zIndex: 10,
  },
})
