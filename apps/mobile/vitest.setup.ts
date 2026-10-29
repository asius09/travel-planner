import '@testing-library/jest-native'
import 'react-native-gesture-handler/jestSetup'

// Mock expo modules
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
  useLocalSearchParams: () => ({}),
  Link: ({ children, ...props }: any) => <View {...props}>{children}</View>,
  Stack: ({ children }: any) => <View>{children}</View>,
  Tabs: ({ children }: any) => <View>{children}</View>,
}))

jest.mock('expo-image', () => ({
  Image: ({ source, ...props }: any) => <View {...props} />,
}))

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}))

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
}))

jest.mock('expo-notifications', () => ({
  requestPermissionsAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
}))

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}))

jest.mock('zustand', () => ({
  create: (fn: any) => fn((set: any, get: any) => ({})),
}))

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
  useInfiniteQuery: jest.fn(),
  useMutation: jest.fn(),
  QueryClient: jest.fn(),
  QueryClientProvider: ({ children }: any) => children,
}))

jest.mock('styled-components/native', () => ({
  default: {
    View: 'View',
    Text: 'Text',
    Pressable: 'Pressable',
    ImageBackground: 'ImageBackground',
    ScrollView: 'ScrollView',
    FlatList: 'FlatList',
  },
}))

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock')
  Reanimated.default.call = () => {}
  return Reanimated
})

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native').View
  return {
    GestureHandlerRootView: View,
    PanGestureHandler: View,
    TapGestureHandler: View,
  }
})