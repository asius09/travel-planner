// Minimal setup file - mock react-native async storage and environment
import { vi } from 'vitest'

// Define React Native global __DEV__ and jest compatibility shim
;(globalThis as any).__DEV__ = true
;(globalThis as any).jest = vi

// Mock crypto if not present
if (typeof (globalThis as any).crypto === 'undefined') {
  ;(globalThis as any).crypto = {
    randomUUID: () => '11111111-2222-3333-4444-555555555555',
    getRandomValues: (arr: any) => arr,
  }
}

const storage = new Map<string, string>()

const mockAsyncStorage = {
  getItem: vi.fn((key: string) => Promise.resolve(storage.get(key) ?? null)),
  setItem: vi.fn((key: string, value: string) => {
    storage.set(key, value)
    return Promise.resolve()
  }),
  removeItem: vi.fn((key: string) => {
    storage.delete(key)
    return Promise.resolve()
  }),
  multiGet: vi.fn((keys: string[]) => Promise.resolve(keys.map((k) => [k, storage.get(k) ?? null]))),
  multiSet: vi.fn((entries: [string, string][]) => {
    entries.forEach(([k, v]) => storage.set(k, v))
    return Promise.resolve()
  }),
  multiRemove: vi.fn((keys: string[]) => {
    keys.forEach((k) => storage.delete(k))
    return Promise.resolve()
  }),
  clear: vi.fn(() => {
    storage.clear()
    return Promise.resolve()
  }),
  getAllKeys: vi.fn(() => Promise.resolve(Array.from(storage.keys()))),
}

vi.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: mockAsyncStorage,
  ...mockAsyncStorage,
}))

vi.mock('expo-linear-gradient', () => {
  const React = require('react')
  return {
    LinearGradient: ({ children, style }: any) =>
      React.createElement('LinearGradient', { style }, children),
  }
})

vi.mock('expo-blur', () => {
  const React = require('react')
  return {
    BlurView: ({ children, style }: any) =>
      React.createElement('BlurView', { style }, children),
  }
})

vi.mock('expo-haptics', () => ({
  notificationAsync: vi.fn(() => Promise.resolve()),
  impactAsync: vi.fn(() => Promise.resolve()),
  selectionAsync: vi.fn(() => Promise.resolve()),
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
  },
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
}))

vi.mock('expo-constants', () => ({
  default: {
    expoConfig: {
      hostUri: 'localhost:8081',
    },
  },
}))

vi.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: vi.fn(() => Promise.resolve()),
  hideAsync: vi.fn(() => Promise.resolve()),
}))

vi.mock('expo-font', () => ({
  useFonts: () => [true, null],
  loadAsync: vi.fn(() => Promise.resolve()),
  isLoaded: vi.fn(() => true),
}))

vi.mock('expo-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  useLocalSearchParams: () => ({}),
  useSegments: () => [],
}))

vi.mock('expo-image', () => {
  const React = require('react')
  return {
    Image: ({ children, style, source, ...props }: any) =>
      React.createElement('Image', { style, source, ...props }, children),
  }
})

vi.mock('@expo/vector-icons', () => {
  const React = require('react')
  const MockIcon = (props: any) => React.createElement('Icon', props)
  return {
    Ionicons: MockIcon,
    MaterialIcons: MockIcon,
    FontAwesome: MockIcon,
  }
})
