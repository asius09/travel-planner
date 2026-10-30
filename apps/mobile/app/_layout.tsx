import '@/polyfills'
import './global.css'
import React, { useEffect, useState } from 'react'
import { View, ActivityIndicator } from 'react-native'
import { Stack, useRouter, useSegments } from 'expo-router'
import { Providers } from '@/components/Providers'
import { useAuthStore } from '@/store/authStore'
import { useOnboardingStore, getResumeStep } from '@/store/onboardingStore'

function NavigationGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const segments = useSegments()
  const { user, isInitialized: isAuthReady, restoreSession } = useAuthStore()
  const { data: onboardingData, isInitialized: isOnboardingReady } = useOnboardingStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    restoreSession()
  }, [])

  useEffect(() => {
    // Wait until stores have hydrated from storage and component is mounted
    if (!mounted || !isAuthReady) return

    const rootSegment = segments[0] as string | undefined
    const inAuthGroup = rootSegment === 'auth'
    const inWelcome = !rootSegment || rootSegment === 'index'
    const inOnboardingGroup = rootSegment === 'onboarding'
    const inProtectedGroup = rootSegment === '(tabs)' || rootSegment === 'destination'

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
          router.replace(resumeStep as any)
        }
      } else {
        // Completed onboarding: cannot return to welcome or auth
        if (inWelcome || inAuthGroup) {
          router.replace('/(tabs)/explore')
        }
      }
    }
  }, [user, onboardingData.completed, isAuthReady, segments, mounted])

  // Prevent flashing of the wrong screen while rehydrating auth state
  if (!mounted || !isAuthReady) {
    return (
      <View style={{ flex: 1, backgroundColor: '#F7F6F0', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#263F35" />
      </View>
    )
  }

  return <>{children}</>
}

export default function RootLayout() {
  return (
    <Providers>
      <NavigationGuard>
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
        </Stack>
      </NavigationGuard>
    </Providers>
  )
}
