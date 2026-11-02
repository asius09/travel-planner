'use client'

import React, { useState, useEffect, useMemo } from 'react'
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  Animated,
} from 'react-native'
import { BlurView } from 'expo-blur'
import { LinearGradient } from 'expo-linear-gradient'

interface StickySectionHeaderProps {
  scrollY: Animated.Value
  insetsTop: number
  mustSeeSectionY?: number
  popularSectionY?: number
  onScrollToTop?: () => void
  onSeeAll?: () => void
}

/**
 * StickySectionHeader
 * Floating sticky header that appears ONLY when an in-page section title scrolls
 * behind the top bar area.
 * Uses a soft, gradual faded blur with zero hard borders or sharp cutoff lines.
 */
export function StickySectionHeader({
  scrollY,
  insetsTop,
  mustSeeSectionY = 280,
  popularSectionY = 620,
  onScrollToTop,
  onSeeAll,
}: StickySectionHeaderProps) {
  const [currentSection, setCurrentSection] = useState<'must-see' | 'popular'>('must-see')

  // Calculate dynamic threshold based on when the in-page title reaches top header zone
  const { startThreshold, endThreshold } = useMemo(() => {
    const start = Math.max(mustSeeSectionY - insetsTop - 36, 180)
    return {
      startThreshold: start,
      endThreshold: start + 32,
    }
  }, [mustSeeSectionY, insetsTop])

  useEffect(() => {
    const listenerId = scrollY.addListener(({ value }) => {
      const switchThreshold = Math.max(popularSectionY - insetsTop - 42, 520)
      if (value >= switchThreshold) {
        setCurrentSection('popular')
      } else {
        setCurrentSection('must-see')
      }
    })

    return () => {
      scrollY.removeListener(listenerId)
    }
  }, [scrollY, popularSectionY, insetsTop])

  // Container fade: only appears when in-page title is passing behind top bar
  const containerOpacity = scrollY.interpolate({
    inputRange: [startThreshold, endThreshold],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  })

  // Title translation: translates upwards from bottom into position inside header
  const titleTranslateY = scrollY.interpolate({
    inputRange: [startThreshold, endThreshold],
    outputRange: [14, 0],
    extrapolate: 'clamp',
  })

  const titleOpacity = scrollY.interpolate({
    inputRange: [startThreshold, endThreshold],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  })

  const title =
    currentSection === 'popular' ? 'Popular destinations' : 'Must-See Today'

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.container,
        {
          opacity: containerOpacity,
        },
      ]}
    >
      {/* 1. Soft Faded Blur Surface (Zero Hard Borders) */}
      <View style={StyleSheet.absoluteFill} className="overflow-hidden" pointerEvents="none">
        {Platform.OS === 'ios' && (
          <BlurView
            intensity={55}
            tint="light"
            style={[StyleSheet.absoluteFill, { bottom: 14 }]}
          />
        )}

        {/* Gradual Canvas Dissolution - Seamlessly dissolves to zero with no hard edge */}
        <LinearGradient
          colors={[
            'rgba(250, 248, 245, 0.98)',
            'rgba(250, 248, 245, 0.90)',
            'rgba(250, 248, 245, 0.58)',
            'rgba(250, 248, 245, 0.18)',
            'rgba(250, 248, 245, 0)',
          ]}
          locations={[0, 0.44, 0.70, 0.88, 1.0]}
          style={StyleSheet.absoluteFill}
        />
      </View>

      {/* 2. Title Content - Translates from Bottom to Position (No border-b) */}
      <Pressable
        onPress={onScrollToTop}
        accessibilityRole="header"
        accessibilityLabel={`Current section: ${title}`}
        style={{
          paddingTop: Math.max(insetsTop, 16) + 4,
          paddingBottom: 16,
        }}
        className="px-5 flex-row items-center justify-between"
      >
        <Animated.View
          style={{
            transform: [{ translateY: titleTranslateY }],
            opacity: titleOpacity,
          }}
          className="flex-1 mr-3"
        >
          <Text
            className="font-sans font-semibold text-[17px] text-foreground tracking-tight"
            numberOfLines={1}
          >
            {title}
          </Text>
        </Animated.View>

        {currentSection === 'must-see' && onSeeAll && (
          <Pressable
            onPress={onSeeAll}
            accessibilityRole="button"
            accessibilityLabel="See all destinations"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            className="py-1 px-2.5 rounded-full bg-secondary active:opacity-60"
          >
            <Text className="font-sans font-medium text-[12px] text-primary">
              See All
            </Text>
          </Pressable>
        )}
      </Pressable>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 35,
  },
})
