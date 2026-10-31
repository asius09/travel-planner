'use client'

import React from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { Image as ExpoImage } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'
import { avatarGradients } from '@/theme/tokens'

interface ProfileAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  imageUrl?: string | null
  onPress?: () => void
  showEditBadge?: boolean
  className?: string
}

const SIZES = {
  sm: { dimension: 36, badge: 12, icon: 14 },
  md: { dimension: 44, badge: 14, icon: 18 },
  lg: { dimension: 68, badge: 20, icon: 26 },
  xl: { dimension: 88, badge: 24, icon: 32 },
}

export function ProfileAvatar({
  size = 'md',
  imageUrl,
  onPress,
  showEditBadge = false,
  className = '',
}: ProfileAvatarProps) {
  const { user } = useAuthStore()
  const { theme } = useThemeStore()
  const { dimension, badge: badgeSize } = SIZES[size]

  // Theme-derived multi-stop smooth gradient
  const gradientColors = avatarGradients[theme] || avatarGradients.nature
  const initial = (user?.name?.trim()?.[0] || user?.email?.trim()?.[0] || 'A').toUpperCase()

  const avatarContent = (
    <View
      style={{
        width: dimension,
        height: dimension,
        borderRadius: dimension / 2,
        overflow: 'hidden',
        borderWidth: size === 'sm' ? 1.5 : 2,
        borderColor: 'rgba(255, 255, 255, 0.4)',
        backgroundColor: 'var(--primary)',
      }}
      className="items-center justify-center relative"
    >
      {imageUrl ? (
        <ExpoImage
          source={{ uri: imageUrl }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
        />
      ) : (
        /* Smooth Theme-Derived Gradient with Fluid Organic Layers */
        <View style={StyleSheet.absoluteFill} className="items-center justify-center">
          {/* Base diagonal wash */}
          <LinearGradient
            colors={[gradientColors[0], gradientColors[1], gradientColors[2]]}
            start={{ x: 0.1, y: 0.1 }}
            end={{ x: 0.9, y: 0.9 }}
            style={StyleSheet.absoluteFill}
          />

          {/* Secondary ambient highlight orb */}
          <View
            style={{
              position: 'absolute',
              top: -dimension * 0.2,
              left: -dimension * 0.1,
              width: dimension * 0.8,
              height: dimension * 0.8,
              borderRadius: dimension * 0.4,
              backgroundColor: 'rgba(255, 255, 255, 0.32)',
            }}
          />

          {/* Tertiary deep contrast crescent */}
          <View
            style={{
              position: 'absolute',
              bottom: -dimension * 0.25,
              right: -dimension * 0.2,
              width: dimension * 0.85,
              height: dimension * 0.85,
              borderRadius: dimension * 0.425,
              backgroundColor: 'rgba(0, 0, 0, 0.38)',
            }}
          />

          {/* Delicate glassy surface sheen */}
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.45)', 'transparent', 'rgba(0, 0, 0, 0.25)']}
            start={{ x: 0.3, y: 0 }}
            end={{ x: 0.7, y: 1 }}
            style={StyleSheet.absoluteFill}
          />

          {/* Centered Single Initial */}
          <Text
            style={{
              fontSize: dimension * 0.44,
              fontFamily: 'Geist-Medium',
              color: '#FFFFFF',
              textAlign: 'center',
              includeFontPadding: false,
              textShadowColor: 'rgba(0, 0, 0, 0.35)',
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 3,
            }}
          >
            {initial}
          </Text>
        </View>
      )}

      {/* Optional Edit Badge */}
      {showEditBadge && (
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: badgeSize,
            height: badgeSize,
            borderRadius: badgeSize / 2,
            backgroundColor: 'var(--accent)',
            borderWidth: 1.5,
            borderColor: '#FFFFFF',
          }}
          className="items-center justify-center shadow-xs"
        >
          <Ionicons name="pencil" size={badgeSize * 0.6} color="var(--primary)" />
        </View>
      )}
    </View>
  )

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`View profile of ${user?.name || user?.email || 'User'}`}
        className={`active:opacity-85 active:scale-95 transition-transform ${className}`}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        {avatarContent}
      </Pressable>
    )
  }

  return <View className={className}>{avatarContent}</View>
}