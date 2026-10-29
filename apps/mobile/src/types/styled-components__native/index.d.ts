// Type declarations for styled-components/native - complete API coverage
import 'styled-components'
import { 
  View, 
  Text, 
  Image, 
  Pressable as RNPressable, 
  ScrollView, 
  FlatList, 
  ImageBackground,
  StyleProp, 
  ViewStyle, 
  TextStyle, 
  ImageStyle,
  FlatListProps,
  PressableProps,
  TextInput,
  TextInputProps,
} from 'react-native'

declare module 'styled-components/native' {
  import { 
    ComponentType, 
    TemplateStringsArray, 
    ForwardRefExoticComponent,
    RefAttributes,
    ReactNode 
  } from 'react'
  import { 
    DefaultTheme, 
    StyledComponent, 
    Interpolation, 
    CSSObject, 
    FlattenSimpleInterpolation,
    StyledComponentProps,
    StyledComponentPropsWithAs,
  } from 'styled-components'
  
  // Extended theme with our color tokens
  export interface ExtendedTheme extends DefaultTheme {
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
  
  // Allow transient props ($prop) on all styled components
  export interface StyledComponentProps<C extends React.ElementType, T extends DefaultTheme, Props, OmitKeys> 
    extends StyledComponentProps<C, T, Props, OmitKeys> {
    $selected?: boolean
    $hasError?: boolean
    $active?: boolean
    $completed?: boolean
    [key: `$\{string\}`]: any
  }
  
  // The main styled function - supports both component and template literal forms
  // When called with a component, returns a function that accepts template strings
  // The callback receives { theme: ExtendedTheme } & component props
  export function styled<C extends ComponentType<any>, Props = {}>(
    component: C
  ): (template: TemplateStringsArray, ...interpolations: (FlattenSimpleInterpolation | ((props: { theme: ExtendedTheme } & React.ComponentProps<C> & Props) => any))[]) => StyledComponent<C, ExtendedTheme, Props, never>
  
  // Tagged template literal form (for web elements)
  export function styled(
    template: TemplateStringsArray,
    ...interpolations: (FlattenSimpleInterpolation | ((props: { theme: ExtendedTheme }) => any))[]
  ): StyledComponent<'div', ExtendedTheme, {}, never>
  
  // Pre-styled React Native components with full prop support
  export const View: StyledComponent<typeof View, ExtendedTheme, ViewStyle & { $selected?: boolean; $hasError?: boolean }, never>;
  export const Text: StyledComponent<typeof Text, ExtendedTheme, TextStyle & { $selected?: boolean }, never>;
  export const Image: StyledComponent<typeof Image, ExtendedTheme, ImageStyle, never>;
  export const Pressable: StyledComponent<
    typeof RNPressable, 
    ExtendedTheme, 
    ViewStyle & PressableProps & { selected?: boolean; $selected?: boolean }, 
    never
  >;
  export const ScrollView: StyledComponent<typeof ScrollView, ExtendedTheme, ViewStyle, never>;
  export const FlatList: StyledComponent<
    typeof FlatList, 
    ExtendedTheme, 
    ViewStyle & FlatListProps<any> & { $selected?: boolean }, 
    never
  > & {
    attrs: <T>(attrs: Partial<FlatListProps<T>>) => StyledComponent<typeof FlatList, ExtendedTheme, ViewStyle & FlatListProps<T>, never>;
  };
  export const ImageBackground: StyledComponent<typeof ImageBackground, ExtendedTheme, ViewStyle, never>;
  export const TextInput: StyledComponent<typeof TextInput, ExtendedTheme, TextInputProps, never>;
  
  // Re-export theme
  export { ExtendedTheme as DefaultTheme }
  
  // Default export
  export default styled;
}

// Global types for transient props in JSX
declare global {
  namespace JSX {
    interface IntrinsicAttributes {
      $selected?: boolean
      $hasError?: boolean
      $active?: boolean
      $completed?: boolean
    }
  }
}