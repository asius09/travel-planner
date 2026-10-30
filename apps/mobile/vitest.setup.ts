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
