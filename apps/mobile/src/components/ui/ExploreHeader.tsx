'use client'

import React from 'react'
import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native'
import { Image as ExpoImage } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { semanticColors } from '@/theme/colors'

interface ExploreHeaderProps {
  children?: React.ReactNode
  style?: StyleProp<ViewStyle>
  className?: string
  height?: number
}

const HERO_TRAVEL_IMAGES: Record<string, string> = {
  nature: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1400&h=900&fit=crop&q=85',
  adventure: 'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=1400&h=900&fit=crop&q=85',
  beach: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1400&h=900&fit=crop&q=85',
  city: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1400&h=900&fit=crop&q=85',
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
  height = 290,
}: ExploreHeaderProps) {
  const heroImageUri = HERO_TRAVEL_IMAGES.nature

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
        colors={['rgba(0, 0, 0, 0.38)', 'rgba(0, 0, 0, 0.08)', 'transparent']}
        locations={[0, 0.45, 1]}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 110,
        }}
      />

      {/* 3. Bottom Seamless Canvas Fade into background */}
      <LinearGradient
        colors={[
          'transparent',
          'rgba(250, 249, 246, 0.40)',
          'rgba(250, 249, 246, 0.90)',
          semanticColors.background,
        ]}
        locations={[0.10, 0.45, 0.72, 0.92]}
        style={StyleSheet.absoluteFill}
      />

      {/* Optional Children slot */}
      {children}
    </View>
  )
}