'use client'

import React, { useEffect, useRef, useState } from 'react'
import { View, Animated, StyleProp, ViewStyle } from 'react-native'

export function SkeletonCard({ style, className = '' }: { style?: StyleProp<ViewStyle>; className?: string } = {}) {
  const [opacity] = useState(() => new Animated.Value(0.4))

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
    <View className={`bg-card rounded-[20px] border border-border overflow-hidden ${className}`} style={style}>
      <Animated.View className="h-[180px] w-full bg-skeleton" style={{ opacity }} />
      <View className="p-3.5 gap-2.5">
        <Animated.View className="h-4 rounded-lg bg-skeleton w-3/5" style={{ opacity }} />
        <Animated.View className="h-4 rounded-lg bg-skeleton w-2/5" style={{ opacity }} />
        <View className="flex-row gap-4 mt-1">
          <Animated.View className="h-3.5 w-20 rounded-[7px] bg-skeleton" style={{ opacity }} />
          <Animated.View className="h-3.5 w-20 rounded-[7px] bg-skeleton" style={{ opacity }} />
        </View>
      </View>
    </View>
  )
}