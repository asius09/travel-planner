'use client'

import React from 'react'
import { Pressable, Text, PressableProps } from 'react-native'

interface FilterChipProps extends PressableProps {
  label: string
  selected?: boolean
  disabled?: boolean
  className?: string
}

export function FilterChip({ label, selected = false, onPress, disabled = false, className = '', ...props }: FilterChipProps) {
  return (
    <Pressable
      className={`flex-row items-center justify-center py-2 px-4 rounded-[20px] border min-w-[72px] ${
        selected ? 'bg-primary border-primary' : 'bg-surface border-border'
      } ${className}`}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      accessibilityLabel={label}
      {...props}
    >
      <Text className={`font-medium text-sm ${selected ? 'text-white' : 'text-text'}`}>
        {label}
      </Text>
    </Pressable>
  )
}
