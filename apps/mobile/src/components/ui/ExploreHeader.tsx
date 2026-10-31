'use client'

import React from 'react'
import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native'
import { Image as ExpoImage } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { useThemeStore } from '@/store/themeStore'
import { semanticColors } from '@/theme/colors'

interface ExploreHeaderProps {
  children?: React.ReactNode
  style?: StyleProp<ViewStyle>
  className?: string
  height?: number
}

const HERO_TRAVEL_IMAGES: Record<string, string> = {
  nature: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1400&h=900&fit=crop',
  adventure: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1400&h=900&fit=crop',
  beach: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1400&h=900&fit=crop',
  city: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1400&h=900&fit=crop',
}

/**
 * ExploreHeader
 * Renders an immersive, full-bleed travel hero photograph extending to the top edge
 * of the screen with smooth atmospheric canvas blending.
 * All header text has been removed per design instructions so content scrolls smoothly over it.
 */
export function ExploreHeader({
  children,
  style,
  className = '',
  height = 360,
}: ExploreHeaderProps) {
  const { theme } = useThemeStore()
  const heroImageUri = HERO_TRAVEL_IMAGES[theme] || HERO_TRAVEL_IMAGES.nature

  return (
    <View
      pointerEvents="box-none"
      style={[
        {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height,
        },
        style,
      ]}
      className={`overflow-hidden ${className}`}
    >
      {/* 1. Full-Bleed Travel Hero Photography */}
      <ExpoImage
        source={{ uri: heroImageUri }}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        transition={300}
        cachePolicy="memory-disk"
      />

      {/* 2. Top Scrim for Status Bar Legibility */}
      <LinearGradient
        colors={['rgba(0, 0, 0, 0.32)', 'rgba(0, 0, 0, 0.06)', 'transparent']}
        locations={[0, 0.4, 1]}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 105,
        }}
      />

      {/* 3. Bottom Seamless Canvas Fade into background */}
      <LinearGradient
        colors={[
          'transparent',
          'rgba(246, 244, 239, 0.18)',
          'rgba(246, 244, 239, 0.72)',
          semanticColors.background,
        ]}
        locations={[0.42, 0.7, 0.9, 1.0]}
        style={StyleSheet.absoluteFill}
      />

      {/* Optional Children slot */}
      {children}
    </View>
  )
}