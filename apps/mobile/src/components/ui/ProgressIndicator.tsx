'use client'

import React from 'react'
import { View, StyleProp, ViewStyle } from 'react-native'

interface ProgressIndicatorProps {
  currentStep: number
  totalSteps: number
  style?: StyleProp<ViewStyle>
  className?: string
}

export function ProgressIndicator({ currentStep, totalSteps, style, className = '' }: ProgressIndicatorProps) {
  return (
    <View className={`flex-row items-center gap-1 ${className}`} style={style}>
      {Array.from({ length: totalSteps }, (_, i) => {
        const stepNumber = i + 1
        const isActive = stepNumber === currentStep
        const isCompleted = stepNumber < currentStep
        
        return (
          <View key={i} className="flex-1 flex-row items-center">
            <View
              className={`w-2.5 h-2.5 rounded-full ${
                isCompleted || isActive ? 'bg-primary' : 'bg-border'
              }`}
            />
            {i < totalSteps - 1 ? (
              <View
                className={`flex-1 h-0.5 ${
                  isCompleted ? 'bg-primary' : 'bg-border'
                }`}
              />
            ) : null}
          </View>
        )
      })}
    </View>
  )
}
