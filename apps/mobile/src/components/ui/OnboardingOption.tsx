'use client'

import { Pressable, Text, View, StyleSheet } from 'react-native'
import styled from 'styled-components/native'
import { Ionicons } from '@expo/vector-icons'

interface OnboardingOptionProps {
  label: string
  description?: string
  icon?: string
  selected: boolean
  onPress: () => void
  disabled?: boolean
}

const OptionContainer = styled(Pressable)`
  flex-direction: row;
  align-items: center;
  padding: 16px;
  border-radius: 16px;
  border-width: 2px;
  border-color: ${({ $selected, theme }: { $selected?: boolean; theme: { colors: { primary: string; border: string; soft: string } } }) => $selected ? theme.colors.primary : theme.colors.border};
  background-color: ${({ $selected, theme }: { $selected?: boolean; theme: { colors: { soft: string; surface: string } } }) => $selected ? theme.colors.soft : theme.colors.surface};
  gap: 14px;
  min-height: 64px;
`

const IconWrapper = styled(View)`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  align-items: center;
  justify-content: center;
  background-color: ${({ $selected, theme }: { $selected?: boolean; theme: { colors: { primary: string; surface: string; border: string } } }) => $selected ? theme.colors.primary : theme.colors.border};
`

const Icon = styled(Ionicons)`
  font-size: 20px;
  color: ${({ $selected, theme }: { $selected?: boolean; theme: { colors: { primary: string } } }) => $selected ? '#FFFFFF' : theme.colors.primary};
`

const TextContainer = styled(View)`
  flex: 1;
  min-width: 0;
`

const LabelText = styled(Text)`
  font-family: ${({ $selected }: { $selected?: boolean }) => $selected ? 'Geist_Medium' : 'Geist_Regular'};
  font-size: 16px;
  color: ${({ theme }: { theme: { colors: { text: string } } }) => theme.colors.text};
`

const DescriptionText = styled(Text)`
  font-family: Geist_Regular;
  font-size: 13px;
  color: ${({ theme }: { theme: { colors: { muted: string } } }) => theme.colors.muted};
  margin-top: 2px;
`

const Checkmark = styled(Ionicons)`
  font-size: 24px;
  color: ${({ $selected, theme }: { $selected?: boolean; theme: { colors: { primary: string } } }) => $selected ? theme.colors.primary : 'transparent'};
`

export function OnboardingOption({ 
  label, 
  description, 
  icon, 
  selected, 
  onPress, 
  disabled = false,
}: OnboardingOptionProps) {
  return (
    <OptionContainer
      $selected={selected}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      accessibilityLabel={label}
    >
      {icon && (
        <IconWrapper $selected={selected}>
          <Icon name={icon as any} $selected={selected} />
        </IconWrapper>
      )}
      <TextContainer>
        <LabelText $selected={selected}>{label}</LabelText>
        {description && <DescriptionText>{description}</DescriptionText>}
      </TextContainer>
      <Checkmark name="checkmark-circle" $selected={selected} />
    </OptionContainer>
  )
}