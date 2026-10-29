// Global type declarations for the mobile app

// @env module (Expo)
declare module '@env' {
  export const EXPO_PUBLIC_API_URL: string
  export const EXPO_PUBLIC_APP_SCHEME: string
}

// Pressable from react-native - make it globally available
import { Pressable as RNPressable, PressableProps } from 'react-native'
declare global {
  const Pressable: typeof RNPressable
  type Pressable = typeof RNPressable
  interface PressableProps extends PressableProps {}
  
  namespace JSX {
    interface IntrinsicAttributes {
      $selected?: boolean
      style?: any
    }
  }
}

// Extend styled-components theme
declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      canvas: string
      surface: string
      text: string
      muted: string
      border: string
      primary: string
      accent: string
      soft: string
    }
  }
  
  // Allow transient props ($prop) on styled components
  export interface StyledComponentProps<C extends React.ElementType, T extends DefaultTheme, Props, OmitKeys> {
    $selected?: boolean
    $hasError?: boolean
    $active?: boolean
    $completed?: boolean
    [key: `$\{string\}`]: any
  }
}

// Extend styled-components/native for React Native components
declare module 'styled-components/native' {
  import { 
    View, 
    Text, 
    Image, 
    Pressable as RNPressable, 
    ScrollView, 
    FlatList, 
    ImageBackground,
    TextInput,
  } from 'react-native'
  import { StyledComponent } from 'styled-components'
  
  // Extend FlatList with attrs
  export interface FlatListExtras<T = any> {
    attrs: (attrs: Partial<FlatListProps<T>>) => StyledComponent<typeof FlatList, DefaultTheme, any, never>
  }
  
  // Pre-styled React Native components with proper theme
  export const View: StyledComponent<typeof View, DefaultTheme, ViewStyle, never>;
  export const Text: StyledComponent<typeof Text, DefaultTheme, TextStyle, never>;
  export const Image: StyledComponent<typeof Image, DefaultTheme, ImageStyle, never>;
  export const Pressable: StyledComponent<typeof RNPressable, DefaultTheme, ViewStyle, never>;
  export const ScrollView: StyledComponent<typeof ScrollView, DefaultTheme, ViewStyle, never>;
  export const FlatList: StyledComponent<typeof FlatList, DefaultTheme, ViewStyle, never> & FlatListExtras;
  export const ImageBackground: StyledComponent<typeof ImageBackground, DefaultTheme, ViewStyle, never>;
  export const TextInput: StyledComponent<typeof TextInput, DefaultTheme, TextInputProps, never>;
}

// React Native types
import { ViewStyle, TextStyle, ImageStyle, FlatListProps, TextInputProps } from 'react-native'