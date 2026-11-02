'use client'

import React, { forwardRef, useEffect, useRef, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  Animated,
  Platform,
  LayoutAnimation,
  UIManager,
  type TextInputProps,
  type ViewStyle,
  type TextStyle,
  type StyleProp,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { semanticColors } from '@/theme/colors'

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true)
}

export interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string
  error?: string
  helperText?: string
  rounded?: boolean
  transparent?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  containerClassName?: string
  labelClassName?: string
  inputClassName?: string
  errorClassName?: string
  containerStyle?: StyleProp<ViewStyle>
  labelStyle?: StyleProp<TextStyle>
  inputStyle?: StyleProp<TextStyle>
  errorStyle?: StyleProp<TextStyle>
  className?: string
  style?: StyleProp<ViewStyle>
  required?: boolean
  disabled?: boolean
}

export function getBaseInputClasses({
  hasError,
  isFocused,
  transparent,
  rounded,
  disabled,
}: {
  hasError?: boolean
  isFocused?: boolean
  transparent?: boolean
  rounded?: boolean
  disabled?: boolean
}) {
  return [
    'h-[50px] min-h-[50px] flex-row items-center border transition-colors',
    rounded ? 'rounded-full' : 'rounded-[14px]',
    transparent ? 'bg-transparent' : hasError ? 'bg-destructive/10' : 'bg-surface',
    hasError
      ? 'border-destructive'
      : isFocused
        ? 'border-ring'
        : 'border-border',
    disabled ? 'opacity-60' : '',
  ]
    .filter(Boolean)
    .join(' ')
}

export const Input = forwardRef<React.ElementRef<typeof TextInput>, InputProps>(
  function Input(
    {
      label,
      error,
      helperText,
      rounded = false,
      transparent = false,
      leftIcon,
      rightIcon,
      containerClassName,
      labelClassName,
      inputClassName,
      errorClassName,
      containerStyle,
      labelStyle,
      inputStyle,
      errorStyle,
      className,
      style,
      testID,
      required = false,
      disabled = false,
      editable = true,
      onFocus,
      onBlur,
      placeholderTextColor = semanticColors.mutedForeground,
      ...props
    },
    ref
  ) {
    const hasError = !!error
    const isNotEditable = !editable || disabled
    const [isFocused, setIsFocused] = useState(false)
    const [shakeAnim] = useState(() => new Animated.Value(0))
    const [errorOpacity] = useState(() => new Animated.Value(hasError ? 1 : 0))
    const prevErrorRef = useRef(hasError)

    useEffect(() => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)

      if (hasError) {
        if (!prevErrorRef.current) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {})
        }
        Animated.parallel([
          Animated.sequence([
            Animated.timing(shakeAnim, { toValue: 6, duration: 40, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -6, duration: 40, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 6, duration: 40, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 0, duration: 40, useNativeDriver: true }),
          ]),
          Animated.timing(errorOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        ]).start()
      } else {
        Animated.timing(errorOpacity, { toValue: 0, duration: 200, useNativeDriver: true }).start()
      }
      prevErrorRef.current = hasError
    }, [hasError, shakeAnim, errorOpacity])

    const handleFocus: NonNullable<InputProps['onFocus']> = (e) => {
      setIsFocused(true)
      onFocus?.(e)
    }

    const handleBlur: NonNullable<InputProps['onBlur']> = (e) => {
      setIsFocused(false)
      onBlur?.(e)
    }

    const mergedContainerClass = [
      'w-full',
      containerClassName || className || '',
    ]
      .filter(Boolean)
      .join(' ')

    const mergedContainerStyle = [containerStyle, style]

    return (
      <Animated.View
        className={mergedContainerClass}
        style={[mergedContainerStyle, { transform: [{ translateX: shakeAnim }] }]}
      >
        {label ? (
          <Text
            className={`font-medium text-sm text-foreground mb-1.5 ${labelClassName || ''}`}
            style={labelStyle}
          >
            {label}
            {required ? <Text className="text-destructive"> *</Text> : null}
          </Text>
        ) : null}

        <View
          className={getBaseInputClasses({
            hasError,
            isFocused,
            transparent,
            rounded,
            disabled: isNotEditable,
          })}
        >
          {leftIcon ? (
            <View
              pointerEvents="none"
              className="absolute left-3.5 z-10 h-full items-center justify-center"
            >
              {leftIcon}
            </View>
          ) : null}

          <TextInput
            ref={ref}
            placeholderTextColor={placeholderTextColor}
            selectionColor={semanticColors.ring}
            cursorColor={semanticColors.ring}
            className={[
              'flex-1 h-full font-sans text-[15px] text-foreground',
              leftIcon ? 'pl-11' : 'pl-4',
              rightIcon ? 'pr-11' : 'pr-4',
              inputClassName,
            ]
              .filter(Boolean)
              .join(' ')}
            style={[
              {
                height: '100%',
                paddingTop: 0,
                paddingBottom: Platform.select({ ios: 3, default: 0 }),
                textAlignVertical: 'center',
                includeFontPadding: false,
              },
              inputStyle,
            ]}
            editable={!isNotEditable}
            onFocus={handleFocus}
            onBlur={handleBlur}
            testID={testID}
            {...props}
          />

          {rightIcon ? (
            <View className="absolute right-3.5 z-10 h-full items-center justify-center">
              {rightIcon}
            </View>
          ) : null}
        </View>

        {(error || helperText) ? (
          <Animated.View style={{ opacity: hasError ? errorOpacity : 1 }}>
            <View className="flex-row items-center gap-1.5 mt-1.5 ml-0.5">
              {hasError ? (
                <Ionicons name="alert-circle" size={14} color={semanticColors.destructive} />
              ) : null}
              <Text
                className={`font-sans text-[13px] leading-[18px] ${
                  hasError ? 'font-medium text-destructive' : 'font-normal text-muted-foreground'
                } ${errorClassName || ''}`}
                style={errorStyle}
              >
                {error || helperText}
              </Text>
            </View>
          </Animated.View>
        ) : null}
      </Animated.View>
    )
  }
)

Input.displayName = 'Input'