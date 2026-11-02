'use client'

import React, { useEffect } from 'react'
import { Pressable, StyleSheet } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated'

export interface SmoothDotProps {
  isActive: boolean
  activeColor?: string
  inactiveColor?: string
  activeWidth?: number
  inactiveWidth?: number
  height?: number
  onPress?: () => void
  label?: string
}

export function SmoothDot({
  isActive,
  activeColor = '#FFFFFF',
  inactiveColor = 'rgba(255, 255, 255, 0.35)',
  activeWidth = 26,
  inactiveWidth = 6,
  height = 6,
  onPress,
  label,
}: SmoothDotProps) {
  const widthVal = useSharedValue(isActive ? activeWidth : inactiveWidth)
  const opacityVal = useSharedValue(isActive ? 1 : 0.6)

  useEffect(() => {
    widthVal.value = withSpring(isActive ? activeWidth : inactiveWidth, {
      damping: 18,
      stiffness: 140,
      mass: 0.6,
    })
    opacityVal.value = withTiming(isActive ? 1 : 0.6, { duration: 250 })
  }, [isActive, activeWidth, inactiveWidth, widthVal, opacityVal])

  const animatedStyle = useAnimatedStyle(() => ({
    width: widthVal.value,
    opacity: opacityVal.value,
    backgroundColor: isActive ? activeColor : inactiveColor,
  }))

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
      style={styles.pressable}
    >
      <Animated.View
        style={[
          {
            height,
            borderRadius: height / 2,
          },
          animatedStyle,
        ]}
      />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  pressable: {
    paddingVertical: 4,
    paddingHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
