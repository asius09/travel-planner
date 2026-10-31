'use client'

import React, { useEffect, useState } from 'react'
import { View, Animated, StyleProp, ViewStyle } from 'react-native'
import { semanticColors } from '@/theme/colors'

interface ProgressIndicatorProps {
  currentStep: number
  totalSteps: number
  style?: StyleProp<ViewStyle>
  className?: string
}

function StepIndicatorItem({
  isActive,
  isCompleted,
}: {
  isActive: boolean
  isCompleted: boolean
}) {
  const [widthAnim] = useState(() => new Animated.Value(isActive ? 28 : 8))

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: isActive ? 28 : 8,
      duration: 220,
      useNativeDriver: false,
    }).start()
  }, [isActive, widthAnim])

  const backgroundColor = isActive
    ? semanticColors.primary
    : isCompleted
      ? semanticColors.primary
      : semanticColors.border

  return (
    <Animated.View
      style={{
        width: widthAnim,
        height: 4,
        borderRadius: 2,
        backgroundColor,
      }}
    />
  )
}

export function ProgressIndicator({
  currentStep,
  totalSteps,
  style,
  className = '',
}: ProgressIndicatorProps) {
  return (
    <View
      className={`flex-row items-center gap-1.5 ${className}`}
      style={style}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 1, max: totalSteps, now: currentStep }}
    >
      {Array.from({ length: totalSteps }, (_, i) => {
        const stepNumber = i + 1
        const isActive = stepNumber === currentStep
        const isCompleted = stepNumber < currentStep

        return (
          <StepIndicatorItem
            key={i}
            isActive={isActive}
            isCompleted={isCompleted}
          />
        )
      })}
    </View>
  )
}