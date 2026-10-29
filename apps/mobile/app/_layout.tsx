import { Stack } from 'expo-router'
import { Providers } from '@/components/Providers'
import { useColorScheme } from 'react-native'
import { useThemeStore } from '@/store/themeStore'

export default function RootLayout() {
  const colorScheme = useColorScheme()
  const { theme, setTheme } = useThemeStore()

  // Sync theme with system color scheme on first load
  // In a real app, you'd persist user preference and use that
  
  return (
    <Providers>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: 'canvas' },
        }}
      >
        <Stack.Screen name="index" options={{ presentation: 'modal' }} />
        <Stack.Screen name="(auth)" options={{ presentation: 'modal' }} />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </Providers>
  )
}