'use client'

import React, { useEffect, useState, useRef } from 'react'
import { View, StyleSheet, Animated, Easing } from 'react-native'
import { useRouter } from 'expo-router'
import Svg, {
  Path,
  Circle,
  G,
  Defs,
  LinearGradient,
  Stop,
  Rect,
} from 'react-native-svg'
import { TextMorph } from '@/components/ui'
import { useOnboardingStore } from '@/store/onboardingStore'
import { semanticColors } from '@/theme/colors'

const STAGES = [
  {
    title: 'Personalizing your experience',
    subtitle: 'Setting up your travel profile',
  },
  {
    title: 'Curating trips for your mood',
    subtitle: 'Matching destinations to your budget',
  },
  {
    title: 'Your journey is ready',
    subtitle: 'Opening your tailored explore feed',
  },
]

export default function PersonalizingScreen() {
  const router = useRouter()
  const completeOnboarding = useOnboardingStore((s) => s.completeOnboarding)
  const [stageIndex, setStageIndex] = useState(0)

  // Subtle continuous rotation & breathing pulse for vector compass
  const rotateAnim = useRef(new Animated.Value(0)).current
  const pulseAnim = useRef(new Animated.Value(1)).current
  const isNavigatingRef = useRef(false)

  useEffect(() => {
    // Start ambient animations
    const rotateLoop = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    )

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.98,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    )

    rotateLoop.start()
    pulseLoop.start()

    // Trigger store completion in the background concurrently
    const completionPromise = completeOnboarding().catch(() => {
      // Gracefully handle offline or network delay
    })

    // Advance stage titles with TextMorph
    const timer1 = setTimeout(() => {
      setStageIndex(1)
    }, 650)

    const timer2 = setTimeout(() => {
      setStageIndex(2)
    }, 1300)

    const finishTimer = setTimeout(async () => {
      if (isNavigatingRef.current) return
      isNavigatingRef.current = true
      await completionPromise
      router.replace('/(tabs)/explore')
    }, 1850)

    return () => {
      rotateLoop.stop()
      pulseLoop.stop()
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(finishTimer)
    }
  }, [completeOnboarding, router, rotateAnim, pulseAnim])

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  })

  const currentStage = STAGES[stageIndex] ?? STAGES[0]

  return (
    <View
      style={[styles.container, { backgroundColor: semanticColors.background }]}
      accessibilityRole="progressbar"
      accessibilityLabel="Personalizing your app"
    >
      {/* Decorative Vector Travel Illustration */}
      <View style={styles.illustrationContainer}>
        {/* Soft Ambient Radial Halo */}
        <Animated.View
          style={[
            styles.halo,
            {
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <Svg width={240} height={240} viewBox="0 0 240 240" fill="none">
            <Defs>
              <LinearGradient id="ambientGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor={semanticColors.accent} stopOpacity="0.18" />
                <Stop offset="65%" stopColor={semanticColors.primary} stopOpacity="0.08" />
                <Stop offset="100%" stopColor={semanticColors.secondary} stopOpacity="0" />
              </LinearGradient>
              <LinearGradient id="needleAccent" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor={semanticColors.accent} />
                <Stop offset="100%" stopColor={semanticColors.primary} />
              </LinearGradient>
              <LinearGradient id="needlePrimary" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor={semanticColors.primary} />
                <Stop offset="100%" stopColor={semanticColors.foreground} stopOpacity="0.8" />
              </LinearGradient>
            </Defs>
            <Circle cx={120} cy={120} r={105} fill="url(#ambientGlow)" />
          </Svg>
        </Animated.View>

        {/* Orbiting Waypoint Ring */}
        <Animated.View
          style={[
            styles.orbitRing,
            {
              transform: [{ rotate: spin }],
            },
          ]}
        >
          <Svg width={200} height={200} viewBox="0 0 200 200" fill="none">
            <Circle
              cx={100}
              cy={100}
              r={92}
              stroke={semanticColors.border}
              strokeWidth={1.5}
              strokeDasharray="6 8"
              opacity={0.65}
            />
            {/* Cardinal Dots */}
            <Circle cx={100} cy={8} r={3} fill={semanticColors.accent} />
            <Circle cx={192} cy={100} r={2.5} fill={semanticColors.primary} opacity={0.7} />
            <Circle cx={100} cy={192} r={2.5} fill={semanticColors.primary} opacity={0.7} />
            <Circle cx={8} cy={100} r={2.5} fill={semanticColors.primary} opacity={0.7} />
          </Svg>
        </Animated.View>

        {/* Centered Compass & Exploration Badge */}
        <View style={styles.compassCenter}>
          <Svg width={140} height={140} viewBox="0 0 140 140" fill="none">
            {/* Outer Bezel */}
            <Circle
              cx={70}
              cy={70}
              r={60}
              fill={semanticColors.surface}
              stroke={semanticColors.border}
              strokeWidth={2}
            />
            {/* Inner Ring */}
            <Circle
              cx={70}
              cy={70}
              r={50}
              fill={semanticColors.background}
              stroke={semanticColors.border}
              strokeWidth={1}
            />

            {/* Subtle Map Flight Path in the background */}
            <Path
              d="M38 88 C48 68, 62 76, 74 60 C84 46, 96 52, 104 42"
              stroke={semanticColors.muted}
              strokeWidth={2}
              strokeDasharray="3 4"
              strokeLinecap="round"
            />
            <Circle cx={104} cy={42} r={3} fill={semanticColors.accent} />

            {/* Compass Rose Needles */}
            <G transform="rotate(32 70 70)">
              {/* North Needle (Accent) */}
              <Path
                d="M70 28 L77 70 L70 66 Z"
                fill={semanticColors.accent}
              />
              <Path
                d="M70 28 L63 70 L70 66 Z"
                fill={semanticColors.primary}
              />

              {/* South Needle (Primary / Foreground) */}
              <Path
                d="M70 112 L77 70 L70 74 Z"
                fill={semanticColors.primary}
                opacity={0.8}
              />
              <Path
                d="M70 112 L63 70 L70 74 Z"
                fill={semanticColors.mutedForeground}
                opacity={0.5}
              />

              {/* Center Pivot Stud */}
              <Circle
                cx={70}
                cy={70}
                r={6}
                fill={semanticColors.surface}
                stroke={semanticColors.primary}
                strokeWidth={2}
              />
              <Circle cx={70} cy={70} r={2.5} fill={semanticColors.accent} />
            </G>
          </Svg>
        </View>
      </View>

      {/* TextMorph Status Header (Pure TextMorph with zero translation / wrapper animation) */}
      <View style={styles.textContainer}>
        <View style={styles.titleWrap}>
          <TextMorph
            preset="smooth"
            variant="text"
            textStyle={{
              fontFamily: 'Geist',
              fontSize: 22,
              lineHeight: 28,
              fontWeight: '600',
              color: semanticColors.foreground,
              textAlign: 'center',
              letterSpacing: -0.4,
            }}
            duration={240}
          >
            {currentStage.title}
          </TextMorph>
        </View>

        <View style={styles.subtitleWrap}>
          <TextMorph
            preset="smooth"
            variant="text"
            textStyle={{
              fontFamily: 'Geist',
              fontSize: 14,
              lineHeight: 20,
              fontWeight: '400',
              color: semanticColors.mutedForeground,
              textAlign: 'center',
            }}
            duration={200}
          >
            {currentStage.subtitle}
          </TextMorph>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  illustrationContainer: {
    width: 240,
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 36,
    position: 'relative',
  },
  halo: {
    position: 'absolute',
    width: 240,
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbitRing: {
    position: 'absolute',
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compassCenter: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  textContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 68,
    maxWidth: 320,
  },
  titleWrap: {
    minHeight: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitleWrap: {
    minHeight: 24,
    marginTop: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
