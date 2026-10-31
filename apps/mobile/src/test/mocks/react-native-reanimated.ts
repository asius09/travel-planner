import React from 'react'
import { View, Text } from 'react-native'

const mockComponent = (Comp: any) =>
  React.forwardRef((props: any, ref: any) => React.createElement(Comp, { ref, ...props }))

export const AnimatedView = mockComponent(View)
export const AnimatedText = mockComponent(Text)

export const LinearTransitionMock: any = {
  duration: () => LinearTransitionMock,
  easing: () => LinearTransitionMock,
  springify: () => LinearTransitionMock,
  dampingRatio: () => LinearTransitionMock,
}

export const LinearTransition = LinearTransitionMock

export const useSharedValue = (val: any) => ({ value: val })
export const useAnimatedStyle = (fn: any) => fn()
export const withSpring = (toValue: any) => toValue
export const withTiming = (toValue: any) => toValue
export const withDelay = (_delay: any, animation: any) => animation

export const Easing = {
  bezier: () => (t: number) => t,
  out: (fn: any) => fn,
  quad: (t: number) => t,
}

export const LayoutAnimationConfig = ({ children }: any) => children

const Animated = {
  View: AnimatedView,
  Text: AnimatedText,
}

export default Animated
