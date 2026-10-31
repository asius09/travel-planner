'use client'

import React from 'react'
import { Pressable, Text, PressableProps, type GestureResponderEvent } from 'react-native'
import * as Haptics from 'expo-haptics'

interface FilterChipProps extends PressableProps {
  label: string
  selected?: boolean
  disabled?: boolean
  className?: string
}

export function FilterChip({
  label,
  selected = false,
  onPress,
  disabled = false,
  className = '',
  ...props
}: FilterChipProps) {
  const handlePress = (e: GestureResponderEvent) => {
    try {
      Haptics.selectionAsync()
    } catch {
      // Ignore
    }
    onPress?.(e)
  }

  return (
    <Pressable
      className={`flex-row items-center justify-center py-2.5 px-4 rounded-full border min-w-[72px] active:scale-95 transition-transform ${
        selected
          ? 'bg-[#D4F638] border-[#D4F638] shadow-xs'
          : 'bg-surface border-border'
      } ${className}`}
      onPress={handlePress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      accessibilityLabel={`Category filter: ${label}`}
      hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
      {...props}
    >
      <Text
        style={{ color: selected ? '#121614' : undefined }}
        className={`font-sans text-[13.5px] ${
          selected ? 'font-medium' : 'font-normal text-text'
        }`}
      >
        {label}
      </Text>
    </Pressable>
  )
}
