'use client'

import { Pressable, Text, StyleSheet } from 'react-native'
import styled from 'styled-components/native'

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  onPress?: () => void
  children: React.ReactNode
  fullWidth?: boolean
}

const StyledButton = styled(Pressable)<ButtonProps>`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  padding-vertical: ${({ size }: { size?: 'sm' | 'md' | 'lg' }) => size === 'sm' ? '8px' : size === 'lg' ? '16px' : '12px'};
  padding-horizontal: ${({ size }: { size?: 'sm' | 'md' | 'lg' }) => size === 'sm' ? '16px' : size === 'lg' ? '24px' : '20px'};
  width: ${({ fullWidth }: { fullWidth?: boolean }) => fullWidth ? '100%' : 'auto'};
  opacity: ${({ disabled, loading }: { disabled?: boolean; loading?: boolean }) => disabled || loading ? 0.6 : 1};
  background-color: ${({ variant, theme }: { variant?: string; theme: { colors: { primary: string; accent: string } } }) => {
    switch (variant) {
      case 'primary': return theme.colors.primary
      case 'secondary': return theme.colors.accent
      case 'outline': return 'transparent'
      case 'ghost': return 'transparent'
      default: return theme.colors.primary
    }
  }};
  border-width: ${({ variant }: { variant?: string }) => variant === 'outline' ? '2px' : 0};
  border-color: ${({ variant, theme }: { variant?: string; theme: { colors: { primary: string } } }) => variant === 'outline' ? theme.colors.primary : 'transparent'};
`

const ButtonText = styled(Text)<ButtonProps>`
  font-family: Geist_Medium;
  font-size: ${({ size }: { size?: 'sm' | 'md' | 'lg' }) => size === 'sm' ? '14px' : size === 'lg' ? '18px' : '16px'};
  color: ${({ variant, theme }: { variant?: string; theme: { colors: { primary: string; text: string } } }) => {
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