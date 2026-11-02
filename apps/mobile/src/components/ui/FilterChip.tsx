'use client'

import React from 'react'
import { Pressable, Text, PressableProps, type GestureResponderEvent, StyleProp, ViewStyle } from 'react-native'
import * as Haptics from 'expo-haptics'
import { semanticColors } from '@/theme/colors'

interface FilterChipProps extends PressableProps {
  label: string
  selected?: boolean
  disabled?: boolean
  className?: string
  style?: StyleProp<ViewStyle>
}

export function FilterChip({
  label,
  selected = false,
  onPress,
  disabled = false,
  className = '',
  style,
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

  const selectedBg = semanticColors.primary
  const selectedBorder = semanticColors.primary
  const selectedText = semanticColors.primaryForeground
  const unselectedBg = semanticColors.surface
  const unselectedBorder = semanticColors.border
  const unselectedText = semanticColors.mutedForeground

  return (
    <Pressable
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 8,
          paddingHorizontal: 16,
          borderRadius: 9999,
          borderWidth: 1,
          minWidth: 68,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: selected ? 0.15 : 0.06,
          shadowRadius: 2,
          elevation: selected ? 2 : 1,
        },
        selected
          ? { backgroundColor: selectedBg, borderColor: selectedBorder }
          : { backgroundColor: unselectedBg, borderColor: unselectedBorder },
        style,
      ]}
      onPress={handlePress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      accessibilityLabel={`Category filter: ${label}`}
      hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
      {...props}
    >
      <Text
        style={{
          fontFamily: 'Geist',
          fontSize: 13,
          fontWeight: selected ? '600' : '500',
          color: selected ? selectedText : unselectedText,
          letterSpacing: -0.2,
        }}
      >
        {label}
      </Text>
    </Pressable>
  )
}
