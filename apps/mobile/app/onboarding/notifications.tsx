'use client'

import React, { useEffect, useRef, useState } from 'react'
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
import * as Notifications from 'expo-notifications'
import { LinearGradient } from 'expo-linear-gradient'
import { OnboardingLayout } from '@/components/ui'
import { semanticColors } from '@/theme/colors'

interface PreviewNotification {
  title: string
  body: string
  time: string
  icon: keyof typeof Ionicons.glyphMap
}

const NOTIFICATION_PREVIEW: PreviewNotification = {
  title: 'Trip countdown',
  body: '5 days until your weekend in Kyoto',
  time: '2m ago',
  icon: 'calendar',
}

function NotificationPreviewCard({
  item,
  softColor,
  primaryColor,
}: {
  item: PreviewNotification
  softColor: string
  primaryColor: string
}) {
  return (
    <View className="rounded-card border border-border bg-card p-4 shadow-lg shadow-black/10">
      <View className="flex-row items-center">
        <View
          className="mr-3.5 h-11 w-11 items-center justify-center rounded-input"
          style={{ backgroundColor: softColor }}
        >
          <Ionicons name={item.icon} size={22} color={primaryColor} />
        </View>

        <View className="flex-1">
          <View className="flex-row items-center">
            <Text
              className="flex-1 font-sans font-semibold text-[15px] text-foreground"
              numberOfLines={1}
            >
              {item.title}
            </Text>
            <Text className="ml-2 shrink-0 font-sans text-[11px] text-muted-foreground">{item.time}</Text>
          </View>
          <Text
            className="mt-0.5 font-sans text-[13px] leading-[18px] text-muted-foreground"
            numberOfLines={2}
          >
            {item.body}
          </Text>
        </View>
      </View>
    </View>
  )
}

export default function NotificationsPermissionScreen() {
  const router = useRouter()
  const { width: windowWidth, height: windowHeight } = useWindowDimensions()
  const [loading, setLoading] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Restrained entrance animation: the phone fades in, then the notification
  // card rises slightly into place. Runs once per mount, never on rerenders.
  const [phoneOpacity] = useState(() => new Animated.Value(0))
  const [cardOpacity] = useState(() => new Animated.Value(0))
  const [cardTranslateY] = useState(() => new Animated.Value(14))
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (hasAnimated.current) return
    hasAnimated.current = true

    const finishImmediately = () => {
      phoneOpacity.setValue(1)
      cardOpacity.setValue(1)
      cardTranslateY.setValue(0)
    }

    AccessibilityInfo.isReduceMotionEnabled()
      .then((reduceMotion) => {
        if (reduceMotion) {
          finishImmediately()
          return
        }

        Animated.timing(phoneOpacity, {
          toValue: 1,
          duration: 360,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start()

        Animated.sequence([
          Animated.delay(150),
          Animated.parallel([
            Animated.timing(cardOpacity, {
              toValue: 1,
              duration: 380,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
            Animated.timing(cardTranslateY, {
              toValue: 0,
              duration: 380,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
          ]),
        ]).start()
      })
      .catch(finishImmediately)
  }, [phoneOpacity, cardOpacity, cardTranslateY])

  // Responsive composition: the phone scales with the window and stays within
  // safe bounds on small devices. No hardcoded device dimensions.
  const PHONE_RATIO = 1.55
  const phoneWidth = Math.min(windowWidth * 0.55, 216, (windowHeight * 0.42) / PHONE_RATIO)
  const phoneHeight = phoneWidth * PHONE_RATIO
  const cardWidth = Math.min(phoneWidth + 72, windowWidth - 48)

  const handleFinish = () => {
    setError(null)
    router.replace('/onboarding/personalizing')
  }

  const handleEnableNotifications = async () => {
    setLoading(true)
    try {
      const { status } = await Notifications.requestPermissionsAsync()
      if (status === 'granted') {
        setStatusMessage('Notifications enabled ✓')
      }
    } catch {
      // Graceful fallback for mock or unsupported environments
    } finally {
      setLoading(false)
      setTimeout(() => {
        handleFinish()
      }, 250)
    }
  }

  const handleSkip = () => {
    handleFinish()
  }

  return (
    <OnboardingLayout
      title="Stay on top of your trip"
      currentStep={6}
      totalSteps={6}
      scrollable={false}
      primaryButtonText={statusMessage || 'Enable notifications'}
      primaryButtonLoading={loading}
      onPrimaryPress={handleEnableNotifications}
      secondaryButtonText="Maybe later"
      onSecondaryPress={handleSkip}
      onBack={() => {
        if (router.canGoBack()) {
          router.back()
        } else {
          router.replace('/onboarding/location')
        }
      }}
    >
      <View className="flex-1 px-6 pb-2" pointerEvents="none">
        {/* Phone mockup (open at bottom, dissolving into background) */}
        <View className="flex-1 items-center justify-center">
          <View style={{ width: cardWidth, height: phoneHeight }} className="relative items-center">
            {/* Elegant Device Frame */}
            <Animated.View style={{ opacity: phoneOpacity }}>
              <View
                style={{
                  width: phoneWidth,
                  height: phoneHeight,
                  borderTopLeftRadius: Math.round(phoneWidth * 0.18),
                  borderTopRightRadius: Math.round(phoneWidth * 0.18),
                }}
                className="items-center overflow-hidden border-t-2 border-r-2 border-l-2 border-border/80 bg-surface-muted"
              >
                {/* Dynamic Island / Speaker notch */}
                <View
                  style={{ width: phoneWidth * 0.28, height: 14, marginTop: 12 }}
                  className="rounded-full bg-border items-center justify-center"
                >
                  <View className="w-2 h-2 rounded-full bg-surface-muted self-end mr-1.5" />
                </View>
              </View>
            </Animated.View>

            {/* Preview notification emerging over the phone screen */}
            <Animated.View
              style={{
                top: Math.round(phoneHeight * 0.18),
                zIndex: 30,
                opacity: cardOpacity,
                transform: [{ translateY: cardTranslateY }],
              }}
              className="absolute inset-x-0"
            >
              <NotificationPreviewCard
                item={NOTIFICATION_PREVIEW}
                softColor={semanticColors.surfaceMuted}
                primaryColor={semanticColors.primary}
              />
            </Animated.View>

            {/* Gradient fade so the open phone bottom dissolves seamlessly into the background */}
            <LinearGradient
              colors={[
                'rgba(250, 249, 246, 0)',
                'rgba(250, 249, 246, 0.45)',
                'rgba(250, 249, 246, 0.88)',
                '#FAF9F6',
              ]}
              locations={[0, 0.38, 0.75, 1]}
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: Math.round(phoneHeight * 0.52),
                zIndex: 20,
              }}
              pointerEvents="none"
            />
          </View>
        </View>

        {/* Reassurance note / save error */}
        <View className="items-center">
          {error ? (
            <Text role="alert" className="px-4 text-center font-sans text-xs text-destructive">
              {error}
            </Text>
          ) : (
            <Text className="text-center font-sans text-xs text-muted-foreground">
              You can customize or silence notifications anytime in your account settings.
            </Text>
          )}
        </View>
      </View>
    </OnboardingLayout>
  )
}