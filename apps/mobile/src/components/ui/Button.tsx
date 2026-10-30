'use client'

import { Pressable, Text, StyleSheet, PressableProps } from 'react-native'

interface ButtonProps extends Omit<PressableProps, 'children'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  fullWidth?: boolean
  children?: React.ReactNode
}

const variantStyles: Record<string, string> = {
  primary: 'bg-primary border-0',
  secondary: 'bg-accent border-0',
  outline: 'bg-transparent border-2 border-primary',
  ghost: 'bg-transparent border-0',
}

const sizeStyles: Record<string, string> = {
  sm: 'py-2 px-4',
  md: 'py-3 px-5',
  lg: 'py-4 px-6',
}

const variantTextStyles: Record<string, string> = {
  primary: 'text-white',
  secondary: 'text-text',
  outline: 'text-primary',
  ghost: 'text-primary',
}

const sizeTextStyles: Record<string, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  disabled = false, 
  loading = false, 
  onPress, 
  children, 
  fullWidth = false,
  className = '',
  style,
  ...props 
}: ButtonProps & { className?: string }) {
  return (
    <Pressable
      className={`flex-row items-center justify-center rounded-2xl ${variantStyles[variant] ?? variantStyles.primary} ${sizeStyles[size] ?? sizeStyles.md} ${fullWidth ? 'w-full' : 'self-start'} ${disabled || loading ? 'opacity-60' : 'opacity-100'} ${className}`}
      disabled={disabled || loading}
      onPress={onPress}
      accessibilityState={{ disabled: disabled || loading }}
      accessibilityRole="button"
      style={style}
      {...props}
    >
      {loading ? (
        <Text className="text-white font-medium">Loading...</Text>
      ) : (
        <Text className={`font-medium ${variantTextStyles[variant] ?? variantTextStyles.primary} ${sizeTextStyles[size] ?? sizeTextStyles.md}`}>
          {children}
        </Text>
      )}
    </Pressable>
  )
}
