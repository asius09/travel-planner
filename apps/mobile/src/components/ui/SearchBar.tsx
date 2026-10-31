'use client'

import React from 'react'
import { TextInput, View, Pressable, type StyleProp, type ViewStyle, Platform } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { semanticColors } from '@/theme/colors'

interface SearchBarProps {
  placeholder?: string
  value: string
  onChangeText: (text: string) => void
  onSubmit?: (text: string) => void
  onClear?: () => void
  autoFocus?: boolean
  style?: StyleProp<ViewStyle>
  className?: string
}

export function SearchBar({
  placeholder = 'Find places, food, Trips..',
  value,
  onChangeText,
  onSubmit,
  onClear,
  autoFocus = false,
  style,
  className = '',
}: SearchBarProps) {
  return (
    <View
      className={`flex-row items-center bg-surface rounded-full border border-border px-4 h-[48px] ${className}`}
      style={style}
    >
      <Ionicons name="search" size={19} color={semanticColors.mutedForeground} />
      <TextInput
        className="flex-1 font-sans text-[15px] text-foreground ml-2.5"
        style={{
          paddingVertical: 0,
          paddingHorizontal: 0,
          height: Platform.OS === 'ios' ? 44 : '100%',
          textAlignVertical: 'center',
        }}
        placeholder={placeholder}
        placeholderTextColor={semanticColors.mutedForeground}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit ? () => onSubmit(value) : undefined}
        autoFocus={autoFocus}
        clearButtonMode="never"
        returnKeyType="search"
      />
      {value ? (
        <Pressable
          onPress={onClear}
          accessibilityRole="button"
          accessibilityLabel="Clear search text"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          className="p-1 active:opacity-60"
        >
          <Ionicons name="close-circle" size={18} color={semanticColors.mutedForeground} />
        </Pressable>
      ) : null}
    </View>
  )
}