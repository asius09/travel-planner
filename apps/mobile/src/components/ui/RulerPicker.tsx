'use client'

import React, { useRef, useState, useEffect } from 'react'
import {
  View,
  ScrollView,
  Pressable,
  NativeSyntheticEvent,
  NativeScrollEvent,
  LayoutChangeEvent,
  type ViewStyle,
  type StyleProp,
} from 'react-native'
import * as Haptics from 'expo-haptics'
import { LinearGradient } from 'expo-linear-gradient'
import { semanticColors } from '@/theme/colors'

export interface RulerPickerProps {
  /** Minimum selectable numeric value (default 1) */
  min?: number
  /** Maximum selectable numeric value (default 90) */
  max?: number
  /** Increment step between ticks (default 1) */
  step?: number
  /** Current active value */
  value: number
  /** Callback fired whenever active tick value changes */
  onValueChange: (value: number) => void
  /** Horizontal width between ticks in points (default 18) */
  tickSpacing?: number
  /** Color of the active center needle indicator (default #263F35 / primary) */
  indicatorColor?: string
  /** Background color for edge fade gradient (default #F8F6EF / canvas) */
  fadeColor?: string
  /** Whether the picker is disabled / muted */
  disabled?: boolean
  className?: string
  style?: StyleProp<ViewStyle>
}

/**
 * Clean height scale based on distance from center.
 * Middle bar is big; adjacent bars scale down symmetrically.
 */
function getBarHeight(distance: number): number {
  if (distance === 0) return 36
  if (distance === 1) return 24
  if (distance === 2) return 18
  if (distance === 3) return 13
  if (distance === 4) return 9
  return 7
}

/**
 * Tonal color scale based on distance from center needle.
 */
function getBarColor(distance: number, indicatorColor: string): string {
  if (distance === 0) return indicatorColor
  if (distance === 1) return 'rgba(37, 43, 45, 0.55)'
  if (distance === 2) return 'rgba(37, 43, 45, 0.40)'
  if (distance === 3) return 'rgba(37, 43, 45, 0.28)'
  if (distance === 4) return 'rgba(37, 43, 45, 0.18)'
  return 'rgba(37, 43, 45, 0.12)'
}

export function RulerPicker({
  min = 1,
  max = 90,
  step = 1,
  value,
  onValueChange,
  tickSpacing = 18,
  indicatorColor = semanticColors.primary,
  fadeColor = semanticColors.background,
  disabled = false,
  className = '',
  style,
}: RulerPickerProps) {
  const [containerWidth, setContainerWidth] = useState(320)
  const scrollRef = useRef<React.ElementRef<typeof ScrollView>>(null)
  const isScrolling = useRef(false)
  const currentOffset = useRef(0)
  const lastHapticValue = useRef(value)
  const lastHapticTime = useRef(0)

  // Generate ticks array
  const ticks = React.useMemo(() => {
    const list: number[] = []
    for (let i = min; i <= max; i += step) {
      list.push(i)
    }
    return list
  }, [min, max, step])

  const spacerWidth = Math.max(0, (containerWidth - tickSpacing) / 2)

  // Sync scroll position when container width is measured or value changes externally
  useEffect(() => {
    if (containerWidth > 0 && !isScrolling.current) {
      const index = Math.max(0, Math.min(ticks.length - 1, Math.round((value - min) / step)))
      const targetOffset = index * tickSpacing
      if (Math.abs(currentOffset.current - targetOffset) > tickSpacing / 2) {
        currentOffset.current = targetOffset
        scrollRef.current?.scrollTo({ x: targetOffset, animated: false })
      }
    }
  }, [containerWidth, value, min, step, tickSpacing, ticks.length])

  // Optimized continuous scroll handler: fires value changes only across integer tick boundaries
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x
    currentOffset.current = offsetX
    const rawIndex = Math.round(offsetX / tickSpacing)
    const clampedIndex = Math.max(0, Math.min(ticks.length - 1, rawIndex))
    const selectedVal = ticks[clampedIndex]

    if (selectedVal !== undefined && selectedVal !== lastHapticValue.current) {
      lastHapticValue.current = selectedVal
      onValueChange(selectedVal)

      // Throttle haptics so high-velocity flings never choke device queue
      const now = Date.now()
      if (now - lastHapticTime.current > 35) {
        lastHapticTime.current = now
        Haptics.selectionAsync().catch(() => {})
      }
    }
  }

  // Handle release of drag
  const handleScrollEndDrag = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const velocityX = Math.abs(event.nativeEvent.velocity?.x ?? 0)
    // If releasing with near-zero velocity, settle immediately
    if (velocityX < 0.1) {
      isScrolling.current = false
      const offsetX = event.nativeEvent.contentOffset.x
      const nearestIndex = Math.max(0, Math.min(ticks.length - 1, Math.round(offsetX / tickSpacing)))
      const targetOffset = nearestIndex * tickSpacing
      currentOffset.current = targetOffset
      scrollRef.current?.scrollTo({ x: targetOffset, animated: true })
    }
    // Otherwise let native momentum run freely; onMomentumScrollEnd will settle
  }

  // Smooth settlement on momentum end
  const handleMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    isScrolling.current = false
    const offsetX = event.nativeEvent.contentOffset.x
    const nearestIndex = Math.max(0, Math.min(ticks.length - 1, Math.round(offsetX / tickSpacing)))
    const targetOffset = nearestIndex * tickSpacing
    currentOffset.current = targetOffset
    scrollRef.current?.scrollTo({ x: targetOffset, animated: true })
  }

  const scrollToValue = (val: number) => {
    const clamped = Math.max(min, Math.min(max, val))
    const index = Math.round((clamped - min) / step)
    lastHapticValue.current = clamped
    const targetOffset = index * tickSpacing
    currentOffset.current = targetOffset
    scrollRef.current?.scrollTo({ x: targetOffset, animated: true })
    Haptics.selectionAsync().catch(() => {})
    onValueChange(clamped)
  }

  return (
    <View
      className={`w-full justify-center items-center relative overflow-hidden ${
        disabled ? 'opacity-30' : 'opacity-100'
      } ${className}`}
      style={[{ height: 48 }, style]}
      onLayout={(e: LayoutChangeEvent) => {
        const w = e.nativeEvent.layout.width
        if (w > 0 && Math.abs(w - containerWidth) > 2) {
          setContainerWidth(w)
        }
      }}
    >
      {/* Left Edge Dissolve Gradient */}
      <LinearGradient
        colors={[fadeColor, `${fadeColor}00`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 56,
          zIndex: 15,
        }}
        pointerEvents="none"
      />

      {/* Right Edge Dissolve Gradient */}
      <LinearGradient
        colors={[`${fadeColor}00`, fadeColor]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: 56,
          zIndex: 15,
        }}
        pointerEvents="none"
      />

      {/* Center Primary Indicator Needle (Tallest, bottom-aligned) */}
      <View
        pointerEvents="none"
        className="absolute z-20 items-center justify-end pointer-events-none"
        style={{
          left: 0,
          right: 0,
          bottom: 2,
          height: 44,
        }}
      >
        <View
          style={{ backgroundColor: indicatorColor }}
          className="w-[3px] h-[36px] rounded-full"
        />
      </View>

      {/* Horizontal Continuous Kinetic ScrollView */}
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate={0.992}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        scrollEnabled={true}
        onScrollBeginDrag={() => {
          isScrolling.current = true
        }}
        onScrollEndDrag={handleScrollEndDrag}
        onMomentumScrollBegin={() => {
          isScrolling.current = true
        }}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        contentContainerStyle={{
          paddingHorizontal: spacerWidth,
          alignItems: 'flex-end',
        }}
      >
        {ticks.map((val) => {
          const isSelected = !disabled && value === val
          const distance = Math.abs(val - value)
          const barHeight = getBarHeight(distance)
          const barColor = getBarColor(distance, indicatorColor)

          return (
            <Pressable
              key={val}
              disabled={disabled}
              onPress={() => scrollToValue(val)}
              accessibilityRole="button"
              accessibilityLabel={`${val}`}
              accessibilityState={{ selected: isSelected }}
              style={{ width: tickSpacing, height: 44 }}
              className="items-center justify-end pb-[2px]"
            >
              <View
                style={{
                  height: barHeight,
                  backgroundColor: barColor,
                }}
                className="w-[2px] rounded-full"
              />
            </Pressable>
          )
        })}
      </ScrollView>
    </View>
  )
}
