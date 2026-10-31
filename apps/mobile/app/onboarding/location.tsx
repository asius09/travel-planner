'use client'

import React, { useState, useRef, useEffect } from 'react'
import {
  View,
  Text,
  Animated,
  Easing,
  AccessibilityInfo,
  useWindowDimensions,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import * as Location from 'expo-location'
import { OnboardingLayout } from '@/components/ui'
import { useThemeStore } from '@/store/themeStore'

export default function LocationPermissionScreen() {
  const router = useRouter()
  const { tokens } = useThemeStore()
  const { width: windowWidth, height: windowHeight } = useWindowDimensions()
  const [loading, setLoading] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  // Restrained entrance animation: the map surface fades in, the pin rises
  // into place, then the discovery radius reveals. Runs once per mount.
  const [surfaceOpacity] = useState(() => new Animated.Value(0))
  const [pinOpacity] = useState(() => new Animated.Value(0))
  const [pinTranslateY] = useState(() => new Animated.Value(12))
  const [ringsOpacity] = useState(() => new Animated.Value(0))
  const [ringsScale] = useState(() => new Animated.Value(0.94))
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (hasAnimated.current) return
    hasAnimated.current = true

    const finishImmediately = () => {
      surfaceOpacity.setValue(1)
      pinOpacity.setValue(1)
      pinTranslateY.setValue(0)
      ringsOpacity.setValue(1)
      ringsScale.setValue(1)
    }

    AccessibilityInfo.isReduceMotionEnabled()
      .then((reduceMotion) => {
        if (reduceMotion) {
          finishImmediately()
          return
        }

        Animated.timing(surfaceOpacity, {
          toValue: 1,
          duration: 360,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start()

        Animated.sequence([
          Animated.delay(140),
          Animated.parallel([
            Animated.timing(pinOpacity, {
              toValue: 1,
              duration: 380,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
            Animated.timing(pinTranslateY, {
              toValue: 0,
              duration: 380,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
          ]),
        ]).start()

        Animated.sequence([
          Animated.delay(240),
          Animated.parallel([
            Animated.timing(ringsOpacity, {
              toValue: 1,
              duration: 440,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
            Animated.timing(ringsScale, {
              toValue: 1,
              duration: 440,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
          ]),
        ]).start()
      })
      .catch(finishImmediately)
  }, [surfaceOpacity, pinOpacity, pinTranslateY, ringsOpacity, ringsScale])

  // Responsive map tile: scales with the window, clamped for small devices.
  const tileSize = Math.min(windowWidth * 0.74, 300, (windowHeight * 0.32) / 0.78)
  const tileHeight = tileSize * 0.78
  const outerRingSize = tileHeight * 0.92
  const innerDiscSize = tileHeight * 0.62

  const handleEnableLocation = async () => {
    if (loading) return
    setLoading(true)
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status === 'granted') {
        setStatusMessage('Location enabled ✓')
      }
    } catch {
      // Graceful fallback for mock or unsupported environments
    } finally {
      setLoading(false)
      // Advance to notifications step smoothly
      setTimeout(() => {
        router.push('/onboarding/notifications')
      }, 200)
    }
  }

  const handleSkip = () => {
    router.push('/onboarding/notifications')
  }

  return (
    <OnboardingLayout
      title="Find places near you"
      currentStep={5}
      totalSteps={6}
      scrollable={false}
      primaryButtonText={statusMessage || 'Enable location'}
      primaryButtonLoading={loading}
      onPrimaryPress={handleEnableLocation}
      secondaryButtonText="Not now"
      onSecondaryPress={handleSkip}
      onBack={() => {
        if (router.canGoBack()) {
          router.back()
        } else {
          router.replace('/onboarding/travel-party')
        }
      }}
    >
      <View className="flex-1 px-6" pointerEvents="none">
        <View className="flex-1 items-center justify-center">
          {/* Map-inspired surface with a central pin and a restrained radius */}
          <Animated.View
            style={{ opacity: surfaceOpacity }}
            className="items-center justify-center overflow-hidden rounded-card border border-border bg-soft"
          >
            <View style={{ width: tileSize, height: tileHeight }}>
              {/* Discovery radius rings */}
              <Animated.View
                style={{
                  opacity: ringsOpacity,
                  transform: [{ scale: ringsScale }],
                }}
                className="absolute inset-0 items-center justify-center"
              >
                <View
                  style={{
                    width: outerRingSize,
                    height: outerRingSize,
                    borderRadius: outerRingSize / 2,
                    borderWidth: 1,
                    borderColor: `${tokens.primary}1A`,
                  }}
                  className="items-center justify-center"
                >
                  <View
                    style={{
                      width: innerDiscSize,
                      height: innerDiscSize,
                      borderRadius: innerDiscSize / 2,
                    }}
                    className="bg-surface/60"
                  />
                </View>
              </Animated.View>

              {/* Central location pin */}
              <Animated.View
                style={{
                  opacity: pinOpacity,
                  transform: [{ translateY: pinTranslateY }],
                }}
                className="h-[72px] w-[72px] items-center justify-center rounded-full border border-border bg-surface shadow-xs"
              >
                <Ionicons name="location" size={34} color={tokens.primary} />
              </Animated.View>
            </View>
          </Animated.View>

          {/* Supporting copy */}
          <Text className="mt-8 max-w-[320px] text-center font-sans text-[15px] leading-6 text-muted">
            Your location helps us find relevant places nearby. You stay in control.
          </Text>
          <Text className="mt-2.5 max-w-[300px] text-center font-sans text-[13px] text-muted">
            Processed on-device only. Never tracked or sold.
          </Text>
        </View>
      </View>
    </OnboardingLayout>
  )
}
