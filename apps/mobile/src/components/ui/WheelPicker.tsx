'use client'

import React, { useRef, useState, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent,
  LayoutChangeEvent,
  type ViewStyle,
  type StyleProp,
} from 'react-native'
import * as Haptics from 'expo-haptics'
import { LinearGradient } from 'expo-linear-gradient'
import { semanticColors } from '@/theme/colors'

export interface WheelItem<T = unknown> {
  value: T
  label: string
  subtitle?: string
  symbol?: string
  accentColor?: string
}

export interface WheelPickerProps<T = unknown> {
  items: WheelItem<T>[]
  selectedValue: T
  onValueChange: (value: T, index: number) => void
  itemWidth?: number
  itemHeight?: number
  fadeColor?: string
  disabled?: boolean
  className?: string
  style?: StyleProp<ViewStyle>
  orientation?: 'horizontal' | 'vertical'
  variant?: 'cards' | 'labels-only'
}

// Minimum gap between selection-change haptic pulses, in milliseconds.
const HAPTIC_MIN_INTERVAL_MS = 35

/**
 * Returns the wall-clock time at which a haptic pulse should fire, or -1 when
 * the last pulse is still within the throttle window. Kept out of the component
 * so the timestamp is read only from the scroll listener, never during render.
 */
function nextHapticPulseAt(lastPulseAt: number): number {
  const now = Date.now()
  return now - lastPulseAt > HAPTIC_MIN_INTERVAL_MS ? now : -1
}

export function WheelPicker<T = unknown>({
  items,
  selectedValue,
  onValueChange,
  itemWidth = 92,
  itemHeight,
  fadeColor = semanticColors.background,
  disabled = false,
  className = '',
  style,
  orientation = 'horizontal',
  variant = 'cards',
}: WheelPickerProps<T>) {
  const isVertical = orientation === 'vertical'
  const isLabelsOnly = variant === 'labels-only'
  const actualItemHeight = itemHeight ?? (isVertical ? 52 : 76)
  const containerHeight = isVertical ? actualItemHeight * 3 : actualItemHeight + 12

  const [containerDim, setContainerDim] = useState(isVertical ? containerHeight : 320)
  const scrollRef = useRef<React.ElementRef<typeof ScrollView>>(null)
  const isDragging = useRef(false)
  const isMomentum = useRef(false)
  const currentOffset = useRef(0)
  const lastSelectedIndex = useRef(-1)
  const lastHapticTime = useRef(0)
  const hasMounted = useRef(false)

  const stepSize = isVertical ? actualItemHeight : itemWidth
  const spacerSize = Math.max(0, (containerDim - stepSize) / 2)

  // Animated scroll position for smooth 3D cylindrical perspective (120Hz native driver)
  const [scrollPos] = useState(() => new Animated.Value(0))

  // Find index of currently selected item
  const selectedIndex = Math.max(
    0,
    items.findIndex((it) => it.value === selectedValue)
  )

  const scrollToOffset = (offset: number, animated = true) => {
    const node = scrollRef.current
    if (!node) return
    if (isVertical) {
      node.scrollTo({ y: offset, animated })
    } else {
      node.scrollTo({ x: offset, animated })
    }
  }

  // Initial positioning and external value synchronization
  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true
      lastSelectedIndex.current = selectedIndex
      const targetOffset = selectedIndex * stepSize
      currentOffset.current = targetOffset
      setTimeout(() => {
        scrollToOffset(targetOffset, false)
        scrollPos.setValue(targetOffset)
      }, 20)
      return
    }

    if (containerDim > 0 && !isDragging.current && !isMomentum.current) {
      const targetOffset = selectedIndex * stepSize
      if (Math.abs(currentOffset.current - targetOffset) > 1) {
        currentOffset.current = targetOffset
        lastSelectedIndex.current = selectedIndex
        scrollToOffset(targetOffset, true)
      }
    }
  }, [containerDim, selectedIndex, stepSize, isVertical])

  // Continuous scroll handler: detects centered item index and triggers haptics
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offset = isVertical
      ? event.nativeEvent.contentOffset.y
      : event.nativeEvent.contentOffset.x
    currentOffset.current = offset
    const rawIndex = Math.round(offset / stepSize)
    const clampedIndex = Math.max(0, Math.min(items.length - 1, rawIndex))

    if (clampedIndex !== lastSelectedIndex.current) {
      lastSelectedIndex.current = clampedIndex
      const activeItem = items[clampedIndex]
      if (activeItem) {
        onValueChange(activeItem.value, clampedIndex)

        // Tactile haptics on selection change
        const pulseAt = nextHapticPulseAt(lastHapticTime.current)
        if (pulseAt !== -1) {
          lastHapticTime.current = pulseAt
          Haptics.selectionAsync().catch(() => {})
        }
      }
    }
  }

  // Snap smoothly on finger release
  const handleScrollEndDrag = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const vel = isVertical
      ? Math.abs(event.nativeEvent.velocity?.y ?? 0)
      : Math.abs(event.nativeEvent.velocity?.x ?? 0)
    isDragging.current = false
    if (vel < 0.08) {
      const offset = isVertical
        ? event.nativeEvent.contentOffset.y
        : event.nativeEvent.contentOffset.x
      const nearestIndex = Math.max(0, Math.min(items.length - 1, Math.round(offset / stepSize)))
      const targetOffset = nearestIndex * stepSize
      currentOffset.current = targetOffset
      scrollToOffset(targetOffset, true)
    }
  }

  // Settle smoothly when momentum ends
  const handleMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    isDragging.current = false
    isMomentum.current = false
    const offset = isVertical
      ? event.nativeEvent.contentOffset.y
      : event.nativeEvent.contentOffset.x
    const maxOffset = (items.length - 1) * stepSize
    const nearestIndex = Math.max(0, Math.min(items.length - 1, Math.round(offset / stepSize)))
    const targetOffset = nearestIndex * stepSize
    currentOffset.current = targetOffset

    // If offset ended slightly off target or at bounce boundary, cleanly align it
    if (Math.abs(offset - targetOffset) > 1 || offset < 0 || offset > maxOffset) {
      scrollToOffset(targetOffset, true)
    }

    if (nearestIndex !== lastSelectedIndex.current) {
      lastSelectedIndex.current = nearestIndex
      const activeItem = items[nearestIndex]
      if (activeItem) {
        onValueChange(activeItem.value, nearestIndex)
        Haptics.selectionAsync().catch(() => {})
      }
    }
  }

  // Tap an item to smoothly scroll it into focus
  const handleItemPress = (index: number) => {
    if (disabled) return
    isDragging.current = false
    isMomentum.current = false
    lastSelectedIndex.current = index
    const targetOffset = index * stepSize
    currentOffset.current = targetOffset
    scrollToOffset(targetOffset, true)
    Haptics.selectionAsync().catch(() => {})
    const activeItem = items[index]
    if (activeItem) {
      onValueChange(activeItem.value, index)
    }
  }

  // Native animated scroll event.
  // `handleScroll` only reads/writes the scroll refs from the scroll listener
  // callback (never during render), so the linter's "passing a ref to a
  // function" warning is a false positive for Animated.event listeners.
  const onAnimatedScroll = Animated.event(
    [
      {
        nativeEvent: {
          contentOffset: isVertical ? { y: scrollPos } : { x: scrollPos },
        },
      },
    ],
    // eslint-disable-next-line react-hooks/refs
    {
      useNativeDriver: true,
      listener: handleScroll,
    }
  )

  const fadeHeight = Math.min(spacerSize, 26)

  return (
    <View
      className={`w-full justify-center items-center relative overflow-hidden ${
        disabled ? 'opacity-40' : 'opacity-100'
      } ${className}`}
      style={[{ height: containerHeight, width: '100%' }, style]}
      onLayout={(e: LayoutChangeEvent) => {
        const dim = isVertical ? e.nativeEvent.layout.height : e.nativeEvent.layout.width
        if (dim > 0 && Math.abs(dim - containerDim) > 2) {
          setContainerDim(dim)
        }
      }}
    >
      {/* Top / Left Fade Gradient */}
      <LinearGradient
        colors={[fadeColor, `${fadeColor}00`]}
        start={isVertical ? { x: 0, y: 0 } : { x: 0, y: 0 }}
        end={isVertical ? { x: 0, y: 1 } : { x: 1, y: 0 }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: isVertical ? fadeHeight : '100%',
          width: isVertical ? '100%' : 44,
          zIndex: 15,
        }}
        pointerEvents="none"
      />

      {/* Bottom / Right Fade Gradient */}
      <LinearGradient
        colors={[`${fadeColor}00`, fadeColor]}
        start={isVertical ? { x: 0, y: 0 } : { x: 0, y: 0 }}
        end={isVertical ? { x: 0, y: 1 } : { x: 1, y: 0 }}
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          left: 0,
          height: isVertical ? fadeHeight : '100%',
          width: isVertical ? '100%' : 44,
          zIndex: 15,
        }}
        pointerEvents="none"
      />

      {/* Full-Width Snap ScrollView with Native Driver Interpolation */}
      <Animated.ScrollView
        ref={scrollRef}
        style={{ width: '100%' }}
        horizontal={!isVertical}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={stepSize}
        snapToOffsets={items.map((_, i) => i * stepSize)}
        snapToAlignment="start"
        bounces={false}
        overScrollMode="never"
        onScroll={onAnimatedScroll}
        scrollEventThrottle={16}
        scrollEnabled={!disabled}
        onScrollBeginDrag={() => {
          isDragging.current = true
        }}
        onScrollEndDrag={handleScrollEndDrag}
        onMomentumScrollBegin={() => {
          isDragging.current = true
          isMomentum.current = true
        }}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        contentContainerStyle={
          isVertical
            ? {
                paddingVertical: spacerSize,
                alignItems: 'center',
                width: '100%',
              }
            : {
                paddingHorizontal: spacerSize,
                alignItems: 'center',
              }
        }
      >
        {items.map((item, idx) => {
          const isSelected = selectedIndex === idx

          if (isVertical && isLabelsOnly) {
            // Fluid 3D Cylindrical Perspective: continuous transforms with no step transitions
            const itemCenter = idx * actualItemHeight

            const rotateX = scrollPos.interpolate({
              inputRange: [
                itemCenter - 2 * actualItemHeight,
                itemCenter - actualItemHeight,
                itemCenter,
                itemCenter + actualItemHeight,
                itemCenter + 2 * actualItemHeight,
              ],
              outputRange: ['28deg', '14deg', '0deg', '-14deg', '-28deg'],
              extrapolate: 'clamp',
            })

            const scale = scrollPos.interpolate({
              inputRange: [
                itemCenter - 2 * actualItemHeight,
                itemCenter - actualItemHeight,
                itemCenter,
                itemCenter + actualItemHeight,
                itemCenter + 2 * actualItemHeight,
              ],
              outputRange: [0.86, 0.94, 1.06, 0.94, 0.86],
              extrapolate: 'clamp',
            })

            const opacity = scrollPos.interpolate({
              inputRange: [
                itemCenter - 2 * actualItemHeight,
                itemCenter - actualItemHeight,
                itemCenter,
                itemCenter + actualItemHeight,
                itemCenter + 2 * actualItemHeight,
              ],
              outputRange: [0.30, 0.65, 1.0, 0.65, 0.30],
              extrapolate: 'clamp',
            })

            const translateY = scrollPos.interpolate({
              inputRange: [
                itemCenter - 2 * actualItemHeight,
                itemCenter - actualItemHeight,
                itemCenter,
                itemCenter + actualItemHeight,
                itemCenter + 2 * actualItemHeight,
              ],
              outputRange: [4, 2, 0, -2, -4],
              extrapolate: 'clamp',
            })

            return (
              <Animated.View
                key={String(item.value)}
                style={{
                  height: actualItemHeight,
                  width: '100%',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity,
                  transform: [
                    { perspective: 800 },
                    { rotateX },
                    { scale },
                    { translateY },
                  ],
                }}
              >
                <Pressable
                  disabled={disabled}
                  onPress={() => handleItemPress(idx)}
                  accessibilityRole="button"
                  accessibilityLabel={item.label}
                  accessibilityState={{ selected: isSelected }}
                  style={{
                    width: '100%',
                    height: '100%',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text
                    numberOfLines={1}
                    style={{
                      fontFamily: 'Geist_Medium',
                      fontWeight: '500',
                      fontSize: 20,
                      color: semanticColors.foreground,
                      textAlign: 'center',
                      letterSpacing: -0.2,
                    }}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              </Animated.View>
            )
          }

          // Card variant (default horizontal)
          return (
            <Pressable
              key={String(item.value)}
              disabled={disabled}
              onPress={() => handleItemPress(idx)}
              accessibilityRole="button"
              accessibilityLabel={`${item.label} ${item.symbol ?? ''}`}
              accessibilityState={{ selected: isSelected }}
              style={{
                width: itemWidth,
                height: actualItemHeight,
                paddingHorizontal: 4,
                alignItems: 'center',
                justifyContent: 'center',
                transform: [{ scale: isSelected ? 1.05 : 0.90 }],
                opacity: isSelected ? 1 : 0.50,
              }}
            >
              <View
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: 20,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isSelected ? semanticColors.primary : semanticColors.surface,
                  borderWidth: isSelected ? 2 : 1.5,
                  borderColor: isSelected ? semanticColors.primary : semanticColors.border,
                  paddingVertical: 6,
                }}
              >
                {/* Value Symbol */}
                {item.symbol ? (
                  <Text
                    style={{
                      fontFamily: 'Geist',
                      fontWeight: '600',
                      fontSize: 22,
                      color: isSelected ? semanticColors.accent : semanticColors.primary,
                      lineHeight: 26,
                    }}
                  >
                    {item.symbol}
                  </Text>
                ) : null}

                {/* Clean Value Label */}
                <Text
                  numberOfLines={1}
                  style={{
                    fontFamily: 'Geist',
                    fontWeight: isSelected ? '600' : '500',
                    fontSize: 12,
                    color: isSelected ? semanticColors.primaryForeground : semanticColors.mutedForeground,
                    marginTop: 2,
                  }}
                >
                  {item.label}
                </Text>
              </View>
            </Pressable>
          )
        })}
      </Animated.ScrollView>
    </View>
  )
}
