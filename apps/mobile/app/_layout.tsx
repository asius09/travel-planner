import '@/polyfills'
import './global.css'
import React, { useEffect } from 'react'
import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated'
import { Stack, useRouter, useSegments } from 'expo-router'
import { useFonts } from 'expo-font'
import { Providers } from '@/components/Providers'
import { useAuthStore } from '@/store/authStore'
import { useOnboardingStore, getResumeStep } from '@/store/onboardingStore'
import * as SplashScreen from 'expo-splash-screen'

SplashScreen.preventAutoHideAsync().catch(() => {})

configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
})

function NavigationGuard() {
  const router = useRouter()
  const segments = useSegments()
  const { user, isInitialized: isAuthReady, restoreSession } = useAuthStore()
  const { data: onboardingData } = useOnboardingStore()

  useEffect(() => {
    restoreSession()
  }, [])

  useEffect(() => {
    // Only evaluate routing after auth store rehydration
    if (!isAuthReady) return

    const rootSegment = segments[0] as string | undefined
    const inAuthGroup = rootSegment === 'auth'
    const inWelcome = !rootSegment || rootSegment === 'index'
    const inOnboardingGroup = rootSegment === 'onboarding'
    const inProtectedGroup =
      rootSegment === '(tabs)' || rootSegment === 'destination' || rootSegment === 'profile'

    const isAuthenticated = !!user
    const isOnboardingComplete = onboardingData.completed

    if (!isAuthenticated) {
      // Unauthenticated: cannot access onboarding or main app screens
      if (inOnboardingGroup || inProtectedGroup) {
        router.replace('/')
      }
    } else {
      // Authenticated:
      if (!isOnboardingComplete) {
        // Incomplete onboarding: direct to resume step
        if (inWelcome || inAuthGroup || inProtectedGroup) {
          const resumeStep = getResumeStep(onboardingData)
          router.replace(resumeStep)
        }
      } else {
        // Completed onboarding: cannot return to welcome or auth
        if (inWelcome || inAuthGroup) {
          router.replace('/(tabs)/explore')
        }
      }
    }
  }, [user, onboardingData.completed, isAuthReady, segments])

  return null
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Geist: require('../assets/fonts/Geist-Regular.ttf'),
    'Geist-Regular': require('../assets/fonts/Geist-Regular.ttf'),
    Geist_Regular: require('../assets/fonts/Geist-Regular.ttf'),
    'Geist-Medium': require('../assets/fonts/Geist-Medium.ttf'),
    Geist_Medium: require('../assets/fonts/Geist-Medium.ttf'),
    'Geist-SemiBold': require('../assets/fonts/Geist-SemiBold.ttf'),
    Geist_SemiBold: require('../assets/fonts/Geist-SemiBold.ttf'),
    'Geist-Bold': require('../assets/fonts/Geist-Bold.ttf'),
    Geist_Bold: require('../assets/fonts/Geist-Bold.ttf'),
  })

  // Hide native splash screen once fonts are loaded or when a font error occurs
  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {})
    }
  }, [fontsLoaded, fontError])

  // Safety fallback: splash screen must never block the app for more than 1.5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      SplashScreen.hideAsync().catch(() => {})
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <Providers>
      <NavigationGuard />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#F7F6F0' },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="auth/signin" options={{ presentation: 'modal' }} />
        <Stack.Screen name="auth/signup" options={{ presentation: 'modal' }} />
        <Stack.Screen name="onboarding/mood" />
        <Stack.Screen name="onboarding/duration" />
        <Stack.Screen name="onboarding/budget" />
        <Stack.Screen name="onboarding/travel-party" />
        <Stack.Screen name="onboarding/location" />
        <Stack.Screen name="onboarding/notifications" />
        <Stack.Screen name="onboarding/permissions" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="destination/[id]" />
        <Stack.Screen name="profile" />
      </Stack>
    </Providers>
  )
}
