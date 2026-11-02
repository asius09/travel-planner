'use client'

import React from 'react'
import { View, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { semanticColors } from '@/theme/colors'

interface ScreenFadeProps {
  height?: number
  visible?: boolean
  pointerEvents?: 'none' | 'auto'
  variant?: 'canvas' | 'dark'
}

/**
 * ScreenFade
 * Produces an ultra-soft, gradual atmospheric fade for floating navigation.
 * Remains translucent and imperceptibly gentle throughout the upper range,
 * only gently building density at the very bottom edge.
 */
export function ScreenFade({
  height = 80,
  visible = true,
  pointerEvents = 'none',
  variant = 'canvas',
}: ScreenFadeProps) {
  if (!visible) return null

  const isDark = variant === 'dark'

  return (
    <View
      pointerEvents={pointerEvents}
      style={[
        styles.container,
        {
          height,
          bottom: 0,
        },
      ]}
    >
      <LinearGradient
        colors={
          isDark
            ? [
                'rgba(37, 43, 45, 0)',
                'rgba(37, 43, 45, 0.04)',
                'rgba(37, 43, 45, 0.2)',
                'rgba(37, 43, 45, 0.55)',
                'rgba(37, 43, 45, 0.88)',
                semanticColors.ink900,
              ]
            : [
                'rgba(246, 244, 239, 0)',
                'rgba(246, 244, 239, 0.03)',
                'rgba(246, 244, 239, 0.16)',
                'rgba(246, 244, 239, 0.48)',
                'rgba(246, 244, 239, 0.84)',
                semanticColors.background,
              ]
        }
        locations={[0, 0.35, 0.6, 0.8, 0.92, 1.0]}
        style={StyleSheet.absoluteFill}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    overflow: 'hidden',
    zIndex: 15,
  },
})