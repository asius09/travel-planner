'use client'

import { Pressable, Text, StyleSheet } from 'react-native'
import styled from 'styled-components/native'

interface FilterChipProps {
  label: string
  selected?: boolean
  onPress?: () => void
  disabled?: boolean
  style?: any
}

const StyledChip = styled(Pressable)`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding-vertical: 8px;
  padding-horizontal: 16px;
  border-radius: 20px;
  background-color: ${({ $selected, theme }) => $selected ? theme.colors.primary : theme.colors.surface};
  border-width: 1px;
  border-color: ${({ $selected, theme }) => $selected ? theme.colors.primary : theme.colors.border};
  min-width: 72px;
  ${({ style }) => style}
`

const ChipText = styled(Text)`
  font-family: Geist_Medium;
  font-size: 14px;
  color: ${({ $selected, theme }) => $selected ? '#FFFFFF' : theme.colors.text};
`

export function FilterChip({ label, selected = false, onPress, disabled = false, style }: FilterChipProps) {
  return (
    <StyledChip
      $selected={selected}
      onPress={onPress}
      disabled={disabled}
      style={style}
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      accessibilityLabel={label}
    >
      <ChipText $selected={selected}>{label}</ChipText>
    </StyledChip>
  )
}