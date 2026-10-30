'use client'

import React, { useEffect, useRef, useState } from 'react'
import {
  View,
  Text,
  Animated,
  StyleProp,
  TextStyle,
  ViewStyle,
  TextProps,
} from 'react-native'

export interface TextMorphProps extends Omit<TextProps, 'children'> {
  children?: string | number
  duration?: number
  mode?: 'smooth' | 'word' | 'char'
  containerStyle?: StyleProp<ViewStyle>
  style?: StyleProp<TextStyle>
  className?: string
}

/**
 * TextMorph / Torph for React Native:
 * Smooth, layout-stable text morphing with zero initial-render flicker.
 * Outgoing and incoming text layers cross-dissolve with subtle spring translation.
 */
export function TextMorph({
  children,
  duration = 240,
  mode = 'smooth',
  containerStyle,
  style,
  className = '',
  ...textProps
}: TextMorphProps) {
  const textString = String(children ?? '')
  const [displayText, setDisplayText] = useState(textString)
  const [outgoingText, setOutgoingText] = useState<string | null>(null)

  const incomingAnim = useRef(new Animated.Value(1)).current
  const outgoingAnim = useRef(new Animated.Value(0)).current

  const isMounted = useRef(false)

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true
      return
    }

    if (textString !== displayText) {
      setOutgoingText(displayText)
      setDisplayText(textString)

      incomingAnim.setValue(0)
      outgoingAnim.setValue(1)

      Animated.parallel([
        Animated.spring(incomingAnim, {
          toValue: 1,
          tension: 100,
          friction: 12,
          useNativeDriver: true,
        }),
        Animated.timing(outgoingAnim, {
          toValue: 0,
          duration: Math.round(duration * 0.7),
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) {
          setOutgoingText(null)
        }
      })
    }
  }, [textString, displayText, duration, incomingAnim, outgoingAnim])

  const incomingTranslateY = incomingAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [4, 0],
  })

  const incomingScale = incomingAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.985, 1],
  })

  const outgoingTranslateY = outgoingAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-4, 0],
  })

  const outgoingScale = outgoingAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.985, 1],
  })

  return (
    <View style={[{ position: 'relative' }, containerStyle]}>
      {/* Current / Incoming Text Layer */}
      <Animated.View
        style={{
          opacity: incomingAnim,
          transform: [
            { translateY: incomingTranslateY },
            { scale: incomingScale },
          ],
        }}
      >
        <Text
          style={style}
          className={className}
          accessibilityLiveRegion="polite"
          {...textProps}
        >
          {displayText}
        </Text>
      </Animated.View>

      {/* Outgoing Text Layer (cross-dissolves away smoothly) */}
      {outgoingText !== null && (
        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            opacity: outgoingAnim,
            transform: [
              { translateY: outgoingTranslateY },
              { scale: outgoingScale },
            ],
          }}
          pointerEvents="none"
        >
          <Text
            style={style}
            className={className}
            aria-hidden={true}
            accessibilityElementsHidden={true}
            {...textProps}
          >
            {outgoingText}
          </Text>
        </Animated.View>
      )}
    </View>
  )
}

/**
 * Torph alias for TextMorph.
 */
export const Torph = TextMorph
