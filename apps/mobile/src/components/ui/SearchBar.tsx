'use client'

import { TextInput, View, StyleSheet } from 'react-native'
import styled from 'styled-components/native'
import { Ionicons } from '@expo/vector-icons'

interface SearchBarProps {
  placeholder?: string
  value: string
  onChangeText: (text: string) => void
  onSubmit?: (text: string) => void
  onClear?: () => void
  autoFocus?: boolean
  style?: any
}

const SearchContainer = styled(View)`
  flex-direction: row;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: 14px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  padding-horizontal: 16px;
  gap: 12px;
  ${({ style }) => style}
`

const SearchIcon = styled(Ionicons)`
  color: ${({ theme }) => theme.colors.muted};
`

const StyledInput = styled(TextInput).attrs({
  placeholderTextColor: '#777F78',
})`
  flex: 1;
  font-family: Geist_Regular;
  font-size: 16px;
  color: ${({ theme }) => theme.colors.text};
  padding-vertical: 14px;
`

const ClearButton = styled(Pressable)`
  padding: 4px;
`

export function SearchBar({ 
  placeholder = 'Search places, regions, or experiences', 
  value, 
  onChangeText, 
  onSubmit, 
  onClear,
  autoFocus = false,
  style 
}: SearchBarProps) {
  return (
    <SearchContainer style={style}>
      <SearchIcon name="search" size={22} />
      <StyledInput
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        autoFocus={autoFocus}
        clearButtonMode="never"
      />
      {value && (
        <ClearButton onPress={onClear} accessibilityLabel="Clear search">
          <Ionicons name="close-circle" size={22} color="#777F78" />
        </ClearButton>
      )}
    </SearchContainer>
  )
}