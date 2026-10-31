'use client'

import React from 'react'
import { Pressable, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { semanticColors } from '@/theme/colors'

interface OnboardingOptionProps {
  label: string
  description?: string
  /** Icon name from the Ionicons set rendered by `@expo/vector-icons`. */
  icon?: keyof typeof Ionicons.glyphMap
  selected: boolean
  onPress: () => void
  disabled?: boolean
  className?: string
}

export function OnboardingOption({ 
  label, 
  description, 
  icon, 
  selected, 
  onPress, 
  disabled = false,
  className = '',
}: OnboardingOptionProps) {
  return (
    <Pressable
      className={`flex-row items-center p-4 rounded-2xl border-2 gap-3.5 min-h-[64px] overflow-hidden ${
        selected ? 'border-primary bg-soft' : 'border-border bg-surface'
      } ${className}`}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      accessibilityLabel={label}
    >
      {icon ? (
        <View
          className={`w-10 h-10 rounded-xl items-center justify-center ${
            selected ? 'bg-primary' : 'bg-border'
          }`}
        >
          <Ionicons
            name={icon}
            size={20}
            color={selected ? semanticColors.primaryForeground : semanticColors.primary}
          />
        </View>
      ) : null}

      <View className="flex-1 min-w-0">
        <Text className={`text-base text-foreground ${selected ? 'font-medium' : 'font-normal'}`}>
          {label}
        </Text>
        {description ? (
          <Text className="font-normal text-xs text-muted-foreground mt-0.5">{description}</Text>
        ) : null}
      </View>

      <Ionicons
        name="checkmark-circle"
        size={24}
        color={selected ? semanticColors.primary : 'transparent'}
      />
    </Pressable>
  )
}