'use client'

import React from 'react'
import { TextInput, View, Text, TextInputProps, StyleProp, ViewStyle } from 'react-native'

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  style?: StyleProp<ViewStyle>
  className?: string
}

export const Input = React.forwardRef<React.ElementRef<typeof TextInput>, InputProps>(function Input(
  {
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    style,
    className = '',
    placeholderTextColor = '#777F78',
    ...props
  },
  ref
) {
  const hasError = !!error

  return (
    <View className={`w-full gap-1.5 ${className}`} style={style}>
      {label ? (
        <Text className="font-medium text-sm text-text">{label}</Text>
      ) : null}

      <View
        className={`flex-row items-center bg-surface rounded-[14px] border px-4 ${
          hasError ? 'border-[#E57373]' : 'border-border'
        }`}
      >
        {leftIcon ? <View className="mr-2">{leftIcon}</View> : null}

        <TextInput
          ref={ref}
          className="flex-1 font-sans text-base text-text py-3.5"
          placeholderTextColor={placeholderTextColor}
          {...props}
        />

        {rightIcon ? <View className="ml-2">{rightIcon}</View> : null}
      </View>

      {hasError ? (
        <Text className="font-normal text-xs text-[#E57373]">{error}</Text>
      ) : helperText ? (
        <Text className="font-normal text-xs text-muted">{helperText}</Text>
      ) : null}
    </View>
  )
})
