'use client'

import { View, StyleSheet, ViewProps } from 'react-native'
import styled from 'styled-components/native'

interface CardProps extends ViewProps {
  children: React.ReactNode
  onPress?: () => void
  pressable?: boolean
}

const StyledCard = styled(View)`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: 20px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  overflow: hidden;
`

const PressableCard = styled(StyledCard).attrs({ pressable: true })``

export function Card({ children, style, onPress, pressable = false, ...props }: CardProps) {
  const Component = pressable ? PressableCard : StyledCard
  
  return (
    <Component
      style={style}
      onPress={onPress}
      accessibilityRole={pressable ? 'button' : undefined}
      accessibilityState={{ disabled: !pressable }}
      {...props}
    >
      {children}
    </Component>
  )
}

export function CardHeader({ children, style }: { children: React.ReactNode; style?: any }) {
  return <View style={[styles.header, style]}>{children}</View>
}

export function CardContent({ children, style }: { children: React.ReactNode; style?: any }) {
  return <View style={[styles.content, style]}>{children}</View>
}

export function CardFooter({ children, style }: { children: React.ReactNode; style?: any }) {
  return <View style={[styles.footer, style]}>{children}</View>
}

const styles = StyleSheet.create({
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7DF',
  },
  content: {
    padding: 16,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7DF',
  },
})