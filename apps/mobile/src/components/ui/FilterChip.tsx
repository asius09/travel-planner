'use client'

import React from 'react'
import { Pressable, Text, View, PressableProps, type GestureResponderEvent, StyleProp, ViewStyle } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useThemeStore } from '@/store/themeStore'

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
  const { tokens } = useThemeStore()

  const handlePress = (e: GestureResponderEvent) => {
    try {
      Haptics.selectionAsync()
    } catch {
      // Ignore
    }
    onPress?.(e)
  }

  const selectedBg = tokens.primary
  const selectedBorder = tokens.primary
  const selectedText = tokens.primaryForeground
  const unselectedBorder = '#E7E3DB'
  const unselectedText = '#252B2D'

  return (
    <Pressable
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 8,
          paddingHorizontal: 14,
          borderRadius: 9999,
          borderWidth: 1,
          minWidth: 64,
        },
        selected
          ? { backgroundColor: selectedBg, borderColor: selectedBorder }
          : { backgroundColor: 'transparent', borderColor: unselectedBorder },
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
          fontWeight: selected ? '500' : '400',
          color: selected ? selectedText : unselectedText,
        }}
      >
        {label}
      </Text>
    </Pressable>
  )
}