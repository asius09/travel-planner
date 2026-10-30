import '@/polyfills'
import './global.css'
import { Stack } from 'expo-router'
import { Providers } from '@/components/Providers'

export default function RootLayout() {
  return (
    <Providers>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: 'canvas' },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="auth/signin" options={{ presentation: 'modal' }} />
        <Stack.Screen name="auth/signup" options={{ presentation: 'modal' }} />
      </Stack>
    </Providers>
  )
}