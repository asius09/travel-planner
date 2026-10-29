// Mock react-native module for testing
import React from 'react'

export const View = React.forwardRef((props, ref) => {
  return React.createElement('View', { ref, ...props })
})

export const Text = React.forwardRef((props, ref) => {
  return React.createElement('Text', { ref, ...props })
})

export const Image = React.forwardRef((props, ref) => {
  return React.createElement('Image', { ref, ...props })
})

export const Pressable = React.forwardRef((props, ref) => {
  return React.createElement('Pressable', { ref, ...props })
})

export const ScrollView = React.forwardRef((props, ref) => {
  return React.createElement('ScrollView', { ref, ...props })
})

export const FlatList = React.forwardRef((props, ref) => {
  return React.createElement('FlatList', { ref, ...props })
})

export const ImageBackground = React.forwardRef((props, ref) => {
  return React.createElement('ImageBackground', { ref, ...props })
})

export const TextInput = React.forwardRef((props, ref) => {
  return React.createElement('TextInput', { ref, ...props })
})

export const StyleSheet = {
  create: (obj: any) => obj,
  hairlineWidth: 1,
}

export const ActivityIndicator = React.forwardRef((props, ref) => {
  return React.createElement('ActivityIndicator', { ref, ...props })
})

export const Switch = React.forwardRef((props, ref) => {
  return React.createElement('Switch', { ref, ...props })
})

export const TouchableOpacity = React.forwardRef((props, ref) => {
  return React.createElement('TouchableOpacity', { ref, ...props })
})

export const Alert = {
  alert: jest.fn(),
}

export const Platform = {
  OS: 'ios',
  select: (obj: any) => obj.ios,
}

export const Dimensions = {
  get: () => ({ width: 375, height: 812 }),
}

export const StatusBar = {
  setBackgroundColor: jest.fn(),
  setBarStyle: jest.fn(),
  setHidden: jest.fn(),
}

export const KeyboardAvoidingView = React.forwardRef((props, ref) => {
  return React.createElement('KeyboardAvoidingView', { ref, ...props })
})

export const SafeAreaView = React.forwardRef((props, ref) => {
  return React.createElement('SafeAreaView', { ref, ...props })
}

export const PixelRatio = {
  get: () => 1,
  getFontScale: () => 1,
}

export const InteractionManager = {
  runAfterInteractions: (task: () => void) => {
    task()
  },
}

export const Linking = {
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  openURL: jest.fn(),
}

export const AppState = {
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  currentState: 'active',
}

export const NetInfo = {
  addEventListener: jest.fn(),
  fetch: jest.fn().mockResolvedValue({ isConnected: true }),
}

export const AsyncStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}

export default {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  FlatList,
  ImageBackground,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Switch,
  TouchableOpacity,
  Alert,
  Platform,
  Dimensions,
  StatusBar,
  KeyboardAvoidingView,
  SafeAreaView,
  PixelRatio,
  InteractionManager,
  Linking,
  AppState,
  NetInfo,
  AsyncStorage,
}