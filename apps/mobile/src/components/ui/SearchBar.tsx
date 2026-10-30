'use client'

import React from 'react'
import { TextInput, View, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface SearchBarProps {
  placeholder?: string
  value: string
  onChangeText: (text: string) => void
  onSubmit?: (text: string) => void
  onClear?: () => void
  autoFocus?: boolean
  style?: any
  className?: string
}

export function SearchBar({ 
  placeholder = 'Search places, regions, or experiences', 
  value, 
  onChangeText, 
  onSubmit, 
  onClear,
  autoFocus = false,
  style,
  className = '',
}: SearchBarProps) {
  return (
    <View className={`flex-row items-center bg-surface rounded-[14px] border border-border px-4 gap-3 ${className}`} style={style}>
      <Ionicons name="search" size={22} color="#777F78" />
      <TextInput
        className="flex-1 font-sans text-base text-text py-3.5"
        placeholder={placeholder}
        placeholderTextColor="#777F78"
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit ? () => onSubmit(value) : undefined}
        autoFocus={autoFocus}
        clearButtonMode="never"
      />
      {value ? (
        <Pressable onPress={onClear} accessibilityLabel="Clear search" className="p-1">
          <Ionicons name="close-circle" size={22} color="#777F78" />
        </Pressable>
      ) : null}
    </View>
  )
}
