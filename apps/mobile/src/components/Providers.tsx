'use client'

import React, { useState, useEffect } from 'react'
import { QueryClient, QueryClientProvider, onlineManager, focusManager } from '@tanstack/react-query'
import { Platform, AppState, type AppStateStatus } from 'react-native'
import * as Network from 'expo-network'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5,
            retry: 1,
            refetchOnWindowFocus: Platform.OS !== 'web',
          },
        },
      })
  )

  useEffect(() => {
    // 1. Online status management with Expo Network
    onlineManager.setEventListener((setOnline) => {
      let initialized = false

      const eventSubscription = Network.addNetworkStateListener((state) => {
        initialized = true
        setOnline(!!state.isConnected)
      })

      Network.getNetworkStateAsync()
        .then((state) => {
          if (!initialized) {
            setOnline(!!state.isConnected)
          }
        })
        .catch(() => {
          // getNetworkStateAsync can reject on some platforms or mock environments
        })

      return () => {
        eventSubscription.remove()
      }
    })

    // 2. Refetch on App focus via React Native AppState
    function onAppStateChange(status: AppStateStatus) {
      if (Platform.OS !== 'web') {
        focusManager.setFocused(status === 'active')
      }
    }

    const appStateSubscription = AppState.addEventListener('change', onAppStateChange)

    return () => {
      appStateSubscription.remove()
    }
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          {children}
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </QueryClientProvider>
  )
}
