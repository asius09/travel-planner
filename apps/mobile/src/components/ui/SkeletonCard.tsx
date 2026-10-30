'use client'

import React, { useEffect, useRef } from 'react'
import { View, Animated, StyleProp, ViewStyle } from 'react-native'

export function SkeletonCard({ style, className = '' }: { style?: StyleProp<ViewStyle>; className?: string } = {}) {
  const opacity = useRef(new Animated.Value(0.4)).current

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ]),
    )
    loop.start()
    return () => loop.stop()
  }, [opacity])

  return (
    <View className={`bg-surface rounded-[20px] border border-border overflow-hidden ${className}`} style={style}>
      <Animated.View className="h-[180px] w-full bg-border" style={{ opacity }} />
      <View className="p-3.5 gap-2.5">
        <Animated.View className="h-4 rounded-lg bg-border w-3/5" style={{ opacity }} />
        <Animated.View className="h-4 rounded-lg bg-border w-2/5" style={{ opacity }} />
        <View className="flex-row gap-4 mt-1">
          <Animated.View className="h-3.5 w-20 rounded-[7px] bg-border" style={{ opacity }} />
          <Animated.View className="h-3.5 w-20 rounded-[7px] bg-border" style={{ opacity }} />
        </View>
      </View>
    </View>
  )
}
