'use client'

import React from 'react'
import { View, Text, StyleProp, ViewStyle } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Button } from './Button'

interface EmptyStateProps {
  icon?: string
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  style?: StyleProp<ViewStyle>
  className?: string
}

export function EmptyState({ 
  icon = 'compass-outline', 
  title, 
  description, 
  actionLabel, 
  onAction,
  style,
  className = '',
}: EmptyStateProps) {
  return (
    <View className={`flex-1 items-center justify-center p-8 gap-4 ${className}`} style={style}>
      <View className="w-20 h-20 rounded-full items-center justify-center bg-soft">
        <Ionicons name={icon as any} size={36} color="#263F35" />
      </View>
      <Text className="font-medium text-xl text-center text-text">{title}</Text>
      <Text className="font-normal text-[15px] text-center text-muted leading-[22px] max-w-[280px]">
        {description}
      </Text>
      {actionLabel && onAction ? (
        <Button variant="primary" size="md" onPress={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </View>
  )
}
