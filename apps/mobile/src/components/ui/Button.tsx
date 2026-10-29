'use client'

import { Pressable, Text, StyleSheet, PressableProps } from 'react-native'
import styled from 'styled-components/native'

interface ButtonProps extends PressableProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  fullWidth?: boolean
}

const StyledButton = styled(Pressable)<ButtonProps>`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  padding-vertical: ${({ size }) => size === 'sm' ? '8px' : size === 'lg' ? '16px' : '12px'};
  padding-horizontal: ${({ size }) => size === 'sm' ? '16px' : size === 'lg' ? '24px' : '20px'};
  width: ${({ fullWidth }) => fullWidth ? '100%' : 'auto'};
  opacity: ${({ disabled, loading }) => disabled || loading ? 0.6 : 1};
  background-color: ${({ variant, theme }) => {
    switch (variant) {
      case 'primary': return theme.colors.primary
      case 'secondary': return theme.colors.accent
      case 'outline': return 'transparent'
      case 'ghost': return 'transparent'
      default: return theme.colors.primary
    }
  }};
  border-width: ${({ variant }) => variant === 'outline' ? '2px' : 0};
  border-color: ${({ variant, theme }) => variant === 'outline' ? theme.colors.primary : 'transparent'};
`

const ButtonText = styled(Text)<ButtonProps>`
  font-family: Geist_Medium;
  font-size: ${({ size }) => size === 'sm' ? '14px' : size === 'lg' ? '18px' : '16px'};
  color: ${({ variant, theme }) => {
    switch (variant) {
      case 'primary': return '#FFFFFF'
      case 'secondary': return theme.colors.text
      case 'outline': return theme.colors.primary
      case 'ghost': return theme.colors.primary
      default: return '#FFFFFF'
    }
  }};
`

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  disabled = false, 
  loading = false, 
  onPress, 
  children, 
  fullWidth = false,
  ...props 
}: ButtonProps) {
  return (
    <StyledButton
      variant={variant}
      size={size}
      disabled={disabled || loading}
      fullWidth={fullWidth}
      onPress={onPress}
      accessibilityState={{ disabled: disabled || loading }}
      accessibilityRole="button"
      {...props}
    >
      {loading ? (
        <Text style={styles.loadingText}>Loading...</Text>
      ) : (
        <ButtonText variant={variant} size={size}>{children}</ButtonText>
      )}
    </StyledButton>
  )
}

const styles = StyleSheet.create({
  loadingText: {
    color: '#FFFFFF',
    fontFamily: 'Geist_Medium',
  },
})