// Type declarations for styled-components/native
import 'styled-components'
import { View, Text, Image, Pressable, ScrollView, FlatList, ImageBackground } from 'react-native'

declare module 'styled-components/native' {
  export const View: typeof View
  export const Text: typeof Text
  export const Image: typeof Image
  export const Pressable: typeof Pressable
  export const ScrollView: typeof ScrollView
  export const FlatList: typeof FlatList
  export const ImageBackground: typeof ImageBackground
  
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
}