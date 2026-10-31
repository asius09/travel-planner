'use client'

import React from 'react'
import { View, Text, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface SectionHeaderProps {
  title: string
  subtitle?: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

export function SectionHeader({
  title,
  subtitle,
  actionLabel,
  onAction,
  className = '',
}: SectionHeaderProps) {
  return (
    <View className={`flex-row items-baseline justify-between mb-3 ${className}`}>
      <View className="flex-1 mr-3">
        <Text className="font-sans font-medium text-[20px] text-text tracking-tight">
          {title}
        </Text>
        {subtitle ? (
          <Text className="font-sans text-[13px] text-muted mt-0.5">{subtitle}</Text>
        ) : null}
      </View>

      {actionLabel && onAction ? (
        <Pressable
          onPress={onAction}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          className="flex-row items-center gap-0.5 active:opacity-70"
        >
          <Text className="font-sans font-medium text-[13px] text-primary">
            {actionLabel}
          </Text>
          <Ionicons name="chevron-forward" size={13} color="#263F35" />
        </Pressable>
      ) : null}
    </View>
  )
}
