'use client'

import React from 'react'
import { View, ViewProps, Pressable, type StyleProp, type ViewStyle } from 'react-native'

interface CardProps extends ViewProps {
  children: React.ReactNode
  onPress?: () => void
  pressable?: boolean
  className?: string
}

export function Card({ children, style, className = '', onPress, pressable = false, ...props }: CardProps) {
  if (pressable) {
    return (
      <Pressable
        className={`bg-surface rounded-[20px] border border-border overflow-hidden ${className}`}
        style={style}
        onPress={onPress}
        accessibilityRole="button"
        {...props}
      >
        {children}
      </Pressable>
    )
  }
  
  return (
    <View
      className={`bg-surface rounded-[20px] border border-border overflow-hidden ${className}`}
      style={style}
      {...props}
    >
      {children}
    </View>
  )
}

export function CardHeader({ children, style, className = '' }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; className?: string }) {
  return <View className={`p-4 border-b border-border ${className}`} style={style}>{children}</View>
}

export function CardContent({ children, style, className = '' }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; className?: string }) {
  return <View className={`p-4 ${className}`} style={style}>{children}</View>
}

export function CardFooter({ children, style, className = '' }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; className?: string }) {
  return <View className={`p-4 border-t border-border ${className}`} style={style}>{children}</View>
}
