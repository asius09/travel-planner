'use client'

import React from 'react'
import { View, Text, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { semanticColors } from '@/theme/colors'

interface ErrorStateProps {
  title?: string
  message: string
  onRetry?: () => void
  retryLabel?: string
  className?: string
}

export function ErrorState({ 
  title = 'Something went wrong', 
  message, 
  onRetry, 
  retryLabel = 'Try again',
  className = '',
}: ErrorStateProps) {
  return (
    <View className={`flex-1 items-center justify-center p-8 gap-4 ${className}`}>
      <View className="w-20 h-20 rounded-full items-center justify-center bg-destructive/10">
        <Ionicons name="alert-circle-outline" size={36} color={semanticColors.destructive} />
      </View>
      <Text className="font-medium text-xl text-center text-foreground">{title}</Text>
      <Text className="font-normal text-[15px] text-center text-muted-foreground leading-[22px] max-w-[280px]">
        {message}
      </Text>
      {onRetry ? (
        <Pressable onPress={onRetry} accessibilityRole="button" className="py-2 px-4">
          <Text className="font-medium text-[15px] text-primary">{retryLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  )
}