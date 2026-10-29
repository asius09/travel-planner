'use client'

import { View, Text, StyleSheet } from 'react-native'
import styled from 'styled-components/native'
import { Ionicons } from '@expo/vector-icons'

interface EmptyStateProps {
  icon?: string
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}

const Container = styled(View)`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: 32px;
  gap: 16px;
`

const IconWrapper = styled(View)`
  width: 80px;
  height: 80px;
  border-radius: 40px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.soft};
`

const Icon = styled(Ionicons)`
  font-size: 36px;
  color: ${({ theme }) => theme.colors.primary};
`

const TitleText = styled(Text)`
  font-family: Geist_Medium;
  font-size: 20px;
  text-align: center;
  color: ${({ theme }) => theme.colors.text};
`

const DescriptionText = styled(Text)`
  font-family: Geist_Regular;
  font-size: 15px;
  text-align: center;
  color: ${({ theme }) => theme.colors.muted};
  line-height: 22px;
  max-width: 280px;
`

export function EmptyState({ 
  icon = 'compass-outline', 
  title, 
  description, 
  actionLabel, 
  onAction 
}: EmptyStateProps) {
  return (
    <Container>
      <IconWrapper>
        <Icon name={icon} />
      </IconWrapper>
      <TitleText>{title}</TitleText>
      <DescriptionText>{description}</DescriptionText>
      {actionLabel && onAction && (
        <Text style={styles.actionText}>{actionLabel}</Text>
      )}
    </Container>
  )
}

const styles = StyleSheet.create({
  actionText: {
    fontFamily: 'Geist_Medium',
    fontSize: 15,
    color: '#263F35',
  },
})