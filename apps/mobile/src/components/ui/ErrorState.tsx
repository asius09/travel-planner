'use client'

import { View, Text, StyleSheet } from 'react-native'
import styled from 'styled-components/native'
import { Ionicons } from '@expo/vector-icons'

interface ErrorStateProps {
  title?: string
  message: string
  onRetry?: () => void
  retryLabel?: string
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
  background-color: #FFF0F0;
`

const Icon = styled(Ionicons)`
  font-size: 36px;
  color: #E57373;
`

const TitleText = styled(Text)`
  font-family: Geist_Medium;
  font-size: 20px;
  text-align: center;
  color: ${({ theme }) => theme.colors.text};
`

const MessageText = styled(Text)`
  font-family: Geist_Regular;
  font-size: 15px;
  text-align: center;
  color: ${({ theme }) => theme.colors.muted};
  line-height: 22px;
  max-width: 280px;
`

export function ErrorState({ 
  title = 'Something went wrong', 
  message, 
  onRetry, 
  retryLabel = 'Try again' 
}: ErrorStateProps) {
  return (
    <Container>
      <IconWrapper>
        <Icon name="alert-circle-outline" />
      </IconWrapper>
      <TitleText>{title}</TitleText>
      <MessageText>{message}</MessageText>
      {onRetry && (
        <Text style={styles.actionText}>{retryLabel}</Text>
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