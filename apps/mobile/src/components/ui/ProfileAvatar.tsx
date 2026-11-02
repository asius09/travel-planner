'use client';

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';
import { semanticColors } from '@/theme/colors';

interface ProfileAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  imageUrl?: string | null;
  onPress?: () => void;
  showEditBadge?: boolean;
  className?: string;
}

const SIZES = {
  sm: { dimension: 36, badge: 13, icon: 16, fontSize: 14 },
  md: { dimension: 44, badge: 15, icon: 20, fontSize: 17 },
  lg: { dimension: 68, badge: 22, icon: 30, fontSize: 26 },
  xl: { dimension: 88, badge: 26, icon: 38, fontSize: 34 },
};

/**
 * Brand gradient colors derived strictly from global.css semantic tokens:
 * --accent (#0284C7) to --primary (#026AA7)
 */
const BRAND_AVATAR_GRADIENT = [semanticColors.accent, semanticColors.primary] as const;

export function ProfileAvatar({
  size = 'md',
  imageUrl,
  onPress,
  showEditBadge = false,
  className = '',
}: ProfileAvatarProps) {
  const { user } = useAuthStore();
  const { dimension, badge: badgeSize, icon: iconSize, fontSize } = SIZES[size];

  const initial = (user?.name?.trim()?.[0] || user?.email?.trim()?.[0] || '').toUpperCase();

  const avatarContent = (
    <View
      style={{
        width: dimension,
        height: dimension,
        borderRadius: dimension / 2,
        borderWidth: size === 'sm' ? 1.5 : 2,
        borderColor: 'rgba(255, 255, 255, 0.75)',
        backgroundColor: semanticColors.primary,
        shadowColor: semanticColors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.18,
        shadowRadius: 6,
        elevation: 3,
      }}
      className="relative items-center justify-center"
    >
      {/* Clip inner content to circular radius */}
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius: dimension / 2,
            overflow: 'hidden',
            alignItems: 'center',
            justifyContent: 'center',
          },
        ]}
      >
        {imageUrl ? (
          <ExpoImage
            source={{ uri: imageUrl }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <>
            {/* Luminous Brand Diagonal Gradient */}
            <LinearGradient
              colors={BRAND_AVATAR_GRADIENT}
              start={{ x: 0.1, y: 0.05 }}
              end={{ x: 0.9, y: 0.95 }}
              style={StyleSheet.absoluteFill}
            />

            {/* Subtle frosted glass specular highlight */}
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.28)', 'rgba(255, 255, 255, 0.0)']}
              start={{ x: 0.2, y: 0.1 }}
              end={{ x: 0.8, y: 0.9 }}
              style={StyleSheet.absoluteFill}
            />

            {/* Clean Monogram or Silhouette Icon */}
            {initial ? (
              <Text
                style={{
                  fontSize,
                  fontFamily: 'Geist',
                  fontWeight: '600',
                  color: '#FFFFFF',
                  letterSpacing: -0.3,
                  includeFontPadding: false,
                }}
              >
                {initial}
              </Text>
            ) : (
              <Ionicons name="person" size={iconSize} color="#FFFFFF" />
            )}
          </>
        )}
      </View>

      {/* Optional Edit Badge */}
      {showEditBadge && (
        <View
          style={{
            position: 'absolute',
            bottom: -1,
            right: -1,
            width: badgeSize,
            height: badgeSize,
            borderRadius: badgeSize / 2,
            backgroundColor: semanticColors.primary,
            borderWidth: 1.5,
            borderColor: '#FFFFFF',
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.16,
            shadowRadius: 2,
            elevation: 2,
          }}
          className="items-center justify-center"
        >
          <Ionicons name="camera" size={badgeSize * 0.55} color="#FFFFFF" />
        </View>
      )}
    </View>
  );

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
    );
  }

  return <View className={className}>{avatarContent}</View>;
}
