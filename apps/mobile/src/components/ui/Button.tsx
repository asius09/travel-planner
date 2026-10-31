'use client'

import React, { useEffect, useRef, useState } from 'react'
import {
  Pressable,
  Text,
  View,
  Animated,
  Platform,
  LayoutAnimation,
  UIManager,
  ActivityIndicator,
  type GestureResponderEvent,
  type PressableProps,
  type TextStyle,
  type StyleProp,
} from 'react-native'

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true)
}

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends Omit<PressableProps, 'children'> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  loadingText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
  children?: React.ReactNode
  className?: string
  textClassName?: string
  textStyle?: StyleProp<TextStyle>
  spinnerColor?: string
}

const variantContainerClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary border border-transparent active:opacity-95',
  secondary: 'bg-secondary border border-transparent active:opacity-90',
  outline: 'bg-transparent border border-primary active:bg-primary/5',
  ghost: 'bg-transparent border border-transparent active:bg-muted/30',
  destructive: 'bg-destructive border border-transparent active:opacity-95',
}

const sizeContainerClasses: Record<ButtonSize, string> = {
  sm: 'h-9 min-h-[36px] px-3.5 rounded-xl',
  md: 'h-11 min-h-[44px] px-5 rounded-[14px]',
  lg: 'h-[52px] min-h-[52px] px-6 rounded-2xl',
}

const variantTextClasses: Record<ButtonVariant, string> = {
  primary: 'text-primary-foreground',
  secondary: 'text-secondary-foreground',
  outline: 'text-primary',
  ghost: 'text-primary',
  destructive: 'text-destructive-foreground',
}

const sizeTextClasses: Record<ButtonSize, string> = {
  sm: 'text-[13.5px] leading-tight font-medium',
  md: 'text-[15px] leading-tight font-medium',
  lg: 'text-[16px] leading-tight font-medium',
}

const defaultSpinnerColors: Record<ButtonVariant, string> = {
  primary: '#FFFFFF',
  secondary: '#252B2D',
  outline: '#252B2D',
  ghost: '#252B2D',
  destructive: '#FFFFFF',
}

const spinnerSizes: Record<ButtonSize, 'small' | 'large'> = {
  sm: 'small',
  md: 'small',
  lg: 'small',
}

export function getSpinnerColor(variant: ButtonVariant = 'primary', customColor?: string): string {
  return customColor ?? defaultSpinnerColors[variant] ?? defaultSpinnerColors.primary
}

export function getButtonClasses({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  className = '',
}: {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  disabled?: boolean
  loading?: boolean
  className?: string
}): string {
  return [
    'flex-row items-center justify-center select-none',
    sizeContainerClasses[size] ?? sizeContainerClasses.md,
    variantContainerClasses[variant] ?? variantContainerClasses.primary,
    fullWidth ? 'w-full' : 'self-start',
    disabled || loading ? 'opacity-65' : 'opacity-100',
    className,
  ]
    .filter(Boolean)
    .join(' ')
}

export function getButtonTextClasses({
  variant = 'primary',
  size = 'md',
  textClassName = '',
}: {
  variant?: ButtonVariant
  size?: ButtonSize
  textClassName?: string
}): string {
  return [
    'font-sans text-center',
    sizeTextClasses[size] ?? sizeTextClasses.md,
    variantTextClasses[variant] ?? variantTextClasses.primary,
    textClassName,
  ]
    .filter(Boolean)
    .join(' ')
}

export function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  loadingText,
  leftIcon,
  rightIcon,
  onPress,
  children,
  fullWidth = false,
  className = '',
  textClassName = '',
  textStyle,
  spinnerColor,
  style,
  ...props
}: ButtonProps) {
  const isInteractive = !disabled && !loading
  const [scaleAnim] = useState(() => new Animated.Value(1))
  const [loadingAnim] = useState(() => new Animated.Value(loading ? 1 : 0))
  const prevLoadingRef = useRef(loading)

  useEffect(() => {
    if (prevLoadingRef.current !== loading) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
      Animated.timing(loadingAnim, {
        toValue: loading ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }).start()
      prevLoadingRef.current = loading
    }
  }, [loading, loadingAnim])

  const handlePressIn = (e: GestureResponderEvent) => {
    if (!isInteractive) return
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
      speed: 50,
      bounciness: 0,
    }).start()
    props.onPressIn?.(e)
  }

  const handlePressOut = (e: GestureResponderEvent) => {
    if (!isInteractive) return
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 40,
      bounciness: 2,
    }).start()
    props.onPressOut?.(e)
  }

  const resolvedSpinnerColor = getSpinnerColor(variant, spinnerColor)

  const buttonClasses = getButtonClasses({
    variant,
    size,
    fullWidth,
    disabled,
    loading,
    className,
  })

  const textClasses = getButtonTextClasses({
    variant,
    size,
    textClassName,
  })

  const iconSpacingClass = size === 'sm' ? 'mr-1.5' : 'mr-2'
  const rightIconSpacingClass = size === 'sm' ? 'ml-1.5' : 'ml-2'

  return (
    <Animated.View
      style={[
        fullWidth ? { width: '100%' } : undefined,
        { transform: [{ scale: scaleAnim }] },
      ]}
    >
      <Pressable
        className={buttonClasses}
        disabled={!isInteractive}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityState={{
          disabled: !isInteractive,
          busy: loading,
        }}
        accessibilityRole="button"
        style={style}
        {...props}
      >
        {/* Left slot: Morph between Left Icon and Loader */}
        {loading ? (
          <Animated.View
            className={`items-center justify-center ${iconSpacingClass}`}
            style={{
              opacity: loadingAnim,
              transform: [
                {
                  scale: loadingAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.4, 1],
                  }),
                },
              ],
            }}
          >
            <ActivityIndicator
              size={spinnerSizes[size]}
              color={resolvedSpinnerColor}
            />
          </Animated.View>
        ) : leftIcon ? (
          <Animated.View
            className={`items-center justify-center ${iconSpacingClass}`}
            style={{
              opacity: loadingAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 0],
              }),
            }}
          >
            {leftIcon}
          </Animated.View>
        ) : null}

        {/* Text slot: morph between children and loadingText if provided */}
        {loading && loadingText ? (
          <Animated.View
            style={{
              opacity: loadingAnim,
            }}
          >
            <Text className={textClasses} style={textStyle}>
              {loadingText}
            </Text>
          </Animated.View>
        ) : (
          <Text className={textClasses} style={textStyle}>
            {children}
          </Text>
        )}

        {/* Right Icon slot */}
        {rightIcon ? (
          <Animated.View
            className={`items-center justify-center ${rightIconSpacingClass}`}
            style={{
              opacity: loadingAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 0.3],
              }),
            }}
          >
            {rightIcon}
          </Animated.View>
        ) : null}
      </Pressable>
    </Animated.View>
  )
}